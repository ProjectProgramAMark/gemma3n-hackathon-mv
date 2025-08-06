from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig, pipeline
from unsloth import FastLanguageModel
# leaving Trainer out for now to use SFTTrainer instead
from datasets import load_dataset
from peft import PeftModel
import os
import torch
import argparse
import random
import logging
import re

# Evaluating for ChatML formatted prompt

def load_model(model_id, unsloth=False):
    if not unsloth:
        bnb_config = BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_compute_dtype=torch.float16, bnb_4bit_quant_type="nf4")
        base_model = AutoModelForCausalLM.from_pretrained(model_id, quantization_config=bnb_config, device_map='auto')
    else:
        base_model, tokenizer = FastLanguageModel.from_pretrained(
            model_name = model_id,
            max_seq_length = 2048,
            dtype = None,
            load_in_4bit = True,
        )
    return base_model

def merge_model(base_model, model_path, unsloth=False):
    if not unsloth:
        ft_model = PeftModel.from_pretrained(base_model, model_path)
        ft_model.to("cuda")
    else:
        # Do model patching and add fast LoRA weights
        ft_model = FastLanguageModel.get_peft_model(
            base_model,
            r = 16,
            target_modules = ["q_proj", "k_proj", "v_proj", "o_proj",
                            "gate_proj", "up_proj", "down_proj",],
            lora_alpha = 16,
            lora_dropout = 0, # Supports any, but = 0 is optimized
            bias = "none",    # Supports any, but = "none" is optimized
            # [NEW] "unsloth" uses 30% less VRAM, fits 2x larger batch sizes!
            use_gradient_checkpointing = "unsloth", # True or "unsloth" for very long context
            random_state = 3407,
            max_seq_length = 2048,
            use_rslora = False,  # We support rank stabilized LoRA
            loftq_config = None, # And LoftQ
        )
    return ft_model

def generate_tokenizer(model_id, base_model, anton, prompt_format, unsloth=False):
    # for anton adapters, need to resize model and token embeddings for added token special vocabularly
    if anton:
        tokenizer = AutoTokenizer.from_pretrained(model_id, use_fast=False, add_bos_token=True)
        DEFAULT_PAD_TOKEN = "<|pad|>"
        DEFAULT_EOS_TOKEN = "<|endoftext|>"
        DEFAULT_UNK_TOKEN = "<|unk|>"

        special_tokens_dict = dict()
        if tokenizer.pad_token is None:
            special_tokens_dict["pad_token"] = DEFAULT_PAD_TOKEN
        if tokenizer.eos_token is None:
            special_tokens_dict["eos_token"] = DEFAULT_EOS_TOKEN
        if tokenizer.unk_token is None:
            special_tokens_dict["unk_token"] = DEFAULT_UNK_TOKEN

        tokenizer.add_special_tokens(special_tokens_dict)
        base_model.resize_token_embeddings(len(tokenizer))
    if prompt_format == "llama":
        tokenizer = AutoTokenizer.from_pretrained(model_id, use_fast=False, add_bos_token=True)
        if tokenizer.pad_token is None:
            DEFAULT_PAD_TOKEN = "<|pad|>"
            DEFAULT_UNK_TOKEN = "<|unk|>"
            special_tokens_dict = dict()
            if tokenizer.pad_token is None:
                special_tokens_dict["pad_token"] = DEFAULT_PAD_TOKEN
            if tokenizer.unk_token is None:
                special_tokens_dict["unk_token"] = DEFAULT_UNK_TOKEN
            tokenizer.add_special_tokens(special_tokens_dict)
            base_model.resize_token_embeddings(len(tokenizer))

    # Re-init the tokenizer so it doesn't add padding or eos token
    if not unsloth:
        padding_side = "left" if prompt_format == "mistral" else "right"
        ft_tokenizer = AutoTokenizer.from_pretrained(model_id, use_fast=False, padding_side=padding_side)
    else:
        model, ft_tokenizer = FastLanguageModel.from_pretrained(
            model_name=model_id,
            max_seq_length=2048,
            dtype=None,
            load_in_4bit=True,
        )

    if ft_tokenizer.pad_token is None:
        ft_tokenizer.pad_token = ft_tokenizer.unk_token

    return ft_tokenizer

def format_prompt(user_input, chat, prompt_format):
    system_prompt = f"""
    Assist a non-verbal autistic individual in communicating their thoughts or needs through selected images.
    Your task: infer and articulate the message in first-person, i.e. using I and pretending you are the user.
    - Be concise and only provide the answer to the following input.
    - Be empathetic and direct.
    - Look for deeper meanings in the input.
    - Keep the tone practical and straightforward."""

    if chat:
        if prompt_format == "mistral":
            # for mistral
            ft_model_input = [
                {"role": "user", "content": f"""Assist a non-verbal autistic individual in communicating their thoughts or needs through selected words.
                Your task: infer and articulate the message in first-person, i.e. using I and pretending you are the user.
                - Be concise and only provide the answer to the following input.
                - Look for deeper meanings in the input.
                - Keep the tone practical and straightforward.
                    input: {user_input}""",
                },
                { "role": "assistant", "content": ""}
            ]
        elif prompt_format == "llama":
            # for llama
            ft_model_input = [
                {"role": "system", "content": f"""
                Assist a non-verbal autistic individual in communicating their thoughts or needs through selected images.
                Your task: infer and articulate the message in first-person, i.e. using I and pretending you are the user.
                - Be concise and only provide the answer to the following input.
                - Be empathetic and direct.
                - Look for deeper meanings in the input.
                - Keep the tone practical and straightforward."""},
                {"role": "user", "content": f"{user_input}"},
                {"role": "assistant", "content": ""}
            ]
        elif prompt_format == "gemma":
            ft_model_input = [
                {"role": "user", "content": f"""{system_prompt}\ninput: {user_input}"""},
                {"role": "assistant", "content": ""}
            ]
        else:
            raise ValueError('ChatML prompt format not recognized.')
    else:
        ### Evaluating for non-ChatML formatted prompt
        ft_model_input = f"""[INST] Assist a non-verbal autistic individual in communicating their thoughts or needs through selected text input.
        Your task: infer and articulate the message in first-person, using simple, direct language with empathy and clarity. Be concise. 
        Only give the output for the input provided. Do not come up with new inputs after. Assume the user is trying to communicate with someone.
        Usually those are wants, desires, needs, etc.

        ### Input: {user_input} [/INST]
        ### Output:"""

    return ft_model_input

def generate_output(ft_tokenizer, ft_model, ft_model_input, chat, prompt_format="mistral"):
    if chat:
        ft_model_input_tokenized = ft_tokenizer.apply_chat_template(ft_model_input, tokenize=True, add_generation_prompt=True, return_tensors="pt").to("cuda")
    else:
        ft_model_input_tokenized = ft_tokenizer(ft_model_input, return_tensors="pt").to("cuda")

    # Generate model output with specified parameters
    generated_output = ft_model.generate(
        **ft_model_input_tokenized if chat else ft_model_input_tokenized,
        max_new_tokens=100,
        pad_token_id=ft_tokenizer.unk_token_id,
        do_sample=False,
        output_scores=True
    )
    ft_model_output = ft_tokenizer.decode(generated_output[0], skip_special_tokens=False)
    # print(ft_model_output)

    match prompt_format:
        case "chat_ml" | "gemma":
            # Regular expressions to match the input and output
            input_pattern = r"### Input: (.+?) \[/INST\]"
            output_pattern = r"### Output: (.+?)<eos>"
        case _:
            # TODO: change, it's still the same as Gemma but will change for other models
            input_pattern = r"### Input: (.+?) \[/INST\]"
            output_pattern = r"### Output: (.+?) \[/INST\]"

    inputs = re.findall(input_pattern, ft_model_output)
    outputs = re.findall(output_pattern, ft_model_output)

    for inp, out in zip(inputs, outputs):
        print(f"Input: {inp.strip()}")
        print(f"Output: {out.strip()}")
        print()

    # trying with transformers pipeline
    # generated_output = pipeline("text-generation", model=ft_model, tokenizer=ft_tokenizer)

    # Generate text
    # ft_model_output = generated_output(ft_model_input, max_new_tokens=2048, return_full_text=False)
    # print(ft_model_output[0]['generated_text'])

# TODO: fix this up, use functions to load in to make it cleaner
def eval_base_model():
    model_type = "mistral"

    if model_type == "chat_ml":
        model_id = "google/gemma-2b-it"
    else:
        model_id = "mistralai/Mistral-7B-Instruct-v0.2"
    bnb_config = BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_compute_type=torch.float16, bnb_4bit_quant_type="nf4")
    base_model = AutoModelForCausalLM.from_pretrained(model_id, quantization_config=bnb_config, device_map='auto')
    if model_type == "chat_ml":
        base_tokenizer = AutoTokenizer.from_pretrained(model_id, use_fast=False, add_bos_token=True)
        base_model_input = [
            {
                "role": "user", "content": """Assist a non-verbal autistic individual in communicating their thoughts or needs through selected images.
                Your task: infer and articulate the message in first-person, using simple, direct language with empathy and clarity.
                - Be empathetic and direct.
                - Look for deeper meanings in the input.
                - Keep the tone practical and straightforward.
                Only give the output for the input provided. Do not come up with new inputs abaseer.
                input: fins, mask, snorkel""",
            },
            # { "role": "assistant", "content": ""}
            { "role": "model", "content": ""}
        ]
        base_model_input_tokenized = base_tokenizer.apply_chat_template(base_model_input, tokenize=True, add_generation_prompt=True, return_tensors="pt").to("cuda")
        generated_output = base_model.generate(
            base_model_input_tokenized,
            max_new_tokens=200,
            pad_token_id=base_tokenizer.pad_token_id
        )
    else:
        base_tokenizer = AutoTokenizer.from_pretrained(model_id, use_fast=False, padding_side="left")
        if base_tokenizer.pad_token is None:
            base_tokenizer.pad_token = base_tokenizer.unk_token
        base_model_input = f"""[INST] Assist a non-verbal autistic individual in communicating their thoughts or needs through selected text input.
        Your task: infer and articulate the message in first-person, using simple, direct language with empathy and clarity. Be concise. 
        Only give the output for the input provided. Do not come up with new inputs after. 

        ### Input: Porter Robinson, Worlds, Nurture, Look at the Sky [/INST]
        ### Output:"""
        base_model_input_tokenized = base_tokenizer(base_model_input, return_tensors="pt").to("cuda")
        # print(f'base_model_input_tokenized: {base_model_input_tokenized}')
        # base_model.eval()
        generated_output = base_model.generate(
            **base_model_input_tokenized,
            max_new_tokens=200,
            pad_token_id=base_tokenizer.pad_token_id
        )

    base_model_output = base_tokenizer.decode(generated_output[0], skip_special_tokens=False)
    print(base_model_output)

def read_user_inputs(file_path):
    dataset = load_dataset('json', data_files=file_path)
    if 'input' in dataset['train'].column_names:
        return dataset['train']['input']
    else:
        print('WARNING: input file not read correctly.')
        return []

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Evaluation script for fine-tuned models.')
    parser.add_argument('--prompt-format', type=str, default='mistral', help='Prompt format')
    parser.add_argument('--chat', action='store_true', default=False, help='ChatML format')
    parser.add_argument('--anton', action='store_true', default=False, help='Anton format')
    parser.add_argument('--unsloth', action='store_true', default=False, help='Use unsloth')
    parser.add_argument('--user-input', type=str, default='scuba, fins, mask, snorkel, store', help='Singular input to model')
    parser.add_argument('--input-file-path', type=str, default=None, 
                        help='File of user inputs to model')
    parser.add_argument('--num-inputs', type=int, default=5, help='Number of inputs to try')
    parser.add_argument('--model-id', type=str, default='mistralai/Mistral-7B-Instruct-v0.3', help='Model ID')
    parser.add_argument('--model-path', type=str, default='./models/trained_model',
                        help='path for new saved qlora model')
    parser.add_argument('--eval-base-model', action='store_true', default=False,
                        help='Evaluate base model as well to compare.')
    args = parser.parse_args()
    # logging.getLogger("transformers").setLevel(logging.ERROR)

    base_model = load_model(args.model_id, args.unsloth)
    ft_tokenizer = generate_tokenizer(args.model_id, base_model, args.anton, args.prompt_format, args.unsloth)
    ft_model = merge_model(base_model, args.model_path, args.unsloth)
    if args.input_file_path:
        user_inputs = read_user_inputs(args.input_file_path)
        for i in range(args.num_inputs):
            user_input = user_inputs[random.randint(0, len(user_inputs)-1)]
            prompt = format_prompt(user_input, args.chat, args.prompt_format)
            generate_output(ft_tokenizer, ft_model, prompt, args.chat, args.prompt_format)
    elif args.user_input:
        prompt = format_prompt(args.user_input, args.chat, args.prompt_format)
        generate_output(ft_tokenizer, ft_model, prompt, args.chat, args.prompt_format)
    else:
        raise ValueError('No input or input file path provided to evaluate model.')

    if args.eval_base_model:
        eval_base_model()





# General notes on which adapters work well
# Merging base model with fine-tuned LoRa adapter
# WORKS
# ft_model = PeftModel.from_pretrained(base_model, "./models/ft-mistral-7b-instruct-v02-02-11-24-anton")
# ft_model = PeftModel.from_pretrained(base_model, "./models/ft-mistral-7b-instruct-v02-final-anton")
# ft_model = PeftModel.from_pretrained(base_model, "./models/ft-mistral-7b-instruct-v02-03-02-24-4-breaking-test-2")
# ft_model = PeftModel.from_pretrained(base_model, "./models/ft-gemma-7b-it-03-01-24/")
# ft_model = PeftModel.from_pretrained(base_model, "./models/ft-mistral-7b-instruct-v02-03-02-24-4-breaking-test-3-50-epochs")
# ft_model = PeftModel.from_pretrained(base_model, "./models/llama-3-8b-instruct-1")
# ft_model = PeftModel.from_pretrained(base_model, "./models/llama-3-8b-instruct-2")
# ft_model = PeftModel.from_pretrained(base_model, "./models/llama-3-8b-instruct-3")
# TESTING
# ft_model = PeftModel.from_pretrained(base_model, "./models/gemma-2b-it-03-02-24")
# ft_model = PeftModel.from_pretrained(base_model, "./models/kto-ft-mistral-7b-instruct-v02-1")
# ft_model = PeftModel.from_pretrained(base_model, "./models/kto-ft-mistral-7b-instruct-v02-2")
# ft_model = PeftModel.from_pretrained(base_model, "./models/kto-ft-mistral-7b-instruct-v02-3")
# ft_model = PeftModel.from_pretrained(base_model, "./models/llama-3-8b-instruct-KTO-1")
# ft_model = PeftModel.from_pretrained(base_model, "./models/llama-3-8b-instruct-KTO-2")
# ft_model = PeftModel.from_pretrained(base_model, "./models/ft-mistral-7b-instruct-v03-04")
# GOOD MODEL TO GO WITH
# ft_model = PeftModel.from_pretrained(base_model, "./models/ft-mistral-7b-instruct-v02-03-02-24-3")
# ft_model = PeftModel.from_pretrained(base_model, "./models/gemma-2b-it-03-03-24-2")
# ft_model = PeftModel.from_pretrained(base_model, "./models/ft-mistral-7b-instruct-v02-final")
# ft_model = PeftModel.from_pretrained(base_model, "./models/llama-3-8b-instruct-4")