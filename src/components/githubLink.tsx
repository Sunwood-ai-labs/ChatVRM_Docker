import { buildUrl } from "@/utils/buildUrl";

export const GitHubLink = () => {
  return (
    <div>
      <a
        draggable={false}
        href="https://github.com/pixiv/ChatVRM"
        rel="noopener noreferrer"
        target="_blank"
      >
        <div className="p-2 rounded-full bg-primary hover:bg-accent active:bg-secondary flex items-center transition-all">
          <img
            alt="https://github.com/pixiv/ChatVRM"
            height={32}
            width={32}
            src={buildUrl("/github-mark-white.svg")}
            className="rounded-full bg-white p-1"
          />
          <div className="ml-2 text-text-on-primary font-bold font-kaisei">Fork me</div>
        </div>
      </a>
    </div>
  );
};
