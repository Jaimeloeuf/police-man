# This is the Dockerfile for the Node server app service. Run this file individually for each service

FROM node

EXPOSE 80

# Maintainer for this Dockerfile
MAINTAINER jaimeloeuf@gmail.com

# Create app directory and set as working directory
WORKDIR /app

# A wildcard is used to ensure both package.json AND package-lock.json are copied where available (npm@5+)
COPY package*.json /app

# Install NPM dependencies and build code for production only
RUN npm install
# RUN npm install --only=production

# Bundle app source
COPY . /app
# Test if the below works too
# COPY . .

# Run node server with "npm start" to use the start script specified in package.json
# Shell form of ENTRYPOINT used to ignore any CMD or docker run command line arguments and run the image as a single executable
ENTRYPOINT npm start

# To build and run the image from this Dockerfile
# docker build -t Promist-Server .
# docker run -it --rm --name Promist Promist-Server