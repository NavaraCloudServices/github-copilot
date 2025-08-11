FROM mcr.microsoft.com/vscode/devcontainers/cpp

# Install required dependencies
RUN apt-get update && apt-get install -y \
    python3-pip \
    libgtest-dev \
    build-essential \
    cmake \
    libfmt-dev

RUN sudo python3 -m pip install conan --break-system-packages