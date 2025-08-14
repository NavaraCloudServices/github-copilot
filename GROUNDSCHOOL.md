# Goal

The goal of a GitHub Copilot Ground School is to learn how to use it through a set of [Exercises](#exercises). These exercises consist of building a web server when you are a developer, or implementing data processing when you are a data engineer/scientist, or working with scripts/pipelines and infrastructure as code if you are a DevOps engineer.

In addition to the Exercises, we have several [Challenges](#challenges-instructions) to start coding for fun.

**Pre-requisites**

See [Setup Instructions](./README.md#pre-requisites) for the pre-requisites required to participate

## Available Exercises

The exercises are divided into three categories: Developer, Data Engineer/Scientist and DevOps Engineer. The exercises are designed to help you learn how to use GitHub Copilot in different programming languages and environments.

[Exercises Developer](./exercisefiles/Exercises_developer.md)

[Exercises Data Engineer/Scientist](./exercisefiles/Exercises_data.md)

[Exercises DevOps](./exercisefiles/Exercises_devops.md)

Please check the language instructions in the table below:

| Language                                 | Type                    | Instructions                                       | Codespaces                                                                                                                                                                                                                         | Notes                                                            |
| ---------------------------------------- | ----------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| C++                                      | Developer               | [Link](./exercisefiles/cpp/README.md)              | [![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/NavaraCloudServices/github-copilot/tree/main?devcontainer_path=.devcontainer%2Fexercise%20-%20cpp%2Fdevcontainer.json)              | Select 'Conan' as profile                                        |
| C#                                       | Developer               | [Link](./exercisefiles/dotnet/README.md)           | [![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/NavaraCloudServices/github-copilot/tree/main?devcontainer_path=.devcontainer%2Fexercise%20-%20dotnet%2Fdevcontainer.json)           |                                                                  |
| DevOps (Terraform/Bicep/PowerShell/Bash) | DevOps Engineer         | [Link](./exercisefiles/devops/README.md)           | [![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/NavaraCloudServices/github-copilot/tree/main?devcontainer_path=.devcontainer%2Fexercise%20-%20devops%2Fdevcontainer.json)           | Experimental                                                     |
| Go                                       | Developer               | [Link](./exercisefiles/go/README.md)               | [![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/NavaraCloudServices/github-copilot/tree/main?devcontainer_path=.devcontainer%2Fexercise%20-%20go%2Fdevcontainer.json)               |                                                                  |
| Java Quarkus                             | Developer               | [Link](./exercisefiles/java/quarkus/README.md)     | [![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/NavaraCloudServices/github-copilot/tree/main?devcontainer_path=.devcontainer%2Fexercise%20-%20java%2Fdevcontainer.json)             | Import the projects (Java Projects) to enable the test discovery |
| Java Springboot                          | Developer               | [Link](./exercisefiles/java/springboot/README.md)  | [![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/NavaraCloudServices/github-copilot/tree/main?devcontainer_path=.devcontainer%2Fexercise%20-%20java%2Fdevcontainer.json)             | Import the projects (Java Projects) to enable the test discovery |
| PHP                                      | Developer               | [Link](./exercisefiles/php/README.md)              | [![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/NavaraCloudServices/github-copilot/tree/main?devcontainer_path=.devcontainer%2Fexercise%20-%20php%2Fdevcontainer.json)              |                                                                  |
| Python                                   | Developer               | [Link](./exercisefiles/python/README.md)           | [![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/NavaraCloudServices/github-copilot/tree/main?devcontainer_path=.devcontainer%2Fexercise%20-%20python%2Fdevcontainer.json)           |
| Python (Data Engineering)                | Data Engineer/Scientist | [Link](./exercisefiles/data_engineering/README.md) | [![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/NavaraCloudServices/github-copilot/tree/main?devcontainer_path=.devcontainer%2Fexercise%20-%20data_engineering%2Fdevcontainer.json) |                                                                  |
| Javascript                               | Developer               | [Link](./exercisefiles/javascript/README.md)       | [![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/NavaraCloudServices/github-copilot/tree/main?devcontainer_path=.devcontainer%2Fexercise%20-%20node%2Fdevcontainer.json)             |                                                                  |
| Typescript                               | Developer               | [Link](./exercisefiles/typescript/README.md)       | [![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/NavaraCloudServices/github-copilot/tree/main?devcontainer_path=.devcontainer%2Fexercise%20-%20node%2Fdevcontainer.json)             |                                                                  |

There are three ways to execute the exercises:

1. **Run on your local machine**: You can run the exercises on your local machine. Please make sure you have the required software installed. You can find the instructions in the language readme files. Look for prerequisites
2. **Run on DevContainers (Visual Studio Code)**: You can make use of DevContainers within Visual Studio Code. Use the [VSCode documentation to set up your machine](https://code.visualstudio.com/docs/devcontainers/tutorial). After setting up your local machine, go to your Command Palette in VSCode and select `Dev Containers: Rebuild and open in Container`. Choose the correct container. You don't have to worry about the prerequisites.
3. **Open in GitHub Codespace (Visual Studio Code)**: You can run the exercises on GitHub Codespaces. See explaination of [GitHub Codespaces](./CODESPACES.md)

## Challenges instructions

### Developer

- [Develop a shop cart](./challenges/eshop/eshop.md)
- [Develop a memory game](./challenges/memorygame/memorygame.md)
- [Develop a chat based on websockets](./challenges/chatwebsockets/chatwebsockets.md)

### Data

- [Analysis cryptocurrency market analysis](./challenges/cryptoanalisis/crypto.md)
- [COVID19 Worldwide Testing Data (Python Data Engineer)](./challenges/python_data_engineer/README.md)
- [Decision Tree Classification Based on Diabetes Dataset (Python Data Scientist)](./challenges/python_data_scientist/README.md)

### DevOps

- [Infrastructure as Code](./challenges/devops_application/README.md)
- [Deploy Kubernetes Application](./challenges/devops_kubernetesapp/README.md)

If you don't have your local development environment ready (installing SDKs), you can use [GitHub Codespaces](./CODESPACES.md#available-codespaces) for this as well.

