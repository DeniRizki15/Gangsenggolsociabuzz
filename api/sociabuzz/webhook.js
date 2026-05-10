export const config = { api: { bodyParser: true } };

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const body = req.body;
  const kvUrl = process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  const donation = {
    id: body.id || Date.now().toString(),
    nama: body.supporter || "Anonymous",
    amount: body.amount || 0,
    message: body.message || "",
    email: body.email_supporter || "",
    timestamp: body.created_at || new Date().toISOString(),
    processed: false
  };

  await fetch(`${kvUrl}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${kvToken}`, "Content-Type": "application/json" },
    body: JSON.stringify([
      ["lpush", "donations", JSON.stringify(donation)],
      ["ltrim", "donations", 0, 49]
    ])
  });

  return res.status(200).json({ success: true });
}
