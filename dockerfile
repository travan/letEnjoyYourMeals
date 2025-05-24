FROM node:22

WORKDIR /app

COPY . .

WORKDIR /app/api

RUN npm install
RUN npm run build

CMD ["node", "dist/api/src/index.js"]
