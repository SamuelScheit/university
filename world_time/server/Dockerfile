FROM time_proto
WORKDIR /usr/src/app
COPY package*.json ./
RUN yarn
COPY . .
RUN yarn build

EXPOSE 9090
CMD ["node", "dist/index.js"]
