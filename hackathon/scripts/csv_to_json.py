#!/usr/bin/env python3
"""
Script to update the goals.json file from the edited CSV file.
This allows you to edit challenges in a spreadsheet and then update the original JSON.
"""

import json
import csv
import sys
from pathlib import Path


def csv_to_json(csv_file_path="challenges.csv", json_file_path="../goals.json"):
    """
    Update the challenges array in the JSON file from CSV data.
    
    Args:
        csv_file_path (str): Path to the input CSV file
        json_file_path (str): Path to the JSON file to update
    """
    try:
        # Read the CSV file
        challenges = []
        with open(csv_file_path, 'r', encoding='utf-8') as csv_file:
            reader = csv.DictReader(csv_file)
            
            for row in reader:
                # Convert string values back to appropriate types
                challenge = {}
                for key, value in row.items():
                    if key == 'number' or key == 'points':
                        # Convert to integer
                        challenge[key] = int(value) if value.strip() else 0
                    elif key == 'hints':
                        # Convert pipe-separated string back to array
                        if value.strip():
                            challenge[key] = [hint.strip() for hint in value.split('|') if hint.strip()]
                        else:
                            challenge[key] = []
                    else:
                        # Keep as string
                        challenge[key] = value.strip()
                
                challenges.append(challenge)
        
        if not challenges:
            print("No challenges found in the CSV file.")
            return
        
        # Read the existing JSON file
        with open(json_file_path, 'r', encoding='utf-8') as json_file:
            data = json.load(json_file)
        
        # Update the challenges array
        data['challenges'] = challenges
        
        # Write back to JSON file with proper formatting
        with open(json_file_path, 'w', encoding='utf-8') as json_file:
            json.dump(data, json_file, indent=4, ensure_ascii=False)
        
        print(f"Successfully updated {len(challenges)} challenges in {json_file_path} from {csv_file_path}")
        
    except FileNotFoundError as e:
        print(f"Error: File not found: {e}")
        sys.exit(1)
    except csv.Error as e:
        print(f"Error: Invalid CSV format: {e}")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in '{json_file_path}': {e}")
        sys.exit(1)
    except ValueError as e:
        print(f"Error: Invalid data format: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    # Allow command line arguments for file paths
    csv_path = sys.argv[1] if len(sys.argv) > 1 else "challenges.csv"
    json_path = sys.argv[2] if len(sys.argv) > 2 else "../goals.json"
    
    csv_to_json(csv_path, json_path)
