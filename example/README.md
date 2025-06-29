# 🎤 ChatVRM Pythonサンプル集

このディレクトリは、ChatVRMと連携する各種Pythonサンプル・音声ファイル・実行手順をまとめたものです。

---

## 📁 ディレクトリ構成

```
example/
├── assets/
│   ├── out.wav
│   ├── output_voicevox.wav
│   ├── output_speak_text_1.wav
│   ├── output_speak_text_2.wav
│   ├── output_speak_text_3.wav
│   └── sample-talk01.wav
├── speak_text_api_sample.py
├── speak_text_conversation_sample.py
├── voicevox_api_sample.py
├── voicevox_tts_sample.py
├── ws_audio_sender.py
└── README.md
```

- `assets/` … 音声ファイルの格納場所（全サンプル共通で利用）

---

## 📝 サンプルスクリプト一覧と用途

| ファイル名                        | 用途・説明 |
|-----------------------------------|-----------|
| `speak_text_api_sample.py`        | テキストをPOSTするだけでVRMキャラクターがVOICEVOX音声で喋る（最もシンプル） |
| `speak_text_conversation_sample.py` | 3回分のテキストを順に喋らせ、音声ファイルを保存・会話時間分待機・loguruで見やすいログ（レスポンスはキーのみ表示）|
| `voicevox_api_sample.py`          | テキスト→音声ファイル生成→WebSocket送信でVRMが喋る（音声ファイルも保存） |
| `voicevox_tts_sample.py`          | テキスト→音声ファイル生成のみ（WebSocket送信なし） |
| `ws_audio_sender.py`              | 任意のWAVファイルをWebSocket経由で送信しVRMに喋らせる |
| `post_audio_sample.py`            | 任意のWAVファイルをAPI経由で送信し、レスポンスを保存するサンプル |

---

## 🚀 実行手順

### 1. 依存パッケージのインストール

- WebSocketサーバー用（Node.jsプロジェクトルートで実行）:

  ```
  npm install ws
  ```

- Python用（サンプル実行前に）:

  ```
  pip install requests websocket-client loguru
  ```

### 2. WebSocketサーバーの起動

```
node server/ws-server.js
```
- `ws://localhost:8080` で待ち受けます

### 3. ChatVRMのWebアプリを起動

```
npm run dev
```
- ブラウザでアクセス

### 4. サンプルの実行例

- VRMキャラクターにテキストだけで喋らせる（推奨）:

  ```
  python speak_text_api_sample.py
  ```

- 3回分の会話を連続で喋らせ、音声ファイル保存・会話時間分待機・loguruで見やすいログ（レスポンスはキーのみ表示）:

  ```
  python speak_text_conversation_sample.py
  ```

- 音声ファイル生成＋WebSocket送信:

  ```
  python voicevox_api_sample.py
  ```

- 任意のWAVファイルをWebSocket送信:

  ```
  python ws_audio_sender.py
  ```

---

## ✨ `speak_text_conversation_sample.py` の特徴

- 3回分のテキストを順に `/api/speak_text` へ送信し、各レスポンスの音声データを `assets/output_speak_text_1.wav` などに保存
- 保存したwavファイルの長さ（秒）を自動計算し、その時間だけ待機して次の会話へ進行
- サーバーレスポンスはバイナリや長い値を出さず、キーのみをloguruで見やすく表示
- 進行状況・エラーもloguruで整形
- 依存パッケージ: `loguru`, `requests`

---

## ℹ️ 備考

- 音声ファイルはすべて `assets/` ディレクトリに格納してください。
- `server/ws-server.js` は package.json の scripts には含まれていません。直接 `node server/ws-server.js` で起動してください。
- 複数クライアントが接続している場合、全てのクライアントに音声がブロードキャストされます。
- サンプルごとに用途が異なるため、目的に応じて使い分けてください。
