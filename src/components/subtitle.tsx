type Props = {
  text: string;
};

/**
 * 発話内容を画面下部に表示する字幕コンポーネント
 */
export const Subtitle = ({ text }: Props) => {
  if (!text) {
    return null;
  }

  return (
    <div className="absolute bottom-28 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-30">
      <div className="bg-black bg-opacity-60 text-white text-center text-xl lg:text-2xl font-bold p-4 rounded-lg shadow-lg backdrop-blur-sm animate-fade-in">
        <p className="m-0">{text}</p>
      </div>
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};