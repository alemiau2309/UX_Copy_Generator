import mammoth from "mammoth";

export const config = {
  api: { bodyParser: { sizeLimit: "10mb" } },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { base64 } = req.body;

  try {
    const buffer = Buffer.from(base64, "base64");
    const result = await mammoth.extractRawText({ buffer });
    return res.status(200).json({ text: result.value });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
