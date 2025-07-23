import { IconButton } from "./iconButton";
import { useRef } from "react";

type Props = {
  userMessage: string;
  isMicRecording: boolean;
  isChatProcessing: boolean;
  onChangeUserMessage: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onClickSendButton: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onClickMicButton: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onAudioFileSelected?: (file: File) => void;
};

export const MessageInput = ({
  userMessage,
  isMicRecording,
  isChatProcessing,
  onChangeUserMessage,
  onClickMicButton,
  onClickSendButton,
  onAudioFileSelected,
}: Props) => {
  const audioFileInputRef = useRef<HTMLInputElement>(null);

  const handleAudioUploadClick = () => {
    audioFileInputRef.current?.click();
  };

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onAudioFileSelected) {
      onAudioFileSelected(file);
    }
    // 選択後に同じファイルを再選択できるようにinputをリセット
    e.target.value = "";
  };

  return (
    <div className="absolute bottom-0 z-20 w-screen">
      <div className="bg-bg-dark text-text-main">
        <div className="mx-auto max-w-4xl p-4">
          <div className="grid grid-flow-col gap-2 grid-cols-[min-content_min-content_1fr_min-content]">
            {/* 音声ファイルアップロードボタン */}
            <div>
              <input
                ref={audioFileInputRef}
                type="file"
                accept="audio/*"
                style={{ display: "none" }}
                disabled={isChatProcessing}
                onChange={handleAudioFileChange}
              />
              <IconButton
                iconName="24/Upload"
                className="bg-secondary text-text-on-secondary"
                isProcessing={false}
                disabled={isChatProcessing}
                onClick={handleAudioUploadClick}
                title="音声ファイルアップロード"
              />
            </div>
            <IconButton
              iconName="24/Microphone"
              className="bg-secondary text-text-on-secondary"
              isProcessing={isMicRecording}
              disabled={isChatProcessing}
              onClick={onClickMicButton}
            />
            <input
              type="text"
              placeholder="聞きたいことをいれてね"
              onChange={onChangeUserMessage}
              disabled={isChatProcessing}
              className="bg-bg-light focus:outline-accent disabled:opacity-50 rounded-lg w-full px-4 text-text-main font-bold font-kaisei"
              value={userMessage}
            ></input>
            <IconButton
              iconName="24/Send"
              className="bg-secondary text-text-on-secondary"
              isProcessing={isChatProcessing}
              disabled={isChatProcessing || !userMessage}
              onClick={onClickSendButton}
            />
          </div>
        </div>
        <div className="py-1 bg-secondary text-center text-text-on-secondary text-xs font-kaisei">
          powered by VRoid, VOICEVOX, ChatGPT API
        </div>
      </div>
    </div>
  );
};