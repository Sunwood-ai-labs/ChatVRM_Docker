
## 📢 VOICEVOX API

ChatVRMではVOICEVOXエンジンを利用した音声合成APIがデフォルトとなっています。

- VOICEVOXエンジンのセットアップ例:
  ```
  docker run --rm -p 50021:50021 voicevox/voicevox_engine
  ```
- `.env`でVOICEVOX_ENGINE_URLを指定してください（例: `http://localhost:50021`）

### エンドポイント

```
POST /api/voicevox_tts
```

#### リクエスト例

```json
{
  "text": "こんにちは、私はVOICEVOXです。",
  "speakerId": 1,
  "speedScale": 1.2
}
```

- `text`: 合成するテキスト（必須）
- `speakerId`: VOICEVOXの話者ID（必須）
- `speedScale`: 話速（省略可、デフォルト1.0）

#### レスポンス例

```json
{
  "audio": "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEA..."
}
```

- `audio`: base64エンコード済みWAVデータ（data URI形式）

#### Pythonサンプル

`example/voicevox_api_sample.py` を参照してください。
任意のテキスト・話者ID・話速で音声合成し、WAVファイルとして保存できます。

VOICEVOXエンジンの詳細は[公式ドキュメント](https://voicevox.hiroshiba.jp/)をご参照ください。
