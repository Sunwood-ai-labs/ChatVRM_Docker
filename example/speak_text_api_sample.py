"""
ChatVRM API /api/speak_text サンプル

- 任意のテキストをPOSTするだけでVRMキャラクターがVOICEVOX音声で喋ります
"""

import requests

# ChatVRMのAPIエンドポイント
API_URL = "http://localhost:3000/api/speak_text"

# 喋らせたいテキスト・話者ID・話速
payload = {
    "text": "こんにちは、VOICEVOXでテキストから直接喋らせるサンプルです。",
    "speakerId": 1,      # VOICEVOXの話者ID（省略可）
    "speedScale": 1.0    # 話速（省略可）
}

response = requests.post(API_URL, json=payload)
try:
    response.raise_for_status()
    print("VRMキャラクターに発話指示を送信しました。")
    print("サーバーレスポンス:", response.json())
except requests.HTTPError as e:
    print("APIリクエストでエラーが発生しました:", e)
    try:
        print("サーバーレスポンス:", response.json())
    except Exception:
        print("サーバーレスポンス(非JSON):", response.text)
    raise
