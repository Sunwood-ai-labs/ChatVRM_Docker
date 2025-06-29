/**
 * シンプルなWebSocketサーバー
 * ws://localhost:8080 で待ち受け
 * クライアントから音声バイナリを受信したら全クライアントにブロードキャスト
 */
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', function connection(ws) {
  console.log('クライアント接続');

  ws.on('message', function incoming(data, isBinary) {
    // バイナリデータのみブロードキャスト
    if (isBinary) {
      wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(data, { binary: true });
        }
      });
      console.log('音声バイナリをブロードキャスト');
    }
  });

  ws.on('close', () => {
    console.log('クライアント切断');
  });
});

console.log('WebSocketサーバー起動 ws://localhost:8080');
