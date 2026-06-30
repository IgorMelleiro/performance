FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

RUN npm ci

COPY . .

RUN npx prisma generate

ENV NODE_ENV=production

EXPOSE 3001

CMD ["npm", "run", "start:prod"]
