export const config = { api: { bodyParser: true } };
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const body = req.body;
  console.log("📦 RAW BODY:", JSON.stringify(body));

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

  // Tunggu Redis benar-benar selesai nulis
  const pipelineRes = await fetch(`${kvUrl}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${kvToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify([
      ["rpush", "donations", JSON.stringify(donation)], // rpush biar urutan benar
      ["ltrim", "donations", 0, 49]
    ])
  });
  await pipelineRes.json(); // ← tunggu konfirmasi Redis

  console.log("✅ Donasi tersimpan:", donation.nama, donation.amount);
  return res.status(200).json({ success: true });
}
