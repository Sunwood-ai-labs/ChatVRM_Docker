import { wait } from "@/utils/wait";
import { synthesizeVoiceOpenAI, synthesizeVoiceVoicevox } from "./synthesizeVoice";
import { Viewer } from "../vrmViewer/viewer";
import { Screenplay } from "./messages";
import { Talk } from "./messages";

/**
 * VOICEVOXで音声合成し、ArrayBufferを返す
 */
export const fetchAudioVoicevox = async (
  talk: Talk,
  options: { speakerId: number; speedScale?: number }
): Promise<ArrayBuffer | null> => {
  try {
    const res = await synthesizeVoiceVoicevox({
      text: talk.message,
      speakerId: options.speakerId,
      speedScale: options.speedScale,
    });
    if (!res.audio) throw new Error("VOICEVOX API did not return audio");
    const base64 = res.audio.split(",")[1];
    const binary = atob(base64);
    const len = binary.length;
    const buffer = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      buffer[i] = binary.charCodeAt(i);
    }
    return buffer.buffer;
  } catch (e) {
    console.error("VOICEVOX fetch error:", e);
    return null;
  }
};

/**
 * OpenAI TTSで音声合成し、ArrayBufferを返す
 */
export const fetchAudioOpenAI = async (
  talk: Talk,
  options: {
    apiKey: string;
    model?: string;
    voice?: string;
    format?: string;
    instructions?: string;
    speed?: number;
  }
): Promise<ArrayBuffer | null> => {
  try {
    const res = await synthesizeVoiceOpenAI({
      text: talk.message,
      apiKey: options.apiKey,
      model: options.model,
      voice: options.voice,
      format: options.format,
      instructions: options.instructions,
      speed: options.speed,
    });
    if (!res.audio) throw new Error("OpenAI TTS API did not return audio");
    // data:audio/xxx;base64,... → base64データ抽出
    const base64 = res.audio.split(",")[1];
    const binary = atob(base64);
    const len = binary.length;
    const buffer = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      buffer[i] = binary.charCodeAt(i);
    }
    return buffer.buffer;
  } catch (e) {
    console.error("OpenAI TTS fetch error:", e);
    return null;
  }
};

/**
 * 汎用的な再生処理を生成するファクトリ関数
 * @param fetchAudio 音声データを取得する非同期関数
 */
export const createSpeaker = (
  fetchAudio: (talk: Talk, options: any) => Promise<ArrayBuffer | null>
) => {
  let lastTime = 0;
  let prevFetchPromise: Promise<any> = Promise.resolve(null);
  let prevSpeakPromise: Promise<unknown> = Promise.resolve();

  // Promise<void> を返すように修正
  return (
    screenplay: Screenplay,
    viewer: Viewer,
    options: any,
    onStart?: () => void,
    onComplete?: () => void
  ): Promise<void> => {
    const fetchPromise = prevFetchPromise.then(async () => {
      const now = Date.now();
      if (now - lastTime < 1000) {
        await wait(1000 - (now - lastTime));
      }

      const buffer = await fetchAudio(screenplay.talk, options).catch(
        (err) => {
          console.error("Error fetching audio:", err);
          return null;
        }
      );
      lastTime = Date.now();
      return buffer;
    });

    prevFetchPromise = fetchPromise;

    // Promise<void> を返すPromiseチェーンに修正
    const newSpeakPromise = Promise.all([fetchPromise, prevSpeakPromise]).then(
      ([audioBuffer]) => {
        return new Promise<void>((resolve) => {
          onStart?.();
          if (!audioBuffer) {
            console.error("[Speaker] audioBuffer is null or undefined, skipping speak.");
            onComplete?.();
            resolve();
            return;
          }
          viewer.model?.speak(audioBuffer, screenplay).then(() => {
            onComplete?.();
            resolve();
          });
        });
      }
    );
    prevSpeakPromise = newSpeakPromise;
    return newSpeakPromise;
  };
};

/**
 * OpenAI TTS音声でVRMに喋らせる
 */
export const speakCharacterWithOpenAI = (
  screenplay: Screenplay,
  viewer: Viewer,
  options: {
    apiKey: string;
    model?: string;
    voice?: string;
    format?: string;
    instructions?: string;
    speed?: number;
  },
  onStart?: () => void,
  onComplete?: () => void
) => {
  // createSpeakerを使って直列再生
  return createSpeaker(fetchAudioOpenAI)(
    screenplay,
    viewer,
    options,
    onStart,
    onComplete
  );
};

/**
 * VOICEVOX音声でVRMに喋らせる
 */
export const speakCharacterWithVoicevox = createSpeaker(fetchAudioVoicevox);
