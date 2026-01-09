FROM mcr.microsoft.com/playwright:v1.57.0-noble

# Install sudo and give ubuntu passwordless sudo
RUN apt update \
    && apt install -y sudo \
    && echo "ubuntu ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/ubuntu \
    && chmod 440 /etc/sudoers.d/ubuntu \
    && usermod -aG sudo ubuntu \
    && rm -rf /var/lib/apt/lists/*

USER ubuntu
