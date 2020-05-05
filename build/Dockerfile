FROM ubuntu:16.04

# Information
LABEL maintainer="Queimadas <queimadas@inpe.br>" \
      version="1.1.1"

# Environment Variables
ENV BDQLIGHT_INSTALL_PATH=/opt/bdqueimadas-light
ENV BDQLIGHT_VERSION=v1.1.1

# Dependencies
RUN apt-get update && \
    apt-get install -y curl \
                       git \
                       unzip \
                       sudo \
                       openssh-server \
                       gdal-bin

# NodeJS
RUN curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash - && \
    apt-get install -y nodejs

RUN npm install -g grunt

# BDQueimadas Light
COPY files/install_bdqlight.sh .

RUN ./install_bdqlight.sh && rm install_bdqlight.sh

WORKDIR ${BDQLIGHT_INSTALL_PATH}

EXPOSE 39000

COPY docker-entrypoint.sh /

ENTRYPOINT /docker-entrypoint.sh
