import { TalkStyle } from "../messages/messages";

/**
 * OpenAI TTSで音声合成
 * @param params { text, apiKey, model, voice, format, instructions, speed }
 * @returns { audio: data:audio/xxx;base64,... }
 */
export async function synthesizeVoiceOpenAI(params: {
  text: string;
  apiKey: string;
  model?: string;
  voice?: string;
  format?: string;
  instructions?: string;
  speed?: number;
}) {
  const {
    text,
    apiKey,
    model = "gpt-4o-mini-tts",
    voice = "alloy",
    format = "mp3",
    instructions,
    speed = 1.0,
  } = params;

  const res = await fetch("/api/openai_tts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      apiKey,
      model,
      voice,
      format,
      instructions,
      speed,
    }),
  });
  const data = (await res.json()) as any;
  if (!data.audio) throw new Error("OpenAI TTS API did not return audio");
  return { audio: data.audio };
}

/**
 * VOICEVOXで音声合成（/api/voicevox_ttsを叩く）
 */
export async function synthesizeVoiceVoicevox(params: {
  text: string;
  speakerId: number;
  speedScale?: number;
}) {
  const { text, speakerId, speedScale = 1.0 } = params;
  const res = await fetch("/api/voicevox_tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      speakerId,
      speedScale,
    }),
  });
  const data = (await res.json()) as any;
  if (!data.audio) throw new Error("VOICEVOX API did not return audio");
  return { audio: data.audio };
}
