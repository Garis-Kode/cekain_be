FROM node:20-alpine as build

WORKDIR: /app

COPY package.json /app

RUN npm install

COPY . .

RUN npm run build

FROM node:20-alpine

WORKDIR: /app

COPY --from=build /app/dist ./dist
COPY --from=builder /app/package*.json ./

RUN npm install --only=production

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
