import { KnownIconType } from "@charcoal-ui/icons";
import { ButtonHTMLAttributes } from "react";
type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  iconName: keyof KnownIconType;
  isProcessing: boolean;
  label?: string;
};

export const IconButton = ({
  iconName,
  isProcessing,
  label,
  ...rest
}: Props) => {
  return (
    <button
      {...rest}
      className={`bg-primary text-text-on-primary hover:brightness-110 active:brightness-95 disabled:opacity-50 transition-all rounded-lg text-sm p-2 text-center inline-flex items-center font-kaisei
        ${rest.className}
      `}
    >
      {isProcessing ? (
        <span className="animate-spin">
          <pixiv-icon name={"24/Dot"} scale="1"></pixiv-icon>
        </span>
      ) : (
        <pixiv-icon name={iconName} scale="1"></pixiv-icon>
      )}
      {label && <div className="mx-2 font-bold">{label}</div>}
    </button>
  );
};
