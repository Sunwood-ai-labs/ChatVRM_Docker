import { wait } from "@/utils/wait";
import { synthesizeVoiceApi } from "./synthesizeVoice";
import { Viewer } from "../vrmViewer/viewer";
import { Screenplay } from "./messages";
import { Talk } from "./messages";

const createSpeakCharacter = () => {
  let lastTime = 0;
  let prevFetchPromise: Promise<unknown> = Promise.resolve();
  let prevSpeakPromise: Promise<unknown> = Promise.resolve();

  return (
    screenplay: Screenplay,
    viewer: Viewer,
    koeiroApiKey: string,
    onStart?: () => void,
    onComplete?: () => void
  ) => {
    const fetchPromise = prevFetchPromise.then(async () => {
      const now = Date.now();
      if (now - lastTime < 1000) {
        await wait(1000 - (now - lastTime));
      }

      const buffer = await fetchAudio(screenplay.talk, koeiroApiKey).catch(
        () => null
      );
      lastTime = Date.now();
      return buffer;
    });

    prevFetchPromise = fetchPromise;
    prevSpeakPromise = Promise.all([fetchPromise, prevSpeakPromise]).then(
      ([audioBuffer]) => {
        onStart?.();
        if (!audioBuffer) {
          return;
        }
        return viewer.model?.speak(audioBuffer, screenplay);
      }
    );
    prevSpeakPromise.then(() => {
      onComplete?.();
    });
  };
};

export const speakCharacter = createSpeakCharacter();

export const fetchAudio = async (
  talk: Talk,
  apiKey: string
): Promise<ArrayBuffer> => {
  const ttsVoice = await synthesizeVoiceApi(
    talk.message,
    talk.speakerX,
    talk.speakerY,
    talk.style,
    apiKey
  );
  const url = ttsVoice.audio;

  if (url == null) {
    throw new Error("Something went wrong");
  }

  const resAudio = await fetch(url);
  const buffer = await resAudio.arrayBuffer();
  return buffer;
};
 
/**
 * VOICEVOXで音声合成し、ArrayBufferを返す
 */
export const fetchAudioVoicevox = async (
  talk: Talk,
  options: { speakerId: number; speedScale?: number }
): Promise<ArrayBuffer | null> => {
  const res = await fetch("/api/voicevox_tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: talk.message,
      speakerId: options.speakerId,
      speedScale: options.speedScale ?? 1.0,
    }),
  });
  if (!res.ok) {
    console.error("VOICEVOX API error:", await res.text());
    return null;
  }
  const data = await res.json();
  if (!data.audio) throw new Error("VOICEVOX API did not return audio");

  const base64 = data.audio.split(",")[1];
  const binary = atob(base64);
  const len = binary.length;
  const buffer = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    buffer[i] = binary.charCodeAt(i);
  }
  return buffer.buffer;
};


/**
 * VOICEVOX音声でVRMに喋らせる
 */
/**
 * 汎用的な再生処理を生成するファクトリ関数
 * @param fetchAudio 音声データを取得する非同期関数
 */
const createSpeaker = (
  fetchAudio: (talk: Talk, options: any) => Promise<ArrayBuffer | null>
) => {
  let lastTime = 0;
  let prevFetchPromise: Promise<any> = Promise.resolve(null);
  let prevSpeakPromise: Promise<unknown> = Promise.resolve();

  return (
    screenplay: Screenplay,
    viewer: Viewer,
    options: any,
    onStart?: () => void,
    onComplete?: () => void
  ) => {
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

    prevSpeakPromise = Promise.all([fetchPromise, prevSpeakPromise]).then(
      ([audioBuffer]) => {
        onStart?.();
        if (!audioBuffer) {
          console.error("[Speaker] audioBuffer is null or undefined, skipping speak.");
          onComplete?.();
          return;
        }
        viewer.model?.speak(audioBuffer, screenplay).then(() => {
          onComplete?.();
        });
      }
    );
  };
};

/**
 * VOICEVOX音声でVRMに喋らせる（直列再生・バグ修正版）
 */
export const speakCharacterWithVoicevox = createSpeaker(fetchAudioVoicevox);
