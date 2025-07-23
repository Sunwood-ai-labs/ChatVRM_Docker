/**
 * シンプルなWebSocketサーバー
 * ws://localhost:8080 で待ち受け
 * クライアントから音声バイナリを受信したら全クライアントにブロードキャスト
 * デバッグ用に詳細なログを出力
 */
const WebSocket = require('ws');
const url = require('url'); // ★ 追加

// 環境変数からポート・ホストを取得（デフォルト: 8080, 0.0.0.0）
const WS_PORT = process.env.WS_PORT ? parseInt(process.env.WS_PORT, 10) : 8080;
const WS_HOST = process.env.WS_HOST || '0.0.0.0';

console.log(`[DEBUG] WS_HOST: ${WS_HOST}, WS_PORT: ${WS_PORT}`);
console.log(`[DEBUG] process.env:`, JSON.stringify(process.env, null, 2));

const wss = new WebSocket.Server({ port: WS_PORT, host: WS_HOST });

wss.on('connection', function connection(ws, req) {
  const ip = req && req.socket ? req.socket.remoteAddress : 'unknown';

  // ★ 追加: 接続元を判定するロジック
  const parameters = url.parse(req.url, true);
  const isApiClient = parameters.query.from === 'api';
  ws.isApiClient = isApiClient; // WebSocketオブジェクトに情報を追加

  console.log(`[INFO] クライアント接続: IP=${ip} fromAPI=${isApiClient} 現在の接続数=${wss.clients.size}`);

  ws.on('message', function incoming(data, isBinary) {
    try {
      const dataType = isBinary ? 'バイナリ' : 'テキスト';
      const dataSize = data ? (Buffer.isBuffer(data) ? data.length : String(data).length) : 0;
      console.log(`[DEBUG] メッセージ受信: type=${dataType}, size=${dataSize} bytes, from IP=${ip}`);

      // ★ 修正: バイナリでもテキストでも、APIクライアントからのメッセージをブロードキャストする
      const broadcastTargetClients = Array.from(wss.clients).filter(c => c.readyState === WebSocket.OPEN && !c.isApiClient);
      
      if (broadcastTargetClients.length > 0) {
        if (ws.isApiClient || isBinary) { // APIクライアントからのメッセージか、直接のバイナリ送信
          broadcastTargetClients.forEach(client => {
            client.send(data, { binary: isBinary });
          });
          console.log(`[INFO] ${dataType}をブロードキャスト: ${broadcastTargetClients.length} ブラウザクライアント`);
        }
      }

    } catch (err) {
      console.error('[ERROR] メッセージ処理中に例外:', err);
    }
  });

  ws.on('close', (code, reason) => {
    // 切断時点でwss.clients.sizeは既に減っているので、そのまま表示
    console.log(`[INFO] クライアント切断: IP=${ip} コード=${code} 理由=${reason} 残り接続数=${wss.clients.size}`);
  });

  ws.on('error', (err) => {
    console.error(`[ERROR] クライアントエラー: IP=${ip}`, err);
  });
});

wss.on('error', (err) => {
  console.error('[ERROR] サーバーエラー:', err);
});

console.log(`[INFO] WebSocketサーバー起動 ws://${WS_HOST}:${WS_PORT}`);
