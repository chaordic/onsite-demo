FROM node:10.14.1-alpine
WORKDIR /usr/src/app
RUN npm i -g yarn@1.10.1
RUN apk add --no-cache openssh-client git \
  && mkdir /root/.ssh \
  && ssh-keyscan github.com >> /root/.ssh/known_hosts
EXPOSE 9000
