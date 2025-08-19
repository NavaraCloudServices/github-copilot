# Challenges JSON-CSV Conversion Scripts

This directory contains two Python scripts to help you edit the challenges data in a more convenient CSV format.

## Scripts

### 1. `json_to_csv.py` - Convert JSON to CSV

Converts the challenges array from `goals.json` into a CSV file for easy editing in spreadsheet applications.

**Usage:**
```bash
python3 json_to_csv.py [input_json_file] [output_csv_file]
```

**Default usage:**
```bash
python3 json_to_csv.py
# Creates challenges.csv from goals.json
```

**Custom files:**
```bash
python3 json_to_csv.py my_goals.json my_challenges.csv
```

### 2. `csv_to_json.py` - Convert CSV back to JSON

Updates the challenges array in the JSON file from the edited CSV data.

**Usage:**
```bash
python3 csv_to_json.py [input_csv_file] [target_json_file]
```

**Default usage:**
```bash
python3 csv_to_json.py
# Updates goals.json from challenges.csv
```

**Custom files:**
```bash
python3 csv_to_json.py my_challenges.csv my_goals.json
```

## Workflow

1. **Export to CSV**: Run `json_to_csv.py` to create a CSV file from your JSON
2. **Edit in Excel/Google Sheets**: Open the CSV file in your preferred spreadsheet application
3. **Import back to JSON**: Run `csv_to_json.py` to update the original JSON file

## CSV Format Notes

- **hints**: Multiple hints are separated by ` | ` (pipe with spaces)
- **number** and **points**: Should be numeric values
- **All other fields**: Text strings

## Important Notes

- Always backup your `goals.json` file before running the import script
- The CSV import will completely replace the challenges array in the JSON file
- The original JSON structure (metadata, categories) is preserved
- Make sure to keep the CSV headers intact when editing

## Example Workflow

```bash
# 1. Convert JSON to CSV
python3 json_to_csv.py

# 2. Edit challenges.csv in your spreadsheet application
# (Make your changes, add/remove challenges, etc.)

# 3. Convert back to JSON
python3 csv_to_json.py

# 4. Verify the changes in goals.json
```
