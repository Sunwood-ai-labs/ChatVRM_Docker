/**
 * @type {import('tailwindcss/tailwind-config').TailwindConfig}
 */
module.exports = {
  darkMode: "media", // OSのテーマ設定（'light' or 'dark'）に連動
  content: ["./src/**/*.tsx", "./src/**/*.html"],
  theme: {
    extend: {
      colors: {
        // CSS変数を使ってライト/ダークテーマを動的に切り替える
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        accent: "var(--color-accent)",
        "neon-hover": "var(--color-neon-hover)",
        bg: {
          dark: "var(--color-bg-dark)",
          light: "var(--color-bg-light)",
        },
        text: {
          main: "var(--color-text-main)",
          sub: "var(--color-text-sub)",
          "on-primary": "var(--color-text-on-primary)",
          "on-secondary": "var(--color-text-on-secondary)",
        },
      },
      fontFamily: {
        // "涼雅和モダンフォント" として Kaisei Decol を設定
        kaisei: ['"Kaisei Decol"', "serif"],
      },
    },
  },
  plugins: [require("@tailwindcss/line-clamp")],
};
