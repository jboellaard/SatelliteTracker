FROM node:18.12-alpine As development

WORKDIR /app

COPY package*.json ./

RUN npm install glob rimraf

RUN npm install --omit=production

COPY . .

RUN npm run build data-api

FROM node:18.12-alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

COPY --from=development /app/dist/apps/data-api ./dist

CMD ["node", "dist/main"]