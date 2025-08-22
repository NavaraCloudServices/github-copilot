#!/usr/bin/env python3
"""
Script to convert the challenges array from goals.json to CSV format.
This makes it easier to edit the challenges in a spreadsheet application.
"""

import json
import csv
import sys
from pathlib import Path


def json_to_csv(json_file_path="../goals.json", csv_file_path="challenges.csv"):
    """
    Convert the challenges array from JSON to CSV format.
    
    Args:
        json_file_path (str): Path to the input JSON file
        csv_file_path (str): Path to the output CSV file
    """
    try:
        # Read the JSON file
        with open(json_file_path, 'r', encoding='utf-8') as json_file:
            data = json.load(json_file)
        
        # Extract challenges array
        challenges = data.get('challenges', [])
        
        if not challenges:
            print("No challenges found in the JSON file.")
            return
        
        # Define CSV headers based on the challenge structure
        headers = [
            'id',
            'category', 
            'number',
            'title',
            'short_name',
            'description',
            'goal',
            'skill_level',
            'points',
            'hints',
            'success_criteria'
        ]
        
        # Write to CSV
        with open(csv_file_path, 'w', newline='', encoding='utf-8') as csv_file:
            writer = csv.DictWriter(csv_file, fieldnames=headers)
            
            # Write header
            writer.writeheader()
            
            # Write each challenge
            for challenge in challenges:
                # Convert hints array to a pipe-separated string for easier editing
                challenge_copy = challenge.copy()
                if 'hints' in challenge_copy and isinstance(challenge_copy['hints'], list):
                    challenge_copy['hints'] = ' | '.join(challenge_copy['hints'])
                
                writer.writerow(challenge_copy)
        
        print(f"Successfully converted {len(challenges)} challenges from {json_file_path} to {csv_file_path}")
        
    except FileNotFoundError:
        print(f"Error: File '{json_file_path}' not found.")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in '{json_file_path}': {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    # Allow command line arguments for file paths
    json_path = sys.argv[1] if len(sys.argv) > 1 else "../goals.json"
    csv_path = sys.argv[2] if len(sys.argv) > 2 else "challenges.csv"
    
    json_to_csv(json_path, csv_path)
