# server/Dockerfile
FROM node:20-alpine

# 作業ディレクトリ作成
WORKDIR /app

# 依存ファイルをコピー
COPY ./package.json ./package-lock.json ./

# 依存インストール
RUN npm install --omit=dev

# サーバースクリプトをコピー
COPY . /app/server

# サーバー起動
CMD ["node", "server/ws-server.js"]