export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { systemPrompt, userMessage, imageBase64, imageType, prd } = req.body;

  const contentBlocks = [];
  if (imageBase64) {
    contentBlocks.push({
      type: "image",
      source: { type: "base64", media_type: imageType || "image/png", data: imageBase64 },
    });
  }
  const fullMessage = prd
    ? `PRODUCT CONTEXT (PRD):\n${prd}\n\n---\n\n${userMessage}`
    : userMessage;
  contentBlocks.push({ type: "text", text: fullMessage });

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{ role: "user", content: contentBlocks }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || "";
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    return res.status(200).json(parsed);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
