import { useCallback, useContext, useEffect, useState } from "react";
import VrmViewer from "@/components/vrmViewer";
import { ViewerContext } from "@/features/vrmViewer/viewerContext";
import {
  Message,
  textsToScreenplay,
  Screenplay,
} from "@/features/messages/messages";
import { speakCharacterWithVoicevox } from "@/features/messages/speakCharacter";
import { MessageInputContainer } from "@/components/messageInputContainer";
import { SYSTEM_PROMPT } from "@/features/constants/systemPromptConstants";
import { KoeiroParam, DEFAULT_PARAM } from "@/features/constants/koeiroParam";
import { getChatResponseStream } from "@/features/chat/openAiChat";
import { Menu } from "@/components/menu";
import { GitHubLink } from "@/components/githubLink";
import { Meta } from "@/components/meta";

export default function Home() {
  const { viewer } = useContext(ViewerContext);

  const [systemPrompt, setSystemPrompt] = useState(SYSTEM_PROMPT);
  const [openAiKey, setOpenAiKey] = useState("");
  const [koeiromapKey, setKoeiromapKey] = useState("");
  const [koeiroParam, setKoeiroParam] = useState<KoeiroParam>(DEFAULT_PARAM);
  const [chatProcessing, setChatProcessing] = useState(false);
  const [chatLog, setChatLog] = useState<Message[]>([]);
  const [assistantMessage, setAssistantMessage] = useState("");
  // ▼▼▼ ここから追加 ▼▼▼
  const [isFirstInteraction, setIsFirstInteraction] = useState(true);
  // ▲▲▲ ここまで追加 ▲▲▲

  // ▼▼▼ AudioContext状態監視用 ▼▼▼
  const [audioState, setAudioState] = useState<"suspended" | "running" | "closed" | "uninitialized">("uninitialized");

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    interval = setInterval(() => {
      const state =
        viewer.model && (viewer.model as any)._lipSync && (viewer.model as any)._lipSync.audio
          ? (viewer.model as any)._lipSync.audio.state
          : "uninitialized";
      setAudioState(state);
    }, 500);
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [viewer]);
  // ▲▲▲ AudioContext状態監視用 ▲▲▲

  useEffect(() => {
    if (window.localStorage.getItem("chatVRMParams")) {
      const params = JSON.parse(
        window.localStorage.getItem("chatVRMParams") as string
      );
      setSystemPrompt(params.systemPrompt ?? SYSTEM_PROMPT);
      setKoeiroParam(params.koeiroParam ?? DEFAULT_PARAM);
      setChatLog(params.chatLog ?? []);
    }
  }, []);

  useEffect(() => {
    process.nextTick(() =>
      window.localStorage.setItem(
        "chatVRMParams",
        JSON.stringify({ systemPrompt, koeiroParam, chatLog })
      )
    );
  }, [systemPrompt, koeiroParam, chatLog]);

  const handleChangeChatLog = useCallback(
    (targetIndex: number, text: string) => {
      const newChatLog = chatLog.map((v: Message, i) => {
        return i === targetIndex ? { role: v.role, content: text } : v;
      });

      setChatLog(newChatLog);
    },
    [chatLog]
  );

  /**
   * 文ごとに音声を直列でリクエストしながら再生する
   */
  const handleSpeakAi = useCallback(
    async (
      screenplay: Screenplay,
      onStart?: () => void,
      onEnd?: () => void
    ) => {
      console.log("[DEBUG] handleSpeakAi called", screenplay);
      // VOICEVOXで喋らせる
      speakCharacterWithVoicevox(screenplay, viewer, { speakerId: 1, speedScale: 1.0 }, onStart, onEnd);
    },
    [viewer, koeiromapKey]
  );

  /**
   * アシスタントとの会話を行う
   */
  const handleSendChat = useCallback(
    async (text: string) => {

      // ▼▼▼ ここから追加 ▼▼▼
      // 最初のインタラクションでAudioContextを再開する
      if (isFirstInteraction) {
        viewer.resumeAudio();
        setIsFirstInteraction(false);
      }
      // ▲▲▲ ここまで追加 ▲▲▲

      console.log("[DEBUG] handleSendChat called", text);
      if (!openAiKey) {
        setAssistantMessage("APIキーが入力されていません");
        return;
      }
      const newMessage = text;

      if (newMessage == null) return;

      setChatProcessing(true);
      // ユーザーの発言を追加して表示
      const messageLog: Message[] = [
        ...chatLog,
        { role: "user", content: newMessage },
      ];
      setChatLog(messageLog);

      // Chat GPTへ
      const messages: Message[] = [
        {
          role: "system",
          content: systemPrompt,
        },
        ...messageLog,
      ];

      const stream = await getChatResponseStream(messages, openAiKey).catch(
        (e) => {
          console.error(e);
          return null;
        }
      );
      if (stream == null) {
        setChatProcessing(false);
        return;
      }

      const reader = stream.getReader();
      let receivedMessage = "";
      let aiTextLog = "";
      let tag = "";
      const sentences = new Array<string>();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          receivedMessage += value;

          // 返答内容のタグ部分の検出
          const tagMatch = receivedMessage.match(/^\[(.*?)\]/);
          if (tagMatch && tagMatch[0]) {
            tag = tagMatch[0];
            receivedMessage = receivedMessage.slice(tag.length);
          }

          // 返答を一文単位で切り出して処理する
          const sentenceMatch = receivedMessage.match(
            /^(.+[。．！？\n]|.{10,}[、,])/
          );
          if (sentenceMatch && sentenceMatch[0]) {
            const sentence = sentenceMatch[0];
            sentences.push(sentence);
            receivedMessage = receivedMessage
              .slice(sentence.length)
              .trimStart();

            // 発話不要/不可能な文字列だった場合はスキップ
            if (
              !sentence.replace(
                /^[\s\[\(\{「［（【『〈《〔｛«‹〘〚〛〙›»〕》〉』】）］」\}\)\]]+$/g,
                ""
              )
            ) {
              continue;
            }

            const aiText = `${tag} ${sentence}`;
            const aiTalks = textsToScreenplay([aiText], koeiroParam);
            aiTextLog += aiText;

            // 文ごとに音声を生成 & 再生、返答を表示
            const currentAssistantMessage = sentences.join(" ");
            console.log("[DEBUG] handleSendChat: call handleSpeakAi", aiTalks[0]);
            handleSpeakAi(aiTalks[0], () => {
              setAssistantMessage(currentAssistantMessage);
            });
          }
        }
      } catch (e) {
        setChatProcessing(false);
        console.error(e);
      } finally {
        reader.releaseLock();
      }

      // アシスタントの返答をログに追加
      const messageLogAssistant: Message[] = [
        ...messageLog,
        { role: "assistant", content: aiTextLog },
      ];

      setChatLog(messageLogAssistant);
      setChatProcessing(false);
    },
    [systemPrompt, chatLog, handleSpeakAi, openAiKey, koeiroParam]
  );

  return (
    <div
      className={"font-kaisei"}
      onClick={() => {
        if (isFirstInteraction) {
          viewer.resumeAudio();
          setIsFirstInteraction(false);
        }
      }}
    >
      <Meta />
      <VrmViewer />
      {/* ▼▼▼ チャット入力欄のすぐ上にボタン群を絶対配置 ▼▼▼ */}
      <div className="absolute bottom-[88px] left-0 w-full flex justify-between items-center gap-4 px-4 py-2 pointer-events-none z-30">
        <div className="pointer-events-auto">
          <Menu
            openAiKey={openAiKey}
            systemPrompt={systemPrompt}
            chatLog={chatLog}
            koeiroParam={koeiroParam}
            assistantMessage={assistantMessage}
            koeiromapKey={koeiromapKey}
            onChangeAiKey={setOpenAiKey}
            onChangeSystemPrompt={setSystemPrompt}
            onChangeChatLog={handleChangeChatLog}
            onChangeKoeiromapParam={setKoeiroParam}
            handleClickResetChatLog={() => setChatLog([])}
            handleClickResetSystemPrompt={() => setSystemPrompt(SYSTEM_PROMPT)}
            onChangeKoeiromapKey={setKoeiromapKey}
          />
        </div>
        <div className="flex items-center gap-4 pointer-events-auto">
          <div className="flex items-center px-2 py-1 rounded-lg bg-bg-dark/80 text-text-main font-bold text-sm shadow font-kaisei">
            {audioState === "uninitialized" && <span>🕒 音声未初期化</span>}
            {audioState === "suspended" && <span>🔒 音声ロック中</span>}
            {audioState === "running" && <span>🔊 音声有効</span>}
            {audioState === "closed" && <span>❌ 音声無効</span>}
          </div>
          <GitHubLink />
        </div>
      </div>
      {/* ▲▲▲ チャット入力欄のすぐ上にボタン群を絶対配置 ▲▲▲ */}
      <MessageInputContainer
        isChatProcessing={chatProcessing}
        onChatProcessStart={handleSendChat}
      />
    </div>
  );
}
