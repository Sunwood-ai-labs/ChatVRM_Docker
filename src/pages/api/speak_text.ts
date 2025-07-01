import type { NextApiRequest, NextApiResponse } from "next";
import { voicevoxTTS } from "../../features/voicevox/voicevox";
import WebSocket from "ws";

// .envからVOICEVOXエンジンURLを取得
const VOICEVOX_ENGINE_URL =
  process.env.VOICEVOX_ENGINE_URL || "http://localhost:50021";

// WebSocketサーバーのURL
const WS_URL = `${process.env.INTERNAL_WS_URL || "ws://localhost:8080"}?from=api`;

type Data = {
  status: "ok" | "error";
  message?: string;
  audio?: string; // 追加: 音声データ（data:audio/wav;base64,...）
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    res.status(405).json({ status: "error", message: "Method Not Allowed" });
    return;
  }

  const { text, speakerId, speedScale } = req.body;

  if (!text || typeof text !== "string") {
    res.status(400).json({ status: "error", message: "textは必須です" });
    return;
  }

  try {
    // 1. VOICEVOXで音声合成
    const result = await voicevoxTTS(
      text,
      typeof speakerId === "number" ? speakerId : 1,
      typeof speedScale === "number" ? speedScale : 1.0,
      VOICEVOX_ENGINE_URL
    );
    // 2. base64データをバイナリに変換
    const base64 = result.audio.split(",")[1];
    const audioBuffer = Buffer.from(base64, "base64");

    // 3. WebSocketで送信
    await new Promise<void>((resolve, reject) => {
      const ws = new WebSocket(WS_URL);
      ws.on("open", () => {
        ws.send(audioBuffer, { binary: true }, (err: Error | undefined) => {
          ws.close();
          if (err) reject(err);
          else resolve();
        });
      });
      ws.on("error", (err: Error) => {
        reject(err);
      });
    });

    res.status(200).json({
      status: "ok",
      message: "VRMに発話指示を送信しました",
      audio: result.audio // data:audio/wav;base64,... 形式
    });
  } catch (e: any) {
    res
      .status(500)
      .json({ status: "error", message: e.message || "サーバーエラー" });
  }
}
