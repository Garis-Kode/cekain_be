FROM node:20-alpine

WORKDIR /app

COPY package.json /app

RUN npm install

RUN npm i -g @nestjs/cli

COPY . .

EXPOSE 3000

CMD sh -c '[ -d "node_modules" ] && npm run start:dev || (npm ci && npm run start:dev)'