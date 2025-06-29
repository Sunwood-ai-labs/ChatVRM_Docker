"""
VOICEVOX音声合成API (ChatVRM /api/voicevox_tts) サンプル

- 任意のテキスト・話者ID・話速で音声合成
- 返却されたbase64エンコードWAVをファイル保存
"""

import requests
import base64
import re

# ChatVRMのAPIエンドポイント
API_URL = "http://localhost:3000/api/voicevox_tts"

# 合成するテキスト・話者ID・話速
payload = {
    "text": "こんにちは、VOICEVOXデフォルトテストです。",
    "speakerId": 1,      # VOICEVOXの話者ID
    "speedScale": 1.0    # 話速（省略可）
}

response = requests.post(API_URL, json=payload)
try:
    response.raise_for_status()
except requests.HTTPError as e:
    print("APIリクエストでエラーが発生しました:", e)
    try:
        print("サーバーレスポンス:", response.json())
    except Exception:
        print("サーバーレスポンス(非JSON):", response.text)
    raise

data = response.json()

# audioフィールド（data URI形式: data:audio/wav;base64,xxxx...）からbase64部分を抽出
audio_data_uri = data["audio"]
m = re.match(r"data:audio/wav;base64,(.*)", audio_data_uri)
if not m:
    raise ValueError("audioフィールドが想定外の形式です")

audio_base64 = m.group(1)
audio_bytes = base64.b64decode(audio_base64)

# ファイルに保存
output_path = "assets/output_voicevox.wav"
with open(output_path, "wb") as f:
    f.write(audio_bytes)

print(f"音声ファイルを{output_path}として保存しました。")

# --- ここからWebSocket送信処理を追加 ---
import websocket

ws_url = "ws://localhost:8080"
audio_path = output_path

try:
    ws = websocket.create_connection(ws_url)
    print("WebSocket接続")
    with open(audio_path, "rb") as f:
        audio_data = f.read()
        ws.send(audio_data, opcode=websocket.ABNF.OPCODE_BINARY)
        print("音声バイナリ送信")
    ws.close()
    print("WebSocket切断")
    print("VRMキャラクターに音声を送信しました。")
except Exception as e:
    print("WebSocket送信中にエラーが発生しました:", e)
