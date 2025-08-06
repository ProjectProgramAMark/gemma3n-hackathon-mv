from transformers import AutoTokenizer
from unsloth import FastLanguageModel


def formatting_func(sample, prompt_format="mistral"):
    input = sample['input']
    output = sample['output']
    if prompt_format == "mistral":
        prompt = f"""[INST] Assist a non-verbal autistic individual in communicating their thoughts or needs through selected images.
        Your task is to infer and articulate the message in first-person, using simple, direct language with empathy and clarity.
        ### Input: {input} [/INST]
        ### Output: {output} </s>"""
    else:
        prompt = f"""input: {input} output: {output}"""

    return {"text": prompt}

def formatting_func_chat(sample, tokenizer, prompt_format):
    input_str = ''.join(sample['input'])
    output_str = ''.join(sample['output'])
    
    # debugging
    # print(f'input_str: {input_str}')
    # print(f'output_str: {output_str}')

    # for Mistral 7B Instruct v0.2 specifically, because apparently chat template has no "system" part
    if prompt_format != "llama":
        prompt = [
            {"role": "user", "content": f"Assist a non-verbal autistic individual in communicating their thoughts or needs through selected images. \
    Your task: infer and articulate the message in first-person, using simple, direct language with empathy and clarity. \
    - Be empathetic and direct. - Look for deeper meanings in the input. - Keep the tone practical and straightforward." + input_str},
            {"role": "assistant", "content": output_str}
        ]
    else:
        prompt = [
            {"role": "system", "content": f"Assist a non-verbal autistic individual in communicating their thoughts or needs through selected images. \
    Your task: infer and articulate the message in first-person, using simple, direct language with empathy and clarity. \
    - Be empathetic and direct. - Look for deeper meanings in the input. - Keep the tone practical and straightforward."},
            {"role": "user", "content": input_str},
            {"role": "assistant", "content": output_str}
        ]

    tokenized_input = tokenizer.apply_chat_template(prompt, tokenize=False, return_tensors="pt", add_generation_prompt=False)
    if prompt_format == "gemma":
        tokenized_input = tokenized_input[:-1]
        tokenized_input += "<eos>"
    
    return {"text": tokenized_input}

def formatting_func_kto(sample, tokenizer, prompt_format):
    if prompt_format == "mistral":
        sample["prompt"] = f"""[INST] Assist a non-verbal autistic individual in communicating their thoughts or needs through selected images.
        Your task is to infer and articulate the message in first-person, using simple, direct language with empathy and clarity.
        ### Input: {sample["prompt"]} [/INST] </s>"""
        sample["completion"] = f"""{sample["completion"]} </s>"""
    elif prompt_format == "chat_ml" or prompt_format == "gemma":
        # sample["prompt"] = tokenizer.apply_chat_template(sample["prompt"], tokenize=True)
        # sample["completion"] = tokenizer.apply_chat_template(sample["completion"], tokenize=True)
        sample["prompt"] = tokenizer(sample["prompt"])
        sample["completion"] = tokenizer(sample["completion"])
        sample["label"] = tokenizer(sample["label"])
    elif prompt_format == "llama":
        prompt = [
            {"role": "system", "content": f"""
             Assist a non-verbal autistic individual in communicating their thoughts or needs through selected images.
             Your task: infer and articulate the message in first-person, using simple, direct language with empathy and clarity.
             - Be empathetic and direct.
             - Look for deeper meanings in the input.
             - Keep the tone practical and straightforward."""},
            {"role": "user", "content": sample["prompt"]},
        ]
        completion = [
            {"role": "assistant", "content": sample["completion"]}
        ]
        sample["prompt"] = tokenizer.apply_chat_template(prompt, tokenize=False)
        sample["completion"] = tokenizer.apply_chat_template(completion, tokenize=False)

    return sample

def sanity_check(dataset, tokenizer, training_type="SFT", num_samples=3):
    # Sanity check on text dataset with prompts
    for i in range(num_samples):  # Adjust the range to inspect more examples
        print(f"Example {i}:")
        if training_type != "KTO":
            print("Prompt:", dataset['train'][i]['text'])
            print("Prompt (validation):", dataset['validation'][i]['text'])
        else:
            print("Prompt:", dataset['train'][i]['prompt'])
            print("Completion:", dataset['train'][i]['completion'])
            print("Label:", dataset['train'][i]['label'])
        print()

    # Sanity check on tokenized dataset with prompts
    for i in range(num_samples):  # Adjust the range to inspect more examples
        print(f"Example {i}:")
        if training_type != "KTO":
            print("Prompt:", tokenizer.encode(dataset['train'][i]['text']))
            print("Prompt (validation):", tokenizer.encode(dataset['validation'][i]['text']))
        else:
            print("Training Dataset:")
            print("Prompt:", tokenizer.encode(dataset['train'][i]['prompt']))
            print("Completion:", tokenizer.encode(dataset['train'][i]['completion']))
            print("Label:", dataset['train'][i]['label'])
        print()

    # quick sanity check
    print(f'tokenizer.bos_token: {tokenizer.bos_token}')
    print(f'tokenizer.bos_token_id: {tokenizer.bos_token_id}')
    print(f'tokenizer.pad_token: {tokenizer.pad_token}')
    print(f'tokenizer.pad_token_id: {tokenizer.pad_token_id}')
    print(f'tokenizer.eos_token: {tokenizer.eos_token}')
    print(f'tokenizer.eos_token_id: {tokenizer.eos_token_id}')


def load_tokenizer(model_id, prompt_format="mistral", training_type="SFT", anton=False, unsloth=False):
    if not unsloth:
        tokenizer = AutoTokenizer.from_pretrained(model_id, use_fast=False, add_bos_token=True)
    else:
        # unsloth
        model, tokenizer = FastLanguageModel.from_pretrained(
            # model_name = "unsloth/llama-3-8b-Instruct-bnb-4bit",
            # model_name = "unsloth/mistral-7b-instruct-v0.3-bnb-4bit",
            # model_name = "unsloth/gemma-7b-bnb-4bit",
            model_name = model_id,
            max_seq_length = 2048,
            dtype = None,
            load_in_4bit = True,
        )
    # need to include new terminator for llama 3 for now. TODO: check back in to see if terminator no longer needed
    if prompt_format == "llama":
        terminators = [
            tokenizer.eos_token_id,
            tokenizer.convert_tokens_to_ids("<|eot_id|>")
        ]
    if anton:
        # debugging
        print('anton method being used')
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
    else:
        # debugging
        print('anton method NOT being used')
        if tokenizer.pad_token is None:
            if prompt_format != "llama":
                tokenizer.pad_token = tokenizer.unk_token
            # TODO: HOTFIX FOR LLAMA 3 NOT HAVING PADDING TOKEN. REMOVE ELSE STATEMENT WHEN LLAMA 3 IS FIXED
            else:
                DEFAULT_PAD_TOKEN = "<|pad|>"
                DEFAULT_UNK_TOKEN = "<|unk|>"
                special_tokens_dict = dict()
                if tokenizer.pad_token is None:
                    special_tokens_dict["pad_token"] = DEFAULT_PAD_TOKEN
                if tokenizer.unk_token is None:
                    special_tokens_dict["unk_token"] = DEFAULT_UNK_TOKEN
                tokenizer.add_special_tokens(special_tokens_dict)

    return tokenizer

def format_dataset(model_id, tokenizer, dataset, prompt_format="mistral", training_type="SFT", anton=False, unsloth=False):

    # tokenizer = load_tokenizer(model_id, prompt_format=prompt_format, training_type=training_type, anton=anton, unsloth=False)

    if training_type == "SFT":
        if prompt_format == "mistral":
            tokenizer.padding_side = "left"

        if prompt_format == "chat_ml" or prompt_format == "gemma" or prompt_format == "llama":
            formatted_dataset = dataset.map(formatting_func_chat, 
                                            batched=False, 
                                            fn_kwargs={"prompt_format": prompt_format, "tokenizer": tokenizer}, 
                                            remove_columns=dataset['train'].column_names)
        else:
            formatted_dataset = dataset.map(formatting_func, 
                                            batched=False, 
                                            fn_kwargs={"prompt_format": prompt_format}, 
                                            remove_columns=dataset['train'].column_names)
    elif training_type == "KTO":
        formatted_dataset = dataset.map(formatting_func_kto,
                                        batched=False,
                                        fn_kwargs={"prompt_format": prompt_format, "tokenizer": tokenizer})
    else:
        raise ValueError("Invalid training type. Please choose either 'SFT' or 'KTO'.")

    print(formatted_dataset)
    sanity_check(formatted_dataset, tokenizer, training_type=training_type, num_samples=5)

    return formatted_dataset