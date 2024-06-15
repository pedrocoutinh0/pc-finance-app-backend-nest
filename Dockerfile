FROM node:18-alpine

WORKDIR /usr/app

COPY package*.json ./

RUN yarn

COPY . .

RUN yarn build

EXPOSE 3000
EXPOSE 3306

CMD yarn start:prod
