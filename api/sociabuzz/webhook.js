export const config = { api: { bodyParser: false } };
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  const kvUrl = process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  // Ambil semua donasi
  let donations = [];
  try {
    const getRes = await fetch(${kvUrl}/lrange/donations/0/-1, {
      headers: { Authorization: Bearer ${kvToken} }
    });
    const getData = await getRes.json();
    if (getData.result && Array.isArray(getData.result)) {
      donations = getData.result.map(d => JSON.parse(d));
    }
  } catch (e) {
    donations = [];
  }
  // Ambil yang belum diproses
  const unprocessed = donations.filter(d => !d.processed);
  // Hapus semua lalu simpan ulang dengan processed = true
  if (donations.length > 0) {
    const updated = donations.map(d => ({ ...d, processed: true }));
    const pipeline = updated.map(d => ["lpush", "donations", JSON.stringify(d)]);

    await fetch(${kvUrl}/del/donations, {
      headers: { Authorization: Bearer ${kvToken} }
    });
    await fetch(${kvUrl}/pipeline, {
      method: "POST",
      headers: {
        Authorization: Bearer ${kvToken},
        "Content-Type": "application/json"
      },
      body: JSON.stringify(pipeline)
    });
  }
  return res.status(200).json({ success: true, donations: unprocessed });
}

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
  // Simpan pakai pipeline
  await fetch(${kvUrl}/pipeline, {
    method: "POST",
    headers: {
      Authorization: Bearer ${kvToken},
      "Content-Type": "application/json"
    },
    body: JSON.stringify([
      ["lpush", "donations", JSON.stringify(donation)],
      ["ltrim", "donations", 0, 49]
    ])
  });
  console.log("✅ Donasi tersimpan:", donation.nama, donation.amount);
  return res.status(200).json({ success: true });
}
