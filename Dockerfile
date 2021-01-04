FROM node:alpine

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY ./ ./

RUN yarn install

EXPOSE 3015

CMD "yarn" "dev"