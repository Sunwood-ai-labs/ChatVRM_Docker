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
 * VOICEVOXで音声合成し、VRMに喋らせる
 */
export const fetchAudioVoicevox = async (
  talk: Talk,
  speakerId: number,
  speedScale: number = 1.0
): Promise<ArrayBuffer> => {
  // VOICEVOX TTS APIへPOST
  const res = await fetch("/api/voicevox_tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: talk.message,
      speakerId,
      speedScale,
    }),
  });
  const data = await res.json();
  if (!data.audio) throw new Error("VOICEVOX API error");
  // data URIからbase64部分を抽出
  const base64 = data.audio.split(",")[1];
  const binary = atob(base64);
  const len = binary.length;
  const buffer = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    buffer[i] = binary.charCodeAt(i);
  }
  // デバッグ: 取得したArrayBufferの長さを出力
  console.log("[VOICEVOX] fetchAudioVoicevox ArrayBuffer length:", buffer.length);
  return buffer.buffer;
};


/**
 * VOICEVOX音声でVRMに喋らせる
 */
export const speakCharacterWithVoicevox = (
  screenplay: Screenplay,
  viewer: Viewer,
  speakerId: number,
  speedScale: number = 1.0,
  onStart?: () => void,
  onComplete?: () => void
) => {
  // Koeiromapと同じ直列再生ロジック
  let lastTime = 0;
  let prevFetchPromise: Promise<unknown> = Promise.resolve();
  let prevSpeakPromise: Promise<unknown> = Promise.resolve();

  const fetchPromise = prevFetchPromise.then(async () => {
    const now = Date.now();
    if (now - lastTime < 1000) {
      await wait(1000 - (now - lastTime));
    }
    const buffer = await fetchAudioVoicevox(
      screenplay.talk,
      speakerId,
      speedScale
    ).catch(() => null);
    lastTime = Date.now();
    return buffer;
  });

  prevFetchPromise = fetchPromise;
  prevSpeakPromise = Promise.all([fetchPromise, prevSpeakPromise]).then(
    ([audioBuffer]) => {
      onStart?.();
      if (!audioBuffer) {
        console.error("[VOICEVOX] audioBuffer is null or undefined");
        return;
      }
      console.log("[VOICEVOX] speakCharacterWithVoicevox: call viewer.model.speak");
      return viewer.model?.speak(audioBuffer, screenplay);
    }
  );
  prevSpeakPromise.then(() => {
    onComplete?.();
  });
};
