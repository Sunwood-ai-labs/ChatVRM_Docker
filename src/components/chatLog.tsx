import { useEffect, useRef } from "react";
import { Message } from "@/features/messages/messages";
type Props = {
  messages: Message[];
};
export const ChatLog = ({ messages }: Props) => {
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatScrollRef.current?.scrollIntoView({
      behavior: "auto",
      block: "center",
    });
  }, []);

  useEffect(() => {
    chatScrollRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [messages]);
  return (
    <div className="absolute w-col-span-6 max-w-full h-[100svh] pb-64">
      <div className="max-h-full px-4 pt-24 pb-16 overflow-y-auto scroll-hidden">
        {messages.map((msg, i) => {
          return (
            <div key={i} ref={messages.length - 1 === i ? chatScrollRef : null}>
              <Chat role={msg.role} message={msg.content} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Chat = ({ role, message }: { role: string; message: string }) => {
  const isAssistant = role === "assistant";

  const roleColor = isAssistant
    ? "bg-secondary text-text-on-secondary"
    : "bg-primary text-text-on-primary";
  const roleText = isAssistant ? "text-secondary" : "text-primary";
  const offsetX = !isAssistant ? "pl-10" : "pr-10";

  return (
    <div className={`mx-auto max-w-sm my-4 ${offsetX}`}>
      <div
        className={`px-4 py-1 rounded-t-lg font-bold tracking-wider font-kaisei ${roleColor}`}
      >
        {isAssistant ? "CHARACTER" : "YOU"}
      </div>
      <div className="px-6 py-4 bg-bg-light rounded-b-lg">
        <div className={`text-base font-bold font-kaisei ${roleText}`}>{message}</div>
      </div>
    </div>
  );
};
