FROM node:22-alpine

RUN apk add --no-cache git

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY tsconfig.json ./

COPY src ./src

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodeuser -u 1001
USER nodeuser

EXPOSE 3000

CMD ["npm", "run", "start"]
