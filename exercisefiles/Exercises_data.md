# Data Engineering and Analysis with GitHub Copilot

## Exercises

The goal of these exercises is to use GitHub Copilot to help load, clean, analyze, and test data related to [Punxsutawney Phil's](https://en.wikipedia.org/wiki/Punxsutawney_Phil) predictions and subsequent weather conditions.

**Dataset:** `punxsutawney_phil.csv`

**Main Script:** `phil_analysis.py`
**Test Script:** `test_phil_analysis.py`


### Exercise 1: Setup and Code Completions

> The goal is to load the dataset using Pandas and perform initial inspections, letting GitHub Copilot assist with basic code completion.

**General Tips:**

- Use comments to describe what you want to do.
- Add the columns of your table (i.e. output of `df.info()`) to your prompt to help GitHub Copilot understand the context.

**Tasks:**

1.  Open `phil_analysis.py`.
2.  You will notice that there are comments like loading the dataset, displaying the last 10 rows, and printing the DataFrame info. These comments are hints for what you need to do.
3.  Use GitHub Copilot autocompletion to implement the code. 
4.  Make sure that the Temperature columns are numeric types.
5.  Run the script (`python phil_analysis.py`) to ensure it loads the data correctly and prints the information.


> The goal is to clean the data, handle missing values, and create a standardized prediction column using GitHub Copilot's inline suggestions.

**Tasks:**

1.  Phil's predictions are varied ('Full Shadow', 'No Shadow', 'Partial Shadow', 'No Record'). Let's simplify this. A common interpretation is "Full Shadow" means 6 more weeks of winter ("Long Winter"), while "No Shadow" (and often "Partial Shadow") means an early spring ("Early Spring").
    Type the following comment and let GitHub Copilot generate the logic:
    ```python
    # Create a 'Simplified Prediction' column based on 'Punxsutawney Phil'
    # 'Full Shadow' maps to 'Long Winter'
    # 'No Shadow' or 'Partial Shadow' maps to 'Early Spring'
    # 'No Record' maps to 'Unknown'
    ```
    _(Self-Correction: Review GitHub Copilot's suggestion. Does it handle all cases correctly? Does it use `.map`, `.apply`, or `np.select`? Ensure it aligns with the logic described.)_
2.  Change the temperature columns from Fahrenheit to Celsius using GitHub Copilot.
    _hint_: Use 'in the columns that contain "Temperature"' in your prompt.
    _(Self-Correction: Review GitHub Copilot's suggestion. Does it handle NaN values? Is the conversion correct?)_
3.  There are a few missing values in the dataset. We can drop the rows, or we can impute them. Choose one of the following:
    - Drop rows with missing values.
    - Fill missing values with the mean or median of the column.
    - Use forward fill or backward fill methods.
4.  Standardize the column names to be snake_case. For example, 'February Average Temperature (Pennsylvania)' should become 'february_average_temperature_pennsylvania'.
    \*(Self-Correction: Review GitHub Copilot's suggestion. Does it handle all cases? Are the new column names clear and consistent?)\_
5.  We also want to add a column that calculates the difference between February and March temperatures. Make separate columns for the total, northeast, midwest and pensylvania differences. This will be helpful for our accuracy check later.
    _(Self-Correction: Review GitHub Copilot's suggestion. Did you get three separate columns? Is the calculation correct?)_
6.  Inspect the results. Print a few values, analyze the value counts of the simplified prediction column, and check the DataFrame info again.

### Exercise 2: GitHub Copilot Chat Ask mode

> The goal of this exercise is to learn how to use GitHub Copilot Chat in "ask mode" to understand your data transformations, explore alternative approaches, and validate your cleaning logic before implementing more complex features.

GitHub Copilot Chat can help you understand your data analysis choices and explore different data cleaning strategies. In this exercise, you'll practice asking questions to gain insights into your code and plan your next steps.

Open GitHub Copilot Chat (`Control+Command+i` on Mac / `Ctrl+Alt+i` on Windows/Linux) and practice the following:

#### Ask about the existing code:

1. **Understand your data cleaning**: Select the code from Exercise 1 where you created the 'Simplified Prediction' column and ask:
   - "Explain what this #selection does and why this mapping makes sense"
   - "What are potential issues with this categorization approach?"
   - "Are there any edge cases I haven't considered?"

2. **Explore data quality**: Ask questions like:
   - "What are best practices for handling missing temperature data in time series analysis?"
   - "Should I use mean, median, or forward fill for missing temperature values? What are the tradeoffs?"
   - "How can I detect outliers in temperature data?"

3. **Understand your transformations**: Select your Fahrenheit to Celsius conversion code and ask:
   - "Is this conversion formula correct for all temperature scales?"
   - "What happens if there are NaN values in the temperature columns?"
   - "Are there any precision issues I should be aware of?"

#### Validate your approach:

Before moving to Exercise 3's accuracy calculation, ask GitHub Copilot Chat:
- "What are different ways to measure if a weather prediction was accurate?"
- "How should I define 'significantly colder' when comparing monthly temperatures?"
- "What statistical methods could I use to determine if March was warmer than February?"
- "Show me examples of how to compare temperature differences in pandas"

#### Explore your dataset:

Ask exploratory questions about your data:
- "What patterns should I look for in the temperature difference columns I created?"
- "How can I visualize the relationship between Phil's predictions and actual temperature changes?"
- "What does the distribution of prediction types tell me about the dataset?"

> 💡 **Tip**: Use the ask mode to understand the implications of your data cleaning decisions. This helps you make informed choices about handling missing data, outliers, and transformations before implementing accuracy metrics.

**Checkpoint**: Before moving to Exercise 3, ensure you understand:
- Why you chose your missing data strategy
- How your simplified predictions map to the original values
- What the temperature differences represent
- How you'll define "accuracy" in the next exercise

### Exercise 3: GitHub Copilot Chat Agent mode

> The goal is to use GitHub Copilot Chat to define a function that determines if Phil's prediction was "correct" based on subsequent temperatures, potentially incorporating external data.

**Tasks:**

1.  **Define "Accuracy":** Let's define a simple accuracy rule:

    - If Phil predicted 'Long Winter', was March significantly colder or similar than February?
    - If Phil predicted 'Early Spring', was March warmer than February?
    - We'll focus on the _Pennsylvania_ temperatures for simplicity. Let's define "significantly colder or similar" as March being lower than 3 degree Celsius colder than February, and "warmer" as March being warmer than Feb by any amount higher than 3 degrees Celsius.

2.  **Use GitHub Copilot Chat:**

    - Open the GitHub Copilot Chat panel.
    - Finish the following prompt (adjust based on your exact column names if needed):

      ```
      Write a Python function called `check_prediction_accuracy` that takes a single row...
      ```

      Include the logic for checking the prediction accuracy based on the rules defined above. The function should return:

      - `True` if the prediction was correct,
      - `False` if it was incorrect,
      - `None` if the prediction is 'Unknown' or if any temperature data is missing.

    - Ask GitHub Copilot Chat how to apply this function to create a new 'prediction_correct' column.

3.  **Analyze Results:** Ask GitHub Copilot to display the results of the accuracy check in a graph. Here are a few possible graphs you could create:
    - A bar chart showing the count of correct vs incorrect predictions.
    - A line graph showing the rolling average accuracy over the years.
    - A scatter plot comparing February and March temperatures with color coding for predictions.
    - A histogram of the temperature differences for each prediction type.
    - Try something yourself!

### Exercise 4: Refactoring, Optimization, and Synthetic Data

> The goal is to use GitHub Copilot to refactor the accuracy calculation for potential performance improvement and readability. We also take a step into generating synthetic data.

**Tasks:**

1.  **Refactoring `.apply()`:** The `df.apply(..., axis=1)` method used in Exercise 3 can be slow on very large datasets. Let's try to vectorize it.

    - Ask GitHub Copilot Chat or use inline comments/edit features:
      ```
      Refactor the creation of the 'Accuracy' column. Instead of using .apply() with the `check_prediction_accuracy` function, use vectorized pandas/numpy operations (like np.where or boolean indexing) based on the same logic defined in the function. Handle NaN values appropriately.
      ```
    - **Pitfall:** Carefully compare the results of the vectorized approach (`df['Accuracy_vectorized'].value_counts(dropna=False)`) with the `.apply()` approach (`df['Accuracy'].value_counts(dropna=False)`). Do they produce the _exact_ same counts for True, False, and NaN? Sometimes vectorized operations handle edge cases or NaNs slightly differently. Use GitHub Copilot Chat if you see discrepancies: "Why might the results of the `.apply` method and the `np.where` method differ for calculating accuracy?"

2.  **Generating Synthetic Data:** Let's generate some fake data to potentially test our functions later.
    - Ask GitHub Copilot Chat:
      ```
      Generate a Python script using pandas and numpy to create a synthetic DataFrame called `synthetic_df` with 100 rows. It should have columns:
      - 'Year': Integers from 2000 to 2099.
      - 'Punxsutawney Phil': Randomly 'Full Shadow' or 'No Shadow'.
      - 'February Average Temperature (Pennsylvania)': Random float between 25.0 and 40.0.
      - 'March Average Temperature (Pennsylvania)': Random float between 30.0 and 50.0.
      Ensure appropriate imports for pandas and numpy.
      ```

### Exercise 5: Documenting the Analysis

> The goal is to use GitHub Copilot to generate docstrings for functions and create a README file explaining the script.

**Tasks:**

1.  Generate Docstrings and inline comments
2.  **Create README:**

    - Ask GitHub Copilot Chat (you can reference your script using `#file phil_analysis.py` if your IDE supports it):

      ```
      Create a README.md file for the script `phil_analysis.py`.

      It should include:
      - A brief description: Analyzing Punxsutawney Phil's Groundhog Day predictions against historical temperature data.
      - Data Source: Mentions `punxsutawney_phil.csv`.
      - Requirements: Lists necessary libraries (pandas, numpy, pytest, requests).
      - How to Run: `python phil_analysis.py`.
      - Key Steps: Briefly outline the main steps performed (loading, cleaning, simplifying predictions, checking accuracy).
      ```

### Exercise 6: Testing the Logic

> The goal is to use GitHub Copilot to generate unit tests for the data cleaning and accuracy logic using `pytest`.

**Tasks:**

1.  In the file named `test_phil_analysis.py`:
2.  Create a test function to check the data loading and cleaning process. Use GitHub Copilot to generate a test function that checks:

    - The DataFrame is loaded correctly.
    - The expected columns are present.
    - The simplified prediction column has the correct values.
    - Add tests and assertions for the previous exercises.

3.  **Run Tests:**
    - Open your terminal in the project directory.
    - Run `pytest`.
    - **Pitfall / Debugging:** If any tests fail, examine the error messages. Use GitHub Copilot Chat to help understand _why_ a test might be failing. Use the context of the failing test and the relevant function/logic from `phil_analysis.py` in Chat and ask: "This pytest test is failing. Can you help me debug the function/logic based on this test failure?" This forces interaction beyond simple generation. Did the original logic handle an edge case correctly? Did the test make a wrong assumption?

### Exercise 7: Custom Instructions

> The goal of this exercise is to create and use custom instructions to guide GitHub Copilot's behavior according to your data team's standards, analysis patterns, and data quality requirements.

Custom instructions help ensure that GitHub Copilot generates data analysis code that follows your organization's best practices, coding standards, and data governance policies.

#### Part 1: Create Data Engineering Custom Instructions

Create a custom instructions file for your data project. You can create a `.github/copilot-instructions.md` file in your repository.

Your custom instructions should include:

1. **Data Analysis Standards**: Define your team's preferred patterns
   - Pandas vs Polars vs PySpark preferences
   - Column naming conventions (snake_case, lowercase, etc.)
   - DataFrame operation patterns (method chaining, intermediate variables)
   - Missing data handling strategy

2. **Code Quality Requirements**:
   - Type hints for function parameters and returns
   - Docstring format (NumPy, Google, or reStructuredText style)
   - Error handling patterns
   - Logging requirements

3. **Data Quality and Validation**:
   - Required data validation steps
   - Acceptable missing data thresholds
   - Outlier detection approaches
   - Data type enforcement

4. **Testing and Documentation**:
   - Test coverage requirements
   - Test data generation patterns
   - Documentation structure
   - Assertion patterns for data validation

#### Part 2: Test Your Custom Instructions with Data Analysis

Now create data analysis functions that will test if GitHub Copilot follows your custom data instructions:

1. **Create a Data Validation Function**:
   - Write `validate_weather_data(df: pd.DataFrame) -> Dict[str, Any]` 
   - Check for required columns
   - Validate temperature ranges (e.g., -50 to 50 Celsius)
   - Check for missing data percentages
   - Return a validation report dictionary
   - Follow your docstring and type hint standards

2. **Create a Data Cleaning Pipeline Function**:
   - Write `clean_temperature_data(df: pd.DataFrame) -> pd.DataFrame`
   - Standardize column names to snake_case
   - Handle missing temperature values per your strategy
   - Detect and flag outliers
   - Add logging for each transformation step
   - Follow your missing data handling standards

3. **Create an Analysis Summary Function**:
   - Write `generate_prediction_summary(df: pd.DataFrame) -> pd.DataFrame`
   - Calculate accuracy by year, decade, or region
   - Use proper aggregation methods
   - Return results with clear column names
   - Include data validation before processing