FROM node:lts-alpine

WORKDIR /app

ENV NODE_ENV production
COPY package.json yarn.lock ./

# install dev dependencies too
RUN set -x && yarn --prod=false

COPY . .

RUN set -x && yarn run prestart:prod

# for package.json
# "prestart:prod": "rimraf dist && node --max-old-space-size=4096 ./node_modules/typescript/bin/tsc",

EXPOSE 3000

CMD [ "node", "-r", "./tsconfig-paths-bootstrap.js" ,"dist/main.js" ]