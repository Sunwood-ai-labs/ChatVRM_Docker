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
      <div className="bg-base text-black">
        <div className="mx-auto max-w-4xl p-16">
          <div className="grid grid-flow-col gap-[8px] grid-cols-[min-content_min-content_1fr_min-content]">
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
                className="bg-secondary hover:bg-secondary-hover active:bg-secondary-press disabled:bg-secondary-disabled"
                isProcessing={false}
                disabled={isChatProcessing}
                onClick={handleAudioUploadClick}
                title="音声ファイルアップロード"
              />
            </div>
            <IconButton
              iconName="24/Microphone"
              className="bg-secondary hover:bg-secondary-hover active:bg-secondary-press disabled:bg-secondary-disabled"
              isProcessing={isMicRecording}
              disabled={isChatProcessing}
              onClick={onClickMicButton}
            />
            <input
              type="text"
              placeholder="聞きたいことをいれてね"
              onChange={onChangeUserMessage}
              disabled={isChatProcessing}
              className="bg-surface1 hover:bg-surface1-hover focus:bg-surface1 disabled:bg-surface1-disabled disabled:text-primary-disabled rounded-16 w-full px-16 text-text-primary typography-16 font-bold disabled"
              value={userMessage}
            ></input>
            <IconButton
              iconName="24/Send"
              className="bg-secondary hover:bg-secondary-hover active:bg-secondary-press disabled:bg-secondary-disabled"
              isProcessing={isChatProcessing}
              disabled={isChatProcessing || !userMessage}
              onClick={onClickSendButton}
            />
          </div>
        </div>
        <div className="py-4 bg-[#413D43] text-center text-white font-Montserrat">
          powered by VRoid, Koemotion, ChatGPT API
        </div>
      </div>
    </div>
  );
};