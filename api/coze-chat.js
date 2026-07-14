export default async function handler(req, res) {
  const allowList = [
    "https://zml1119.github.io",
    "null",
    "http://127.0.0.1:8765",
    "http://localhost:8765"
  ];
  const origin = req.headers.origin || "";
  const isAllowedOrigin = allowList.includes(origin);

  if (isAllowedOrigin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const token = process.env.COZE_API_TOKEN;
  if (!token) {
    return res.status(500).json({ message: "COZE_API_TOKEN 未配置" });
  }

  try {
    const { workflow_id, question } = req.body || {};
    if (!workflow_id || !question) {
      return res.status(400).json({ message: "缺少 workflow_id 或 question" });
    }

    const response = await fetch("https://api.coze.cn/v1/workflows/chat", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        workflow_id,
        parameters: {},
        additional_messages: [
          {
            content: question,
            content_type: "text",
            role: "user",
            type: "question"
          }
        ]
      })
    });

    const json = await response.json().catch(() => ({}));
    return res.status(response.status).json(json);
  } catch (error) {
    return res.status(500).json({ message: error?.message || "代理请求失败" });
  }
}
