# eval

# Mistral (Unsloth)
# screen -L -Logfile ./logging_output/eval.0 \
# python eval_ft.py \
# --prompt-format mistral \
# --save-model-path ./models/ft-mistral-7b-instruct-v03-10 \
# --model-id unsloth/mistral-7b-instruct-v0.3-bnb-4bit \
# --user-input "cheap, phone, play" \
# --num-inputs 20 \
# --unsloth
# # --input-file-path ./data/processed_dataset_full.jsonl \


# Gemma
# screen -L -Logfile ./logging_output/eval.0 \
# python eval_ft.py \
# --prompt-format chat_ml \
# --model-id unsloth/gemma-2b-it-bnb-4bit \
# --model-path ./models/gemma-2b-it-06-13-24-unsloth-1 \
# --user-input "cheap, phone, play" \
# --num-inputs 20 \
# --unsloth
# # --input-file-path ./data/processed_dataset_full.jsonl \

# Phi 3
screen -L -Logfile ./logging_output/eval.0 \
python eval_ft.py \
--prompt-format chat_ml \
--model-id unsloth/Phi-3-mini-4k-instruct \
--model-path ./models/phi-3-06-29-24-unsloth-1 \
--user-input "cheap, phone, play" \
--unsloth
# --num-inputs 20 \
# --input-file-path ./data/processed_dataset_full.jsonl \

# Qwen 2 1.5B
# screen -L -Logfile ./logging_output/eval.0 \
# python eval_ft.py \
# --prompt-format chat_ml \
# --save-model-path ./models/qwen-2-1.5-06-29-24-unsloth-2 \
# --model-id unsloth/Qwen2-1.5B \
# --user-input "cheap, phone, play" \
# --num-inputs 20 \
# --unsloth
# # --input-file-path ./data/processed_dataset_full.jsonl \