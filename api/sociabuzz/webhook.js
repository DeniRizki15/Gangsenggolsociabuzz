export const config = { api: { bodyParser: true } };
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const body = req.body;
  console.log("📦 RAW BODY BAGIBAGI:", JSON.stringify(body));

  const kvUrl = process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  const donation = {
    id: Date.now().toString(),
    nama: body.donorName || body.donor_name || body.name || "Anonymous",
    amount: Number(body.amount) || 0,
    message: body.message || "",
    email: "",
    timestamp: new Date().toISOString(),
    processed: false,
    source: "bagibagi"
  };

  await fetch(`${kvUrl}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${kvToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify([
      ["lpush", "donations", JSON.stringify(donation)],
      ["ltrim", "donations", 0, 49]
    ])
  });

  console.log("✅ BagiBagi tersimpan:", donation.nama, donation.amount);
  return res.status(200).json({ success: true });
}
