"""
This script fine-tunes a language model using either Supervised Fine-Tuning (SFT) or Kernel-based Task Optimization (KTO).

It supports:
- qlora and unsloth for memory-efficient training.
- different prompt formats.
- logging experiments with mlflow.

Usage:
    python fine_tuning.py --model-id <model_id> --dataset-path <path_to_dataset> [options]
"""
from transformers import AutoModelForCausalLM, BitsAndBytesConfig, TrainingArguments, DataCollatorForLanguageModeling
# unsloth version
# from transformers import AutoTokenizer, BitsAndBytesConfig, TrainingArguments, Trainer, DataCollatorForLanguageModeling
from unsloth import FastLanguageModel, is_bfloat16_supported

# leaving Trainer out for now to use SFTTrainer instead
from trl import SFTTrainer, SFTConfig, KTOTrainer, KTOConfig
# from transformers import Trainer
from datasets import load_dataset, DatasetDict
from peft import prepare_model_for_kbit_training, LoraConfig, get_peft_model
import torch
import argparse
import mlflow
import numpy as np
from sklearn.metrics import f1_score, accuracy_score
from plotting import plot_metrics
from formatting import format_dataset, load_tokenizer

def set_lora_config(r, lora_alpha):
    """
    sets the lora configuration for the model.

    args:
        r (int): the r value for qlora.
        lora_alpha (int): the alpha value for qlora.

    returns:
        loraconfig: the lora configuration.
    """
    lora_config = LoraConfig(
        r=r,
        lora_alpha=lora_alpha,
        target_modules=[
            "q_proj",
            "k_proj",
            "v_proj",
            "o_proj",
            "gate_proj",
            "up_proj",
            "down_proj",
            "lm_head",
        ])
    return lora_config

def model_init(model_id, tokenizer, r, lora_alpha, unsloth=False):
    """
    initializes the model for training.

    args:
        model_id (str): the model id from hugging face.
        tokenizer (autotokenizer): the tokenizer for the model.
        r (int): the r value for qlora.
        lora_alpha (int): the alpha value for qlora.
        unsloth (bool, optional): whether to use unsloth or not. defaults to false.

    returns:
        automodelforcausallm: the initialized model.
    """
    if not unsloth:
        # transformers
        bnb_config = BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_compute_dtype=torch.bfloat16, bnb_4bit_quant_type="nf4")
        model = AutoModelForCausalLM.from_pretrained(model_id, quantization_config=bnb_config, torch_dtype=torch.bfloat16, device_map='auto')
        # QLoRa setup
        model = prepare_model_for_kbit_training(model)
        lora_config = set_lora_config(r, lora_alpha)
        model = get_peft_model(model, lora_config)
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
        # Do model patching and add fast LoRA weights
        model = FastLanguageModel.get_peft_model(
            model,
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

    # TODO: OR prompt_format == "llama" IS A HOTFIX. 
    # REMOVE WHEN NO LONGER NEEDING TO MANUALLY ADD PAD_TOKEN OR UNK_TOKEN TO LLAMA 3
    if args.anton or args.prompt_format == "llama":
        # debugging
        print('anton method or llama prompt format being used')
        model.resize_token_embeddings(len(tokenizer))

    model.to("cuda")
    return model

def compute_metrics(eval_pred):
    """
    computes metrics for evaluation.

    args:
        eval_pred (tuple): a tuple containing logits and labels.

    returns:
        dict: a dictionary containing the evaluation loss, f1 score, and accuracy.
    """
    logits, labels = eval_pred
    predictions = np.argmax(logits, axis=-1)
    eval_f1 = f1_score(labels, predictions, average='weighted')
    eval_accuracy = accuracy_score(labels, predictions)

    # The Trainer will automatically log eval_loss, so we return it explicitly for clarity
    eval_loss = np.mean((predictions - labels)**2)  # Placeholder, replace with actual loss calculation if needed

    return {
        "eval_loss": eval_loss,
        "eval_f1": eval_f1,
        "eval_accuracy": eval_accuracy,
    }

def set_training_args(args):
    """
    sets the training arguments for the trainer.

    args:
        args (argparse.namespace): the command line arguments.

    returns:
        sftconfig or ktoconfig: the training arguments.
    """
    if args.training_type == "SFT":
        training_args = SFTConfig(
            dataset_text_field='text',
            packing=False,
            max_seq_length=args.max_seq_length,
            output_dir='./results',
            num_train_epochs=args.epochs,
            per_device_train_batch_size=args.train_batch_size,
            per_device_eval_batch_size=args.eval_batch_size,
            # warmup_steps=50,
            learning_rate=args.learning_rate,
            optim="paged_adamw_8bit",
            weight_decay=0.01,
            logging_dir='./logs',
            logging_steps=1,
            remove_unused_columns=True,
            do_eval=False,
            # do_eval=args.do_eval,
            eval_strategy=args.eval_strategy if args.do_eval else "no",
            eval_steps=args.eval_steps if args.do_eval else None,
            # label_names=["text"],
            gradient_accumulation_steps=1,
            gradient_checkpointing_kwargs={"use_reentrant": False},
            # unsloth specific
            fp16 = not is_bfloat16_supported() if args.unsloth else None, 
            bf16 = is_bfloat16_supported() if args.unsloth else None,
        )
    elif args.training_type == "KTO":
        training_args = KTOConfig(
            output_dir='./results',
            num_train_epochs=args.epochs,
            per_device_train_batch_size=args.train_batch_size,
            per_device_eval_batch_size=args.eval_batch_size,
            beta=0.1,
            desirable_weight=args.desirable_weight,
            undesirable_weight=args.undesirable_weight,
            # warmup_steps=50,
            # learning_rate=args.learning_rate,
            # optim="paged_adamw_8bit",
            # weight_decay=0.01,
            # logging_dir='./logs',
            logging_steps=10,
            # remove_unused_columns=True,
            eval_steps=50,
            gradient_accumulation_steps=1
        )
    return training_args

def main(args):
    """
    the main function for the script.

    args:
        args (argparse.namespace): the command line arguments.
    """
    mlflow.transformers.autolog()
    model_id = args.model_id

    # Loading in dataset
    print(f"Loading dataset")
    dataset = load_dataset('json', data_files=args.dataset_path)

    train_test_valid = dataset['train'].train_test_split(test_size=0.2)
    # Split the 10% test + valid in half test, half valid
    test_valid = train_test_valid['test'].train_test_split(test_size=0.5)

    dataset = DatasetDict({
        'train': train_test_valid['train'],
        'test': test_valid['test'],
        'validation': test_valid['train']
        })

    print("dataset:")
    print(dataset)

    tokenizer = load_tokenizer(args.model_id, args.prompt_format, args.training_type, args.anton, args.unsloth)
    formatted_dataset = format_dataset(args.model_id, tokenizer, dataset, args.prompt_format, args.training_type, args.anton, args.unsloth)

    # Initializing model
    model = model_init(model_id, tokenizer, args.r, args.lora_alpha, args.unsloth)
    lora_config = set_lora_config(args.r, args.lora_alpha)

    if args.prompt_format == "llama":
        # debugging
        model.resize_token_embeddings(len(tokenizer))

    # TODO: using Trainer for my class for Mistral-OpenHermes2.5 so I can correctly pass in
    # ChatML tokenized data. So need to redo a lot of the things I did like formatting dataset
    # with input_ids, attention_mask, output and other things
    
    training_args = set_training_args(args)

    if args.training_type == "SFT":
        trainer = SFTTrainer(
            model=model,
            peft_config=lora_config,
            args=training_args,
            train_dataset=formatted_dataset['train'],
            eval_dataset=formatted_dataset['validation'],
            tokenizer=tokenizer,
            data_collator=DataCollatorForLanguageModeling(tokenizer, mlm=False),
            # compute_metrics=compute_metrics
        )
    elif args.training_type == "KTO":
        trainer = KTOTrainer(
            model,
            # model_ref,
            args=training_args,
            train_dataset=formatted_dataset["train"],
            eval_dataset=formatted_dataset["test"],
            tokenizer=tokenizer,
            data_collator=DataCollatorForLanguageModeling(tokenizer, mlm=False),
            # peft_config=get_peft_config(model_args),
        )

    mlflow.set_experiment(args.experiment_name)
    with mlflow.start_run(run_name=args.run_name, description=args.run_description) as run:

        mlflow.log_input(mlflow.data.huggingface_dataset.from_huggingface(dataset['train']), context="training")
        mlflow.log_input(mlflow.data.huggingface_dataset.from_huggingface(dataset['test']), context="testing")
        mlflow.log_input(mlflow.data.huggingface_dataset.from_huggingface(dataset['validation']), context="validation")
        
        # Log all relevent hyperparameters
        mlflow.log_param("model_id", args.model_id)
        mlflow.log_param("prompt_format", args.prompt_format)
        mlflow.log_param("train_batch_size", args.train_batch_size)
        mlflow.log_param("eval_batch_size", args.eval_batch_size)
        mlflow.log_param("epochs", args.epochs)
        mlflow.log_param("learning_rate", args.learning_rate)
        mlflow.log_param("r", args.r)
        mlflow.log_param("lora_alpha", args.lora_alpha)
        mlflow.log_param("max_seq_length", args.max_seq_length)
        mlflow.log_param("save_model_path", args.save_model_path)

        # trainer.train(resume_from_checkpoint=True)
        trainer.train()
        # Evaluating model
        # results = trainer.evaluate()
        # print("Evaluation Results:", results)
        # eval_loss = results["eval_loss"]
        # print("Evaluation Loss:", eval_loss)

        # Saving model
        model.save_pretrained(args.save_model_path)

        # Log training and evaluation loss
        # TODO: fix eval loss not being computed for some reason
        training_eval_loss_plot = plot_metrics(trainer.state.log_history)
        mlflow.log_figure(training_eval_loss_plot, "training_eval_loss.png")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Fine-tuning script')

    parser.add_argument('--prompt-format', type=str, default='mistral', help='Prompt format')
    parser.add_argument('--training-type', type=str, default='SFT', help='Training type (SFT or KTO)')
    parser.add_argument('--model-id', type=str, default='mistralai/Mistral-7B-Instruct-v0.2', help='Model ID')
    parser.add_argument('--dataset-path', type=str, default='data/processed_dataset_full.jsonl', help='path to dataset')
    parser.add_argument('--train-batch-size', type=int, default=32, help='batch size for training')
    parser.add_argument('--eval-batch-size', type=int, default=32, help='batch size for eval')
    parser.add_argument('--epochs', type=int, default=50, help='number of epochs')
    parser.add_argument('--do-eval', type=bool, default=True, help='whether to do evaluation')
    parser.add_argument('--eval-steps', type=int, default=10, help='number of eval steps (or epochs)')
    parser.add_argument('--eval-strategy', type=str, default='steps', help='eval strategy (steps or epoch)')
    parser.add_argument('--learning-rate', type=float, default=2.5e-5, help='learning rate')
    parser.add_argument('--max-seq-length', type=int, default=2048, help='max sequence length for model input')
    parser.add_argument('--unsloth', action='store_true', default=False, help='whether to use unsloth or not')
    # SFT only
    parser.add_argument('--r', type=int, default=16, help='r value for qlora')
    parser.add_argument('--lora-alpha', type=int, default=32, help='alpha value for qlora')
    # KTO only
    parser.add_argument('--desirable-weight', type=float, default=1.0, help='desirable example ratio. KTO only.')
    parser.add_argument('--undesirable-weight', type=float, default=1.0, help='undesirable example ratio. KTO only.')
    parser.add_argument('--beta', type=float, default=0.1, help='implicit reward. KTO only.')

    parser.add_argument('--save-model-path', type=str, default='./models/trained_model',
                        help='path for new saved qlora model')
    parser.add_argument('--run-name', type=str, default='mistral-7b-finetune', help='run name for mlflow')
    parser.add_argument('--experiment-name', type=str, default='Mistral', help='experiment name for mlflow')
    parser.add_argument('--anton', action='store_true', help='antons method for adding special tokens to tokenizer')
    parser.add_argument('--run-description',
                        type=str, 
                        default="Fine-tuning Mistral with Mistral prompt format.",
                        help='model description for mlflow')
    # Parse the command line arguments
    args = parser.parse_args()
    main(args)