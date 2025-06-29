import type { NextApiRequest, NextApiResponse } from "next";

// バイナリデータをそのまま返すAPI
export const config = {
  api: {
    bodyParser: false, // バイナリ受信のため
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  // バイナリデータを受け取る
  const chunks: Buffer[] = [];
  req.on("data", (chunk) => {
    chunks.push(chunk);
  });
  req.on("end", () => {
    const buffer = Buffer.concat(chunks);
    // Content-Typeはmp3/wav等に応じてクライアントで指定すること
    res.setHeader("Content-Type", req.headers["content-type"] || "audio/wav");
    res.status(200).send(buffer);
  });
}
