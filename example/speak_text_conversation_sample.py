from loguru import logger
import requests
import wave
import time
import base64
import re
import os

# ChatVRMのAPIエンドポイント
API_URL = "http://localhost:3001/api/speak_text"

# 喋らせたいテキストリスト
texts = [
    "こんにちは、VOICEVOXでテキストから直接喋らせるサンプルです。",
    "2回目の発話です。会話の流れをシミュレートしています。",
    "3回目の発話です。これでサンプルは終了です。"
]
speaker_id = 1
speed_scale = 1.0

os.makedirs("assets", exist_ok=True)

for i, text in enumerate(texts):
    payload = {
        "text": text,
        "speakerId": speaker_id,
        "speedScale": speed_scale
    }
    logger.info(f"[{i+1}回目] APIリクエスト送信: {payload['text']}")
    response = requests.post(API_URL, json=payload)
    try:
        response.raise_for_status()
        data = response.json()
        logger.success(f"[{i+1}回目] サーバーレスポンスのキー: {list(data.keys())}")

        # audioフィールドがあればwavとして保存
        if "audio" in data:
            audio_data_uri = data["audio"]
            m = re.match(r"data:audio/wav;base64,(.*)", audio_data_uri)
            if not m:
                logger.error("audioフィールドが想定外の形式です")
                raise ValueError("audioフィールドが想定外の形式です")
            audio_base64 = m.group(1)
            audio_bytes = base64.b64decode(audio_base64)
            output_path = f"assets/output_speak_text_{i+1}.wav"
            with open(output_path, "wb") as f:
                f.write(audio_bytes)
            logger.info(f"[{i+1}回目] 音声ファイルを{output_path}として保存しました。")

            # wavファイルの長さ（秒）を計算
            with wave.open(output_path, "rb") as wf:
                frames = wf.getnframes()
                rate = wf.getframerate()
                duration = frames / float(rate)
            logger.info(f"[{i+1}回目] 音声の長さ: {duration:.2f}秒")

            # 会話時間分待機
            if i < len(texts) - 1:
                logger.info(f"[{i+1}回目] {duration:.2f}秒待機して次の会話へ...")
                time.sleep(duration)
        else:
            logger.warning(f"[{i+1}回目] audioフィールドがレスポンスにありません。")
    except requests.HTTPError as e:
        logger.error(f"[{i+1}回目] APIリクエストでエラーが発生しました: {e}")
        try:
            logger.error(f"サーバーレスポンス: {response.json()}")
        except Exception:
            logger.error(f"サーバーレスポンス(非JSON): {response.text}")
        raise
