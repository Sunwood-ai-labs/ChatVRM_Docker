import websocket

# 音声ファイルのパス
audio_path = "sample-talk01.wav"

# WebSocketサーバーのURL
ws_url = "ws://localhost:8080"

def send_audio():
    ws = websocket.create_connection(ws_url)
    print("WebSocket接続")
    with open(audio_path, "rb") as f:
        audio_data = f.read()
        ws.send(audio_data, opcode=websocket.ABNF.OPCODE_BINARY)
        print("音声バイナリ送信")
    ws.close()
    print("WebSocket切断")

if __name__ == "__main__":
    send_audio()
