# Next.js 用 Dockerfile
FROM node:16.14.2

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# 本番ビルド
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
