import { ButtonHTMLAttributes } from "react";
type Props = ButtonHTMLAttributes<HTMLButtonElement>;

export const TextButton = (props: Props) => {
  return (
    <button
      {...props}
      className={`px-6 py-2 text-text-on-primary font-bold bg-primary hover:brightness-110 active:brightness-95 disabled:opacity-50 transition-all rounded-full font-kaisei ${props.className}`}
    >
      {props.children}
    </button>
  );
};
