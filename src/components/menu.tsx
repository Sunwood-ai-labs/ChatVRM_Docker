import { IconButton } from "./iconButton";
import { Message } from "@/features/messages/messages";
import { KoeiroParam } from "@/features/constants/koeiroParam";
import { ChatLog } from "./chatLog";
import React, { useCallback, useContext, useRef, useState } from "react";
import { Settings } from "./settings";
import { ViewerContext } from "@/features/vrmViewer/viewerContext";
import { AssistantText } from "./assistantText";

type Props = {
  openAiKey: string;
  systemPrompt: string;
  chatLog: Message[];
  koeiroParam: KoeiroParam;
  assistantMessage: string;
  koeiromapKey: string;
  onChangeSystemPrompt: (systemPrompt: string) => void;
  onChangeAiKey: (key: string) => void;
  onChangeChatLog: (index: number, text: string) => void;
  onChangeKoeiromapParam: (param: KoeiroParam) => void;
  handleClickResetChatLog: () => void;
  handleClickResetSystemPrompt: () => void;
  onChangeKoeiromapKey: (key: string) => void;
};
export const Menu = ({
  openAiKey,
  systemPrompt,
  chatLog,
  koeiroParam,
  assistantMessage,
  koeiromapKey,
  onChangeSystemPrompt,
  onChangeAiKey,
  onChangeChatLog,
  onChangeKoeiromapParam,
  handleClickResetChatLog,
  handleClickResetSystemPrompt,
  onChangeKoeiromapKey,
}: Props) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showChatLog, setShowChatLog] = useState(false);
  const { viewer } = useContext(ViewerContext);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 音声アップロード用
  const audioInputRef = useRef<HTMLInputElement>(null);

  // WebSocketで音声バイナリを受信して喋らせる
  React.useEffect(() => {
    if (!viewer.model) return;
    const ws = new WebSocket("ws://localhost:8080");
    ws.binaryType = "arraybuffer";
    ws.onopen = () => {
      console.log("WebSocket接続");
    };
    ws.onmessage = async (event) => {
      if (!(event.data instanceof ArrayBuffer)) return;
      const buffer = event.data;
      const dummyScreenplay = {
        expression: "neutral" as const,
        talk: { style: "talk" as const, speakerX: 0, speakerY: 0, message: "" },
      };
      await viewer.model!.speak(buffer, dummyScreenplay);
    };
    ws.onclose = () => {
      console.log("WebSocket切断");
    };
    return () => {
      ws.close();
    };
  }, [viewer.model]);

  const handleUploadAudio = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !viewer.model) return;

    // APIにバイナリPOST
    const res = await fetch("/api/speak_external_audio", {
      method: "POST",
      headers: {
        "Content-Type": file.type || "audio/wav",
      },
      body: file,
    });
    const buffer = await res.arrayBuffer();

    // ダミーScreenplay
    const dummyScreenplay = {
      expression: "neutral" as const,
      talk: { style: "talk" as const, speakerX: 0, speakerY: 0, message: "" },
    };

    await viewer.model.speak(buffer, dummyScreenplay);
  };

  const handleClickAudioInput = () => {
    audioInputRef.current?.click();
  };

  const handleChangeSystemPrompt = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChangeSystemPrompt(event.target.value);
    },
    [onChangeSystemPrompt]
  );

  const handleAiKeyChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChangeAiKey(event.target.value);
    },
    [onChangeAiKey]
  );

  const handleChangeKoeiromapKey = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChangeKoeiromapKey(event.target.value);
    },
    [onChangeKoeiromapKey]
  );

  const handleChangeKoeiroParam = useCallback(
    (x: number, y: number) => {
      onChangeKoeiromapParam({
        speakerX: x,
        speakerY: y,
      });
    },
    [onChangeKoeiromapParam]
  );

  const handleClickOpenVrmFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleChangeVrmFile = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files) return;

      const file = files[0];
      if (!file) return;

      const file_type = file.name.split(".").pop();

      if (file_type === "vrm") {
        const blob = new Blob([file], { type: "application/octet-stream" });
        const url = window.URL.createObjectURL(blob);
        viewer.loadVrm(url);
      }

      event.target.value = "";
    },
    [viewer]
  );

  return (
    <>
      <div className="absolute z-10 m-24">
        <div className="grid grid-flow-col gap-[8px]">
          <IconButton
            iconName="24/Menu"
            label="設定"
            isProcessing={false}
            onClick={() => setShowSettings(true)}
          ></IconButton>
          {showChatLog ? (
            <IconButton
              iconName="24/CommentOutline"
              label="会話ログ"
              isProcessing={false}
              onClick={() => setShowChatLog(false)}
            />
          ) : (
            <IconButton
              iconName="24/CommentFill"
              label="会話ログ"
              isProcessing={false}
              disabled={chatLog.length <= 0}
              onClick={() => setShowChatLog(true)}
            />
          )}
        </div>
      </div>
      {showChatLog && <ChatLog messages={chatLog} />}
      {showSettings && (
        <Settings
          openAiKey={openAiKey}
          chatLog={chatLog}
          systemPrompt={systemPrompt}
          koeiroParam={koeiroParam}
          koeiromapKey={koeiromapKey}
          onClickClose={() => setShowSettings(false)}
          onChangeAiKey={handleAiKeyChange}
          onChangeSystemPrompt={handleChangeSystemPrompt}
          onChangeChatLog={onChangeChatLog}
          onChangeKoeiroParam={handleChangeKoeiroParam}
          onClickOpenVrmFile={handleClickOpenVrmFile}
          onClickResetChatLog={handleClickResetChatLog}
          onClickResetSystemPrompt={handleClickResetSystemPrompt}
          onChangeKoeiromapKey={handleChangeKoeiromapKey}
        />
      )}
      {/* 音声ファイルアップロードUI */}
      <div className="my-8">
        <input
          type="file"
          accept="audio/*"
          ref={audioInputRef}
          style={{ display: "inline" }}
          onChange={handleUploadAudio}
        />
        <button
          className="ml-2 px-8 py-4 bg-secondary text-white rounded"
          onClick={handleClickAudioInput}
        >
          音声ファイルを選択して喋らせる
        </button>
      </div>
      {!showChatLog && assistantMessage && (
        <AssistantText message={assistantMessage} />
      )}
      <input
        type="file"
        className="hidden"
        accept=".vrm"
        ref={fileInputRef}
        onChange={handleChangeVrmFile}
      />
    </>
  );
};
