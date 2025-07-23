import { buildUrl } from "@/utils/buildUrl";
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  const bgImage = process.env.NEXT_PUBLIC_BG_IMAGE || "/bg-d.png";
  return (
    <Html lang="ja">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Kaisei+Decol:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body style={{ backgroundImage: `url(${buildUrl(bgImage)})` }}>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
