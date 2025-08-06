"""
This script performs hyperparameter optimization for fine-tuning a language model using Optuna.

It defines an objective function that trains and evaluates a model with a given set of hyperparameters
and uses an Optuna study to find the best combination of hyperparameters.
The results are logged using MLflow.

Usage:
    python optuna.py --model-id <model_id> --dataset-path <path_to_dataset> [options]
"""
from transformers import DataCollatorForLanguageModeling
from trl import SFTConfig, SFTTrainer
from fine_tuning import model_init, set_lora_config, set_training_args, load_tokenizer, format_dataset, compute_metrics, plot_metrics
import mlflow
import optuna
from optuna.integration.mlflow import MLflowCallback
import argparse
from datasets import load_dataset, DatasetDict

# Objective function for Optuna
def objective(trial, model_id, formatted_dataset, tokenizer, prompt_format):
    """
    the objective function for the optuna study.

    this function defines the hyperparameters to be tuned, initializes and trains a model
    with these hyperparameters, and returns the evaluation result.

    args:
        trial (optuna.trial.trial): an optuna trial object.
        model_id (str): the model id from hugging face.
        formatted_dataset (datasetdict): the formatted dataset for training and evaluation.
        tokenizer (autotokenizer): the tokenizer for the model.
        prompt_format (str): the prompt format to use.

    returns:
        dict: the evaluation result from the trainer.
    """

    # Set up hyperparameters
    lora_r = trial.suggest_int("lora_r", 8, 16, step=8)
    lora_alpha = trial.suggest_int("lora_alpha", 16, 32, step=16)
    num_train_epochs = trial.suggest_int("num_train_epochs", 1, 10)
    batch_size = trial.suggest_categorical("per_device_train_batch_size", [1, 2, 4, 8])
    learning_rate = trial.suggest_float("learning_rate", 1e-7, 1e-3, log=True)

    # Initialize model and LoraConfig
    model = model_init(model_id, tokenizer, lora_r, lora_alpha)
    lora_config = set_lora_config(lora_r, lora_alpha)

    if prompt_format == "llama":
        model.resize_token_embeddings(len(tokenizer))

    training_args = set_training_args(args)
    training_args.learning_rate = learning_rate
    training_args.num_train_epochs = num_train_epochs
    training_args.per_device_train_batch_size = batch_size
    training_args.per_device_eval_batch_size = batch_size

    trainer = SFTTrainer(
        model=model,
        peft_config=lora_config,
        args=training_args,
        train_dataset=formatted_dataset['train'],
        eval_dataset=formatted_dataset['validation'],
        tokenizer=tokenizer,
        packing=False,
        data_collator=DataCollatorForLanguageModeling(tokenizer, mlm=False),
        compute_metrics=compute_metrics
    )

    print('NEW TRIAL:')
    print(f'Trial {trial.number} - lora_r: {lora_r}, lora_alpha: {lora_alpha}, ')
    print(f'num_train_epochs: {num_train_epochs}, per_device_train_batch_size: {batch_size}, ')
    print(f'per_device_eval_batch_size: {batch_size}, learning_rate: {learning_rate}')

    # Train and evaluate
    trainer.train()
    eval_result = trainer.evaluate()

    print(f'eval_result: {eval_result}')
    print(f'trainer.state: {trainer.state}')
    print(f'trainer.state.log_history: {trainer.state.log_history}')

    plot_metrics(trainer.state.log_history)

    # return eval_result["eval_loss"]
    return eval_result


def main(args):
    """
    the main function for the script.

    it parses command-line arguments, loads and preprocesses the dataset,
    and runs the optuna study.

    args:
        args (argparse.namespace): the command-line arguments.
    """
    # mlflow.transformers.autolog()
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

    mlflow_callback = MLflowCallback()
    func = lambda trial: objective(trial, model_id, formatted_dataset, tokenizer, args.prompt_format)
    study = optuna.create_study(study_name=args.experiment_name, direction="minimize")
    study.optimize(func, n_trials=args.num_trials, callbacks=[mlflow_callback])

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Fine-tuning script')

    parser.add_argument('--prompt-format', type=str, default='mistral', help='Prompt format')
    parser.add_argument('--training-type', type=str, default='SFT', help='Training type (SFT or KTO)')
    parser.add_argument('--model-id', type=str, default='mistralai/Mistral-7B-Instruct-v0.2', help='Model ID')
    parser.add_argument('--dataset-path', type=str, default='data/processed_dataset_full.jsonl', help='path to dataset')
    parser.add_argument('--do-eval', type=bool, default=True, help='whether to do evaluation')
    parser.add_argument('--eval-steps', type=int, default=10, help='number of eval steps (or epochs)')
    parser.add_argument('--eval-strategy', type=str, default='steps', help='eval strategy (steps or epoch)')
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
    # parser.add_argument('--run-name', type=str, default='mistral-7b-finetune', help='run name for mlflow')
    parser.add_argument('--experiment-name', type=str, default='Optuna', help='experiment name for mlflow')
    parser.add_argument('--anton', action='store_true', help='antons method for adding special tokens to tokenizer')
    parser.add_argument('--run-description',
                        type=str, 
                        default="Running optuna study.",
                        help='model description for mlflow')
    # Optuna only
    parser.add_argument('--optuna', action='store_true', default=False, help='run optuna hyperparameter search')
    parser.add_argument('--num-trials', type=int, default=20, help='num optuna trials to run in study')

    # Parse the command line arguments
    args = parser.parse_args()
    main(args)