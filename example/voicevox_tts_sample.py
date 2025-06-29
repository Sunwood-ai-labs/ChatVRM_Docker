import requests
import base64
import re

# ChatVRMのAPIエンドポイント
API_URL = "http://localhost:3000/api/voicevox_tts"

# 合成するテキスト・話者ID・話速
payload = {
    "text": "こんにちは、VOICEVOXテストです。",
    "speakerId": 1,
    "speedScale": 1.1
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
