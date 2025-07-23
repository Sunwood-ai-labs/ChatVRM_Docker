import type { NextApiRequest, NextApiResponse } from "next";

// 環境変数からBASE URL/APIキーを取得
const OPENAI_API_BASE_URL =
  process.env.OPENAI_API_BASE_URL || "https://api.openai.com/v1";
const OPENAI_TTS_URL = `${OPENAI_API_BASE_URL}/audio/speech`;

const SUPPORTED_FORMATS = ["mp3", "opus", "aac", "flac", "wav", "pcm"];

type Data = {
  audio: string; // data:audio/xxx;base64,...
  format: string;
};

export const config = {
  api: {
    bodyParser: true, // JSON受信
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | { error: string }>
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  const {
    text,
    model = "gpt-4o-mini-tts",
    voice = "alloy",
    apiKey,
    format = "mp3",
    instructions,
    speed = 1.0,
    response_format,
  } = req.body;

  // APIキーは環境変数優先、なければbody
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY || apiKey;
  if (!OPENAI_API_KEY) {
    res.status(400).json({ error: "OpenAI APIキーがありません" });
    return;
  }
  if (!text || typeof text !== "string") {
    res.status(400).json({ error: "textは必須です" });
    return;
  }
  if (!SUPPORTED_FORMATS.includes(format)) {
    res.status(400).json({ error: `formatは${SUPPORTED_FORMATS.join(", ")}のみ対応` });
    return;
  }

  try {
    // OpenAI TTS APIへリクエスト
    const openaiRes = await fetch(OPENAI_TTS_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: text,
        voice,
        instructions,
        response_format: response_format || format,
        speed,
      }),
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      res.status(openaiRes.status).json({ error: `OpenAI TTS API error: ${errText}` });
      return;
    }

    // バイナリ音声データ取得
    const buffer = Buffer.from(await openaiRes.arrayBuffer());
    // MIMEタイプ決定
    const mime =
      format === "mp3"
        ? "audio/mpeg"
        : format === "wav"
        ? "audio/wav"
        : format === "opus"
        ? "audio/opus"
        : format === "aac"
        ? "audio/aac"
        : format === "flac"
        ? "audio/flac"
        : format === "pcm"
        ? "audio/pcm"
        : "application/octet-stream";
    // base64エンコード
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${mime};base64,${base64}`;

    res.status(200).json({ audio: dataUrl, format });
  } catch (e: any) {
    res.status(500).json({ error: e.message || "OpenAI TTSサーバーエラー" });
  }
}