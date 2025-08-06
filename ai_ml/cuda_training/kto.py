from dataclasses import dataclass

from datasets import load_dataset
from transformers import AutoModelForCausalLM, AutoTokenizer, HfArgumentParser
# from peft import prepare_model_for_kbit_training, LoraConfig, get_peft_model, PeftModel
import torch

from trl import KTOConfig, KTOTrainer, ModelConfig, get_peft_config, setup_chat_format


# Define and parse arguments.
@dataclass
class ScriptArguments:
    """
    The arguments for the KTO training script.
    """

    dataset_name: str = "trl-lib/kto-mix-14k"
    # dataset_name: str = "./data/processed_dataset_full_KTO.jsonl"


if __name__ == "__main__":
    parser = HfArgumentParser((ScriptArguments, KTOConfig, ModelConfig))
    script_args, kto_args, model_args = parser.parse_args_into_dataclasses()

    # Load a pretrained model
    # bnb_config = BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_compute_dtype=torch.bfloat16, bnb_4bit_quant_type="nf4")
    model = AutoModelForCausalLM.from_pretrained(model_args.model_name_or_path, device_map='auto')
    print('model loaded')
    model_ref = AutoModelForCausalLM.from_pretrained(model_args.model_name_or_path, device_map='auto')
    print('model_ref loaded')

    tokenizer = AutoTokenizer.from_pretrained(model_args.model_name_or_path)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    # If we are aligning a base model, we use ChatML as the default template
    # if tokenizer.chat_template is None:
        # model, tokenizer = setup_chat_format(model, tokenizer)

    # Load the dataset
    dataset = load_dataset(script_args.dataset_name)
    # dataset = load_dataset('json', data_files=script_args.dataset_name)

    # Apply chat template
    def format_dataset(example):
        example["prompt"] = tokenizer.apply_chat_template(example["prompt"], tokenize=False)
        example["completion"] = tokenizer.apply_chat_template(example["completion"], tokenize=False)
        return example

    formatted_dataset = dataset.map(format_dataset)

    # Initialize the KTO trainer
    kto_trainer = KTOTrainer(
        model,
        model_ref,
        args=kto_args,
        train_dataset=formatted_dataset["train"],
        eval_dataset=formatted_dataset["test"],
        tokenizer=tokenizer,
        peft_config=get_peft_config(model_args),
    )

    # Train and push the model to the Hub
    kto_trainer.train()
    kto_trainer.save_model(kto_args.output_dir)