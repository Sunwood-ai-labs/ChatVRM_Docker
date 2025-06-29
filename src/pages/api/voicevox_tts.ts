import type { NextApiRequest, NextApiResponse } from "next";
import { voicevoxTTS } from "@/features/voicevox/voicevox";

// .envからVOICEVOXエンジンURLを取得
const VOICEVOX_ENGINE_URL =
  process.env.VOICEVOX_ENGINE_URL || "http://localhost:50021";

type Data = {
  audio: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | { error: string }>
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  const { text, speakerId, speedScale } = req.body;

  if (!text || typeof speakerId !== "number") {
    res.status(400).json({ error: "textとspeakerIdは必須です" });
    return;
  }

  try {
    const result = await voicevoxTTS(
      text,
      speakerId,
      speedScale ?? 1.0,
      VOICEVOX_ENGINE_URL
    );
    res.status(200).json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message || "VOICEVOX合成エラー" });
  }
}
