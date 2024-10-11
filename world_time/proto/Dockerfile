FROM node:16-alpine
WORKDIR /usr/src/proto
COPY package*.json ./
RUN yarn
COPY . .
RUN mkdir -p src
RUN yarn build
