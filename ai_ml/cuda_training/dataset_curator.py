"""
This script processes user feedback and website data from a mongodb database to create a dataset for training a language model.

It can generate datasets for both supervised fine-tuning (sft) and kernel-based task optimization (kto).

Usage:
    python dataset_curator.py --output-file <output_path> [options]
"""
import argparse
import pymongo
import json
from dotenv import load_dotenv
import os
load_dotenv()

def process_user_feedback_dataset(file_path, dataset_type='SFT', overwrite=True):
    """
    processes the user feedback dataset from a json file.

    args:
        file_path (str): the path to the user feedback dataset json file.
        dataset_type (str, optional): the type of dataset to create (sft or kto). defaults to 'sft'.
        overwrite (bool, optional): whether to overwrite the existing file. defaults to true.

    returns:
        list: a list of processed data entries.
    """
    if os.path.exists(file_path) and not overwrite:
        with open(file_path, 'r') as file:
            data = json.load(file)
    else:
        data = export_mongodb_database(file_path, "user_feedback")

    processed_data = []

    for entry in data:
        query = None
        response = None

        if entry["query"]:
            if len(entry['query']) > 1:
                query = ', '.join(entry['query'][:-1]) + ', ' + entry['query'][-1]
            else:
                query = entry['query'][0]
        else:
            continue
        llm_response = entry['llm_response']
        user_feedback = entry['user_feedback']
        rating = user_feedback['rating']
        alternative_response = user_feedback['alternative_response']

        query = clean_output(query)
        llm_response = clean_output(llm_response)
        alternative_response = clean_output(alternative_response)

        match dataset_type:
            case 'SFT':
                if rating == 'good':
                    response = llm_response
                elif rating == 'bad' and alternative_response:
                    response = alternative_response
                else:
                    continue  # Skip entries where the rating is bad but no alternative response is provided
                processed_entry = {
                    "input": query,
                    "output": response
                }
                processed_data.append(json.dumps(processed_entry))
            
            case 'KTO':
                if rating == 'good':
                    processed_entry = {
                        "prompt": query,
                        "completion": llm_response,
                        "label": True
                    }
                    processed_data.append(json.dumps(processed_entry))
                elif rating == 'bad' and alternative_response:
                    processed_entry = {
                        "prompt": query,
                        "completion": llm_response,
                        "label": True
                    }
                    processed_data.append(json.dumps(processed_entry))
                    processed_entry = {
                        "prompt": query,
                        "completion": alternative_response,
                        "label": False
                    }
                    processed_data.append(json.dumps(processed_entry))
                elif rating == 'bad' and not alternative_response:
                    processed_entry = {
                        "prompt": query,
                        "completion": llm_response,
                        "label": False
                    }
                    processed_data.append(json.dumps(processed_entry))
                else:
                    continue

    return processed_data

def process_website_dataset(file_path, overwrite=True):
    """
    processes the website dataset from a json file.

    args:
        file_path (str): the path to the website dataset json file.
        overwrite (bool, optional): whether to overwrite the existing file. defaults to true.

    returns:
        list: a list of processed data entries.
    """
    if os.path.exists(file_path) and not overwrite:
        with open(file_path, 'r') as file:
            data = json.load(file)
    else:
        data = export_mongodb_database(file_path, "website_sentence")
    
    processed_data = []
    for entry in data:
        if entry["query"]:
            if len(entry['query']) > 1:
                query = ', '.join(entry['query'][:-1]) + ', ' + entry['query'][-1]
            else:
                query = entry['query'][0]
        else:
            continue
        response = entry.get('response', None)        
        if response:
            response = clean_output(response)
        processed_entry = {
            "input": query,
            "output": response
        }
        processed_data.append(json.dumps(processed_entry))

    return processed_data

def clean_output(text):
    """
    cleans the output text by removing extra spaces, converting unicode characters, and removing newline and quote characters.

    args:
        text (str): the text to clean.

    returns:
        str: the cleaned text.
    """
    if text is not None:
        # Remove the extra space at the end of the sentence if it exists
        text = text.rstrip()
        # Convert "\u2019" to "'"
        text = text.replace("\u2019", "'")
        # Convert "\u201c" to "\""
        text = text.replace("\u201d", "")
        # Remove all placed newline characters "\n"
        text = text.replace("\n", "")
        # Remove all escaped character quote marks "\""
        text = text.replace("\"", "")
    return text

def export_mongodb_database(file_path, collection_name):
    """
    exports a mongodb collection to a json file.

    args:
        file_path (str): the path to the output json file.
        collection_name (str): the name of the collection to export.

    returns:
        list: the loaded data from the json file.
    """
    mongodb_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
    client = pymongo.MongoClient(mongodb_uri)
    db = client["mosaic_voice"]
    collection = db[collection_name]

    # Export the database
    data = list(collection.find())

    # Save the exported data to a JSON file
    with open(file_path, 'w') as file:
        json.dump(data, file, default=str)

    # Load the exported data from the JSON file
    with open(file_path, 'r') as file:
        loaded_data = json.load(file)

    return loaded_data


def main():
    """
    the main function for the script.
    """
    parser = argparse.ArgumentParser()
    parser.add_argument('--user-feedback-path', default='./data/mosaic_voice.user_feedback.json', type=str, help='Path to the user feedback dataset JSON file')
    parser.add_argument('--website-path', default='./data/mosaic_voice.website.json', type=str, help='Path to the website dataset JSON file')
    parser.add_argument('--dataset-type', default='SFT', type=str, help='Dataset structure you want (SFT or KTO)')
    parser.add_argument('--output-file', default='./data/processed_dataset_full.jsonl', type=str, help='Path and file name of the final dataset to be saved')
    parser.add_argument('--overwrite', action='store_true', help='Whether to force overwrite already existing local dataset. Default True.')

    args = parser.parse_args()

    processed_dataset = process_user_feedback_dataset(args.user_feedback_path, args.dataset_type, overwrite=args.overwrite)
    if args.dataset_type != 'KTO':
        processed_dataset.extend(process_website_dataset(args.website_path, overwrite=args.overwrite))

    # Saving the processed dataset to a JSONL file
    match args.dataset_type:
        case 'SFT':
            with open(args.output_file, 'w') as file:
                for line in processed_dataset:
                    file.write(line + "\n")
        case 'KTO':
            with open(args.output_file, 'w') as file:
                for line in processed_dataset:
                    file.write(line + "\n")

if __name__ == '__main__':
    main()