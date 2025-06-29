import fetch from "node-fetch";

/**
 * VOICEVOXエンジンで音声合成を行う
 * @param text 合成するテキスト
 * @param speakerId VOICEVOX話者ID
 * @param speedScale 話速（省略可、デフォルト1.0）
 * @param engineUrl VOICEVOXエンジンのURL（例: http://localhost:50021）
 * @returns base64エンコード済み音声データ（wav）
 */
export async function voicevoxTTS(
  text: string,
  speakerId: number,
  speedScale: number = 1.0,
  engineUrl: string
): Promise<{ audio: string }> {
  // audio_query
  const audioQueryRes = await fetch(
    `${engineUrl}/audio_query?speaker=${speakerId}&text=${encodeURIComponent(text)}`,
    {
      method: "POST",
      headers: { "Accept": "application/json" }
      // VOICEVOX仕様: text/speakerはクエリパラメータ、body不要
    }
  );
  if (!audioQueryRes.ok) {
    const errText = await audioQueryRes.text();
    throw new Error(
      `VOICEVOX audio_query failed: status=${audioQueryRes.status}, body=${errText}`
    );
  }
  const audioQuery = await audioQueryRes.json();

  // パラメータ調整（話速など）
  audioQuery.speedScale = speedScale;

  // synthesis
  const synthesisRes = await fetch(
    `${engineUrl}/synthesis?speaker=${speakerId}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(audioQuery),
    }
  );
  if (!synthesisRes.ok) {
    throw new Error("VOICEVOX synthesis failed");
  }
  const buffer = await synthesisRes.arrayBuffer();
  // base64エンコード
  const audioBase64 = Buffer.from(buffer).toString("base64");
  // wavとして返す
  return { audio: `data:audio/wav;base64,${audioBase64}` };
}
