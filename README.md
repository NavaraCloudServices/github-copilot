![alt text](images/navara_banner.png)

# GitHub Copilot Ground School

Supporting GitHub repository for the Navara's GitHub Copilot Ground School

- [Goal](#goal)
- [Pre-requisites](#pre-requisites)
- [Exercises](#available-exercises)
- [Challenges instructions](#challenges-instructions)
- [Quick Links](#quick-links)

## Forked from

This repository was forked from the official [Microsoft Copilot Hackathon](https://github.com/microsoft/CopilotHackathon). Thank you to the Microsoft team for their great work!

## Goal

The goal of a GitHub Copilot Ground School is to learn how to use it through a set of [Exercises](#exercises). These exercises consist of building a web server using Nodejs with different functionalities, a .NET Web API, C++, Python or a Java Rest API (either Spring Boot or Quarkus).

For those who are already familiar with GitHub Copilot, we have also defined a series of [Challenges](#challenges-instructions) to test your skills. You will find an introduction and short guidance to help you solve the challenge, but you will have to do most of the work on your own (with the help of Copilot, of course).

GitHub Copilot is an AI-powered code assistant that helps developers write better code faster. It uses machine learning models trained on billions of lines of code to suggest whole lines or entire functions based on the context of what you’re working on. By using Copilot, you can learn how to write better code and improve your productivity.

Remember:

- As you type, GitHub Copilot will make suggestions, you can accept them by pressing Tab.
- If nothing shows up after Copilot writes some lines, press enter and wait a couple of seconds.
- Press **Ctrl + Enter**, to see more suggestions.
- Use Copilot chat to support your learning and development.
- Press **Ctrl + i** to start Copilot chat inline within your code.

## Pre-requisites

You need a GitHub Copilot license. You can participate with a free license, however, we expect that you hit the rate limit of the free license during the challenges.

There are three ways to execute the exercises.

### Run on you local machine

Please update your IDE to the latest version. This is important to have the best experience with GitHub Copilot.

Install the Copilot Extension for your IDE:

- [Eclipse Copilot Extension](https://docs.github.com/en/copilot/using-github-copilot/getting-code-suggestions-in-your-ide-with-github-copilot?tool=eclipse)
- [JetBrains Copilot Extension](https://docs.github.com/en/copilot/using-github-copilot/getting-code-suggestions-in-your-ide-with-github-copilot?tool=jetbrains)
- [Vim/Nevim Copilot Extension](https://docs.github.com/en/copilot/using-github-copilot/getting-code-suggestions-in-your-ide-with-github-copilot?tool=vimneovim)
- [Visual Studio](https://docs.github.com/en/copilot/using-github-copilot/getting-code-suggestions-in-your-ide-with-github-copilot?tool=visualstudio)
- [Visual Studio Code](https://docs.github.com/en/copilot/using-github-copilot/getting-code-suggestions-in-your-ide-with-github-copilot?tool=vscode)
- [Xcode Copilot Extension](https://docs.github.com/en/copilot/using-github-copilot/getting-code-suggestions-in-your-ide-with-github-copilot?tool=xcode)

Please note, the extensions are already installed in Visual Studio 2022 if you have a recent version.

## Available Exercises

The exercises are divided into three categories: Developer, Data Engineer/Scientist and DevOps Engineer. The exercises are designed to help you learn how to use GitHub Copilot in different programming languages and environments.

[Exercises Developer](./exercisefiles/Exercises_developer.md)

[Exercises Data Engineer/Scientist](./exercisefiles/Exercises_data.md)

[Exercises DevOps](./exercisefiles/Exercises_devops.md)

Please check the language instructions in the table below:

| Language                                 | Type            | Instructions                                      | Codespaces                                                                                                                                                                                                             | Notes                                                            |
| ---------------------------------------- | --------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| C++                                      | Developer       | [Link](./exercisefiles/cpp/README.md)             | [![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/NavaraCloudServices/github-copilot/tree/main?devcontainer_path=.devcontainer%2Fexercise%20-%20cpp%2Fdevcontainer.json)    | Select 'Conan' as profile                                        |
| C#                                       | Developer       | [Link](./exercisefiles/dotnet/README.md)          | [![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/NavaraCloudServices/github-copilot/tree/main?devcontainer_path=.devcontainer%2Fexercise%20-%20dotnet%2Fdevcontainer.json) |                                                                  |
| DevOps (Terraform/Bicep/PowerShell/Bash) | DevOps Engineer | [Link](./exercisefiles/devops/README.md)          | [![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/NavaraCloudServices/github-copilot/tree/main?devcontainer_path=.devcontainer%2Fexercise%20-%20devops%2Fdevcontainer.json) | Experimental                                                     |
| Go                                       | Developer       | [Link](./exercisefiles/go/README.md)              | [![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/NavaraCloudServices/github-copilot/tree/main?devcontainer_path=.devcontainer%2Fexercise%20-%20go%2Fdevcontainer.json)     |                                                                  |
| Java Quarkus                             | Developer       | [Link](./exercisefiles/java/quarkus/README.md)    | [![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/NavaraCloudServices/github-copilot/tree/main?devcontainer_path=.devcontainer%2Fexercise%20-%20java%2Fdevcontainer.json)   | Import the projects (Java Projects) to enable the test discovery |
| Java Springboot                          | Developer       | [Link](./exercisefiles/java/springboot/README.md) | [![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/NavaraCloudServices/github-copilot/tree/main?devcontainer_path=.devcontainer%2Fexercise%20-%20java%2Fdevcontainer.json)   | Import the projects (Java Projects) to enable the test discovery |
| PHP                                      | Developer       | [Link](./exercisefiles/php/README.md)             | [![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/NavaraCloudServices/github-copilot/tree/main?devcontainer_path=.devcontainer%2Fexercise%20-%20php%2Fdevcontainer.json)    |                                                                  |
| Python                                   | Developer       | [Link](./exercisefiles/python/README.md)          | [![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/NavaraCloudServices/github-copilot/tree/main?devcontainer_path=.devcontainer%2Fexercise%20-%20python%2Fdevcontainer.json) |            
| Python (Data Engineering) | Data Engineer/Scientist | [Link](./exercisefiles/data_engineering/README.md)          | [![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/NavaraCloudServices/github-copilot/tree/main?devcontainer_path=.devcontainer%2Fexercise%20-%20data_engineering%2Fdevcontainer.json) |                                                       |
| Javascript                               | Developer       | [Link](./exercisefiles/javascript/README.md)      | [![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/NavaraCloudServices/github-copilot/tree/main?devcontainer_path=.devcontainer%2Fexercise%20-%20node%2Fdevcontainer.json)   |                                                                  |
| Typescript                               | Developer       | [Link](./exercisefiles/typescript/README.md)      | [![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/NavaraCloudServices/github-copilot/tree/main?devcontainer_path=.devcontainer%2Fexercise%20-%20node%2Fdevcontainer.json)   |                                                                  |

There are three ways to execute the exercises:

1. **Run on your local machine**: You can run the exercises on your local machine. Please make sure you have the required software installed. You can find the instructions in the language readme files. Look for prerequisites
2. **Run on DevContainers (Visual Studio Code)**: You can make use of DevContainers within Visual Studio Code. Use the [VSCode documentation to setup your machine](https://code.visualstudio.com/docs/devcontainers/tutorial). After setting up your local machine, go to your Command Pallete in VSCode and select `Dev Containers: Rebuild and open in Container`. Choose the correct container. You don't have to worry about the Prerequisites.
3. **Open in GitHub Codespace (Visual Studio Code)**: You can run the exercises on GitHub Codespaces. See the link above in the table. With your personal account you have 120 core hours to work with each month. Don't forget to dispose the container afterwards.

## Challenges instructions

### Developer

- [Develop a shop cart](./challenges/eshop/eshop.md)
- [Develop a memory game](./challenges/memorygame/memorygame.md)
- [Develop a chat based on websockets](./challenges/chatwebsockets/chatwebsockets.md)

### Data

- [Analysis cryptocurrency market analysis](./challenges/cryptoanalisis/crypto.md)
- [COVID19 Worldwide Testing Data (Python Data Engineer)](./challenges/python_data_engineer/README.md)
- [Decision Tree Classicication Based on Diabetest Dataset (Python Data Scientist)](./challenges/python_data_scientist/README.md)

### DevOps

- [Infrastructure as Code](./challenges/devops_application/README.md)
- [Deploy Kubernetes Application](./challenges/devops_kubernetesapp/README.md)

## Quick Links

1. [About GitHub Copilot](https://docs.github.com/en/copilot/about-github-copilot)
2. [Getting started with GitHub Copilot](https://docs.github.com/en/copilot/using-github-copilot/getting-started-with-github-copilot)
3. [About code referencing in GitHub Copilot](https://docs.github.com/en/copilot/using-github-copilot/finding-public-code-that-matches-github-copilot-suggestions)
4. [Using GitHub Copilot Chat in your IDE](https://docs.github.com/en/copilot/github-copilot-chat/using-github-copilot-chat-in-your-ide)
5. [Enabling GitHub Copilot in the CLI](https://docs.github.com/en/copilot/github-copilot-in-the-cli/enabling-github-copilot-in-the-cli)
6. [GitHub Copilot MS Learn Modules](https://learn.microsoft.com/en-us/training/browse/?terms=github%20copilot)
7. [GitHub Copilot Certifications](https://resources.github.com/learn/certifications/)
