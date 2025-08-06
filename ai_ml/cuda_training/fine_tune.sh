############################################################################################################
###################### SFT #################################################################################
############################################################################################################

# Testing
# screen -L -Logfile ./logging_output/testing.6 \
# python fine_tuning.py \
# --prompt-format mistral \
# --save-model-path ./models/test-1 \
# --model-id mistralai/Mistral-7B-Instruct-v0.3 \
# --epochs 1 \
# --train-batch-size 4 \
# --eval-batch-size 4 \
# --r 8 \
# --lora-alpha 16 \
# --run-name testing_1 \
# --experiment-name Testing \
# --run-description "Just testing things out."

# Mistral

# Mistral Instruct v0.3
# screen -L -Logfile ./logging_output/mistral_fine_tune.8 \
# python fine_tuning.py \
# --prompt-format mistral \
# --save-model-path ./models/ft-mistral-7b-instruct-v03-08 \
# --model-id mistralai/Mistral-7B-Instruct-v0.3 \
# --epochs 25 \
# --train-batch-size 16 \
# --eval-batch-size 16 \
# --r 8 \
# --lora-alpha 16 \
# --run-name final_mistral_7b_v03_ft_8 \
# --experiment-name Mistral \
# --run-description "testing unsloth"

# Mistral UNSLOTH
# screen -L -Logfile ./logging_output/mistral_fine_tune.10 \
# python fine_tuning.py \
# --prompt-format mistral \
# --save-model-path ./models/ft-mistral-7b-instruct-v03-10 \
# --model-id unsloth/mistral-7b-instruct-v0.3-bnb-4bit \
# --epochs 25 \
# --train-batch-size 8 \
# --eval-batch-size 8 \
# --r 32 \
# --lora-alpha 64 \
# --run-name final_mistral_7b_v03_ft_10 \
# --experiment-name Mistral \
# --run-description "Mistral fine tune, June 29th 2024." \
# --do-eval True \
# --eval-steps 1 \
# --unsloth

# Gemmma

# screen -L -Logfile ./logging_output/gemma-2b-06-13-24.1 \
# python fine_tuning.py \
# --prompt-format chat_ml \
# --save-model-path ./models/gemma-2b-it-06-13-24-2 \
# --model-id google/gemma-2b-it \
# --epochs 10 \
# --train-batch-size 4 \
# --eval-batch-size 4 \
# --r 16 \
# --lora-alpha 32 \
# --run-name gemma-2b-it-06-13-24-3 \
# --experiment-name Gemma \
# --run-description "Retrying manually removing end newline character and manually adding <eos> on tokenized prompt for Gemma 2B."

# Gemma 1 7B UNSLOTH
# --model-id unsloth/gemma-7b-it-bnb-4bit \
# screen -L -Logfile ./logging_output/gemma-2b-06-15-24-unsloth.0 \
# python fine_tuning.py \
# --prompt-format chat_ml \
# --save-model-path ./models/gemma-2b-it-06-13-24-unsloth-1 \
# --model-id unsloth/gemma-2b-it-bnb-4bit \
# --epochs 25 \
# --train-batch-size 4 \
# --eval-batch-size 4 \
# --r 16 \
# --lora-alpha 32 \
# --run-name gemma-2b-it-06-15-24-unsloth-1 \
# --experiment-name Gemma \
# --run-description "testing unsloth" \
# --do-eval True \
# --eval-steps 1 \
# --unsloth

# Gemma 2 9B UNSLOTH
screen -L -Logfile ./logging_output/gemma-2-9b-06-30-24-unsloth.0 \
python fine_tuning.py \
--prompt-format chat_ml \
--save-model-path ./models/gemma-2-9b-06-29-24-unsloth-1 \
--model-id unsloth/gemma-2-9b-bnb-4bit \
--epochs 5 \
--train-batch-size 4 \
--eval-batch-size 4 \
--r 16 \
--lora-alpha 32 \
--run-name gemma-2-9b-06-29-24-unsloth-1 \
--experiment-name Gemma \
--run-description "Gemma 2, 9B model. 5 epochs." \
--do-eval True \
--eval-steps 1 \
--unsloth

# Llama 3
# export PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True ; \
# screen -L -Logfile ./logging_output/llama_8b.4 \
# python fine_tuning.py \
# --prompt-format llama \
# --save-model-path ./models/llama-3-8b-instruct-5 \
# --model-id meta-llama/Meta-Llama-3-8B-Instruct \
# --epochs 10 \
# --train-batch-size 4 \
# --eval-batch-size 4 \
# --r 32 \
# --lora-alpha 64 \
# --run-name llama_3_8b_instruct_5 \
# --experiment-name Llama \
# --run-description "Trying out Llama 3 8B Instruct! 06/14/24"

# Phi 3B UNSLOTH
# screen -L -Logfile ./logging_output/phi-3-06-29-24-unsloth.1 \
# python fine_tuning.py \
# --prompt-format chat_ml \
# --save-model-path ./models/phi-3-06-29-24-unsloth-1 \
# --model-id unsloth/Phi-3-mini-4k-instruct \
# --epochs 25 \
# --train-batch-size 16 \
# --eval-batch-size 16 \
# --r 32 \
# --lora-alpha 32 \
# --run-name phi-3-06-29-24-unsloth-2 \
# --experiment-name Phi \
# --run-description "fine tuning phi 3B. 25 epochs, 16 batch size" \
# --do-eval True \
# --eval-steps 1 \
# --unsloth

# Qwen 2 1.5B UNSLOTH
# screen -L -Logfile ./logging_output/qwen-2-1.5-06-29-24-unsloth.0 \
# python fine_tuning.py \
# --prompt-format chat_ml \
# --save-model-path ./models/qwen-2-1.5-06-29-24-unsloth-2 \
# --model-id unsloth/Qwen2-1.5B \
# --epochs 5 \
# --train-batch-size 4 \
# --eval-batch-size 4 \
# --r 16 \
# --lora-alpha 32 \
# --run-name qwen-2-1.5-06-29-24-unsloth-1 \
# --experiment-name Phi \
# --run-description "just testing if eval loss is broken" \
# --do-eval True \
# --unsloth

############################################################################################################
###################### KTO #################################################################################
############################################################################################################

# Mistral
# screen -L -Logfile ./logging_output/kto_fine_tune.2 \
# python fine_tuning.py \
# --prompt-format mistral \
# --training-type KTO \
# --dataset-path data/processed_dataset_full_KTO.jsonl \
# --save-model-path ./models/kto-ft-mistral-7b-instruct-v02-3 \
# --model-id mistralai/Mistral-7B-Instruct-v0.2 \
# --epochs 5 \
# --learning-rate 1e-4 \
# --train-batch-size 8 \
# --eval-batch-size 8 \
# --r 32 \
# --lora-alpha 64 \
# --run-name kto_mistral_7b_v02_ft_3 \
# --experiment-name KTO \
# --run-description "KTO Fine tune Mistral 7B v02."

# Llama
# screen -L -Logfile ./logging_output/kto_llama.2 \
# python fine_tuning.py \
# --training-type KTO \
# --dataset-path data/processed_dataset_full_KTO.jsonl \
# --prompt-format llama \
# --save-model-path ./models/llama-3-8b-instruct-KTO-4 \
# --model-id meta-llama/Meta-Llama-3-8B-Instruct \
# --epochs 10 \
# --learning-rate 1e-5 \
# --train-batch-size 4 \
# --eval-batch-size 4 \
# --beta 0.1 \
# --desirable-weight 0.7 \
# --run-name kto_llama_3_8b_ft_4 \
# --experiment-name KTO \
# --run-description "KTO Fine tune Llama 3 8B. \
# Reducing learning rate by magnitude 10 and upping epochs 5 -> 10. \
# Desirable weight at 0.7."

# Trying the premade script
# screen -L -Logfile ./logging_output/kto_fine_tune.1 \
# python kto.py \
#     --model_name_or_path=mistralai/Mistral-7B-Instruct-v0.2 \
#     --per_device_train_batch_size 8 \
#     --num_train_epochs 1 \
#     --learning_rate 1e-4 \
#     --lr_scheduler_type=cosine \
#     --gradient_accumulation_steps 1 \
#     --logging_steps 10 \
#     --eval_steps 500 \
#     --output_dir=./models/kto-aligned-model-lora \
#     --warmup_ratio 0.1 \
#     --bf16 \
#     --logging_first_step \
#     --use_peft \
#     --load_in_4bit \
#     --lora_target_modules=all-linear \
#     --lora_r=16 \
#     --lora_alpha=32

# Optuna studies
# screen -L -Logfile ./logging_output/optuna_study.0 \
# python optuna.py \
# --prompt-format llama \
# --model-id meta-llama/Meta-Llama-3-8B-Instruct \
# --experiment-name Optuna \
# --optuna