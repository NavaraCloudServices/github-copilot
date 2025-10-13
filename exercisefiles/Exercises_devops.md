# Goal

The goal is to create Scripts (Bash/PowerShell) and Infrastructure as Code (Terraform or Bicep).

Follow the instructions below and try to use GitHub Copilot as much as possible.
Try different things and see what GitHub Copilot can do for you, like generating your code, add comments, tests or a Docker file.

> First, follow the [pre-requisites.md](../README.md#pre-requisites) to setup GitHub Copilot for your IDE.

### Exercise 1: Setup and Code Completions


>The goal of this exercise is to verify if GitHub Copilot is working.

You are managing a CI/CD pipeline that stores deployment artifacts in a directory (or a storage bucket, optional). Over time, these artifacts pile up, consuming unnecessary storage.

Your task is to write a Bash or PowerShell script that:
- Delete deployment artifacts older than N days.

See the [scripts](/scripts/) directory.

Create the script as you normally would do. You will notice that GitHub Copilot will suggest code as you type. You can accept the suggestions by pressing `Tab` or `Enter`.

>The goal of this exercise is to transform your comments to working code as you type.

GitHub Copilot offers coding suggestions as you type. GitHub Copilot will automatically suggest the rest of the function. To accept the suggestion, press `Tab`. Within Jetbrains IDE's you can enable code completions with `Alt + \` (Windows) and `Option (⌥) + \` for Mac 

You can describe something you want to do using natural language within a comment, and GitHub Copilot will suggest the code to accomplish your goal. Use your fresh prompting skill to first type in your requirement as a code comment.

GitHub Copilot will automatically suggest code. To accept the suggestion, press `Tab`.

Click [here](https://docs.github.com/en/copilot/using-github-copilot/getting-code-suggestions-in-your-ide-with-github-copilot#getting-code-suggestions-2) for more information on GitHub Copilot code suggestions

Implement the following:

#### Extend your cleanup script 

Extend your cleanup script to include the following functionality:
- Add a dry-run option (list of files/directories to be deleted)
- Make it recursive
- Logs the deleted files to a log file.
- Parameterize it (e.g., --dry-run, --days, --path, etc.)

#### Create a pipeline

Create a pipeline that runs the script. You can use GitHub Actions, Azure DevOps, or any other CI/CD tool you prefer. GitHub Copilot helps you understanding the tool you use by put it in a comment in your yaml file

### Exercise 2: GitHub Copilot Chat Ask mode

> The goal of this exercise is to learn how to use GitHub Copilot Chat in "ask mode" to understand your scripts, explore best practices, and validate your DevOps approach before implementing more complex infrastructure.

GitHub Copilot Chat isn't just for generating code - it's a powerful tool for learning DevOps best practices and understanding infrastructure decisions. In this exercise, you'll practice asking questions to deepen your understanding of your scripts and plan your infrastructure strategy.

Open GitHub Copilot Chat (`Control+Command+i` on Mac / `Ctrl+Alt+i` on Windows/Linux) and practice the following:

#### Ask about the existing code:

1. **Understand your cleanup script**: Select the code from Exercise 1 and ask:
   - "Explain what this #selection script does step by step"
   - "What are potential issues with deleting files this way?"
   - "How can I make this script more robust and production-ready?"
   - "What security considerations should I be aware of when running cleanup scripts?"

2. **Explore scripting best practices**: Ask questions like:
   - "What's the difference between using Bash and PowerShell for automation scripts?"
   - "How should I handle errors and logging in production scripts?"
   - "What are best practices for parameterizing scripts?"
   - "Should I use exit codes? How do they work in CI/CD pipelines?"

3. **Understand your pipeline**: Select your pipeline YAML code and ask:
   - "Explain how this #selection pipeline works"
   - "What triggers should I use for cleanup jobs?"
   - "How can I schedule this to run periodically?"
   - "What permissions does this pipeline need?"

### Exercise 3: GitHub Copilot Chat Agent mode

>The goal of this exercise is to get familiar with the GitHub Copilot Chat feature.

You can ask GitHub Copilot Chat to give code suggestions, explain code, generate unit tests, and suggest code fixes. To open the chat view, click the chat icon in the activity bar or press `Control+Command+i` (Mac) / `Ctrl+Alt+i` (Windows/Linux).

Implement the following methods:

#### Add more requirements to your cleanup script

Extend your cleanup script to include the following functionality:
- Make it runnable on Windows and Linux
- Add robust error handling:
   - If a file can’t be deleted, log the error
   - Retry a few times
- When a file cannot be deleted send out a notification by e-mail or slack

#### Create a Basic VM with Terraform (AWS or Azure) or Bicep (Azure only)

You can work in the [terraform](./terraform/) or [bicep](./bicep/) directory.

Create a VM with the following specs:
- a 16GB RAM instance
- 4 vCPUs
- Ubuntu 22.04 LTS
- Public IP
- SSH key pair
- No VPC or VNET

> With common infrastructure as code you will receive the 'matched public code' message often. You can work around this by specifying unique names for your resources. Name them after your favorite movie, book or serie characters.

> Use the above information in the GitHub Copilot Chat window to create a prompt and make it as detailed as possible. GitHub Copilot will use by default the open file as context in order to generate the suggestion so close this readme.

####  Basic Networking

- Add a VPC or VNET
- Add a subnet
- Put the VM in the subnet

#### Create Storage (S3 or Blob)

- Create a storage account (S3 or Blob Storage)
- Configure access policies
- Set up lifecycle management rules

### Exercise 4: Refactoring and optimizing

>The goal of this exersize is to refactor your code from Exercise 3.

#### Use Variables, Outputs and Modules

- Move hardcoded values to variable files.
- Create modules for re-usability (yes this might sound tedius for this assignment, but it is a good practice).
- For Bicep, create a main.bicep file that calls the modules including the input parameters
- For Terraform, create a main.tf file that calls the modules.

#### Make environmentindpendent

- Your organization has multiple environments (dev, tst, prd). Make sure your code is environment independent. All resources should be created in the same way, regardless of the environment but with a postfix with the environment name.

### Exercise 5: Document the code

>The goal is to let GitHub Copilot generate documentation. 

In the chat, ask GitHub Copilot to document your code. Tip: use the `#file` option if available. Write both inline comments and a README.md file.

### Exercise 6: Building tests

>The goal is to let GitHub Copilot write tests for your code.

With terratest (based on Go) you can write tests for your terraform code. You can find a basic setup in the [test](./test/) directory. You can use the built-in Visual Studio Code test runner or the command line to run the tests.

> If you are using Visual Studio Code, you can try out GitHub Copilot Chat Agent to iterate over the code and test outcomes.

### Exercise 7: Custom Instructions

> The goal of this exercise is to create and use custom instructions to guide GitHub Copilot's behavior according to your DevOps team's standards, infrastructure patterns, and organizational policies.

Custom instructions help ensure that GitHub Copilot generates infrastructure code and scripts that follow your organization's best practices, naming conventions, and security requirements.

#### Part 1: Create DevOps Custom Instructions

Create a custom instructions file for your DevOps project. You can create a `.github/copilot-instructions.md` file in your repository.

Your custom instructions should include:

1. **Infrastructure Naming Conventions**: Define your organization's naming standards
   - Resource naming patterns (e.g., `<project>-<env>-<resource>-<region>`)
   - Tag requirements (Cost Center, Owner, Environment, etc.)
   - Environment naming (dev, tst, acc, prd)

2. **Infrastructure as Code Standards**:
   - Module structure and organization
   - Variable naming conventions
   - Output requirements
   - State management approach (remote vs local)

3. **Security and Compliance Requirements**:
   - Required encryption settings
   - Network security rules
   - Access control patterns
   - Secrets management approach

4. **Scripting Standards**:
   - Preferred shell (bash vs PowerShell)
   - Error handling patterns
   - Logging requirements
   - Cross-platform compatibility needs

#### Part 2: Test Your Custom Instructions with Infrastructure

Now create infrastructure components that will test if GitHub Copilot follows your custom DevOps instructions:

1. **Create a Monitoring Setup (Terraform or Bicep)**:
   - Create a Log Analytics Workspace or CloudWatch
   - Follow your naming conventions
   - Include all required tags
   - Use variables for environment-specific values
   - Add proper outputs

2. **Create a Backup Script**:
   - Write a script to backup databases or volumes
   - Follow your scripting standards (error handling, logging)
   - Make it cross-platform or specify target OS
   - Include dry-run mode
   - Add timestamp-based naming

3. **Create a Network Security Module**:
   - Create a reusable module for Network Security Groups or Security Groups
   - Follow your security requirements (deny all inbound by default)
   - Use your variable naming conventions
   - Include comprehensive outputs
   - Add proper documentation

> When implementing IaC, pay attention to how GitHub Copilot's suggestions align with your custom instructions. If suggestions don't follow your rules, refine your instructions to be more specific.