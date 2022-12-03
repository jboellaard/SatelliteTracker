FROM node:18.12-alpine As development

WORKDIR /

COPY package*.json ./

RUN npm install --only=development

COPY . .

RUN npm run build data-api

FROM node:18.12-alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /

COPY package*.json ./

RUN npm install --only=production

COPY . .

COPY --from=development /dist/apps/data-api ./dist

CMD ["node", "dist/main"]