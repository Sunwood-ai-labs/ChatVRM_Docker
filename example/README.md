# WebSocket音声再生サンプル 起動手順

## 1. 依存パッケージのインストール

まず、WebSocketサーバー用の`ws`パッケージをインストールしてください（プロジェクトルートで実行）:

```
npm install ws
```

## 2. WebSocketサーバーの起動

Node.jsでサーバースクリプトを起動します:

```
node server/ws-server.js
```

- `ws://localhost:8080` で待ち受けます

## 3. ChatVRMのWebアプリを起動

通常通り `npm run dev` などでChatVRMを起動し、ブラウザでアクセスしてください。

## 4. Pythonサンプルから音声を送信

別ターミナルで `example/ws_audio_sender.py` を実行します:

```
pip install websocket-client
cd example
python ws_audio_sender.py
```

- `sample-talk01.wav` の音声がWebSocket経由で送信され、Webアプリ側でVRMが自動で喋ります

---

## 備考

- `server/ws-server.js` は package.json の scripts には含まれていません。上記のように `node server/ws-server.js` で直接起動してください。
- 複数クライアントが接続している場合、全てのクライアントに音声がブロードキャストされます。
