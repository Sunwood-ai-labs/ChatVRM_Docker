import requests

# 音声ファイルのパス
audio_path = "assets/sample-talk01.wav"

# ChatVRMのAPIエンドポイント
url = "http://localhost:3000/api/speak_external_audio"

# 音声ファイルをバイナリで読み込んでPOST
with open(audio_path, "rb") as f:
    audio_data = f.read()

headers = {
    "Content-Type": "audio/wav"
}

response = requests.post(url, headers=headers, data=audio_data)

# レスポンスのバイナリを保存（例: out.wav）
if response.status_code == 200:
    with open("out.wav", "wb") as out_f:
        out_f.write(response.content)
    print("アップロード成功。レスポンスを out.wav に保存しました。")
else:
    print(f"エラー: {response.status_code} {response.text}")
