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
    id: body.invoice_id || Date.now().toString(),
    nama: body.donatur_name || "Anonymous",
    amount: body.amount_raw || 0,
    message: body.donatur_note || "",
    email: body.donatur_email || "",
    timestamp: new Date().toISOString(),
    processed: false
  };

  // Ambil data lama
  let donations = [];
  try {
    const getRes = await fetch(`${kvUrl}/lrange/donations/0/-1`, {
      headers: { Authorization: `Bearer ${kvToken}` }
    });
    const getData = await getRes.json();
    if (getData.result && Array.isArray(getData.result)) {
      donations = getData.result.map(d => JSON.parse(d));
    }
  } catch (e) {
    donations = [];
  }

  // Tambah donasi baru pakai LPUSH
  await fetch(`${kvUrl}/lpush/donations/${encodeURIComponent(JSON.stringify(donation))}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${kvToken}` }
  });

  // Trim list max 50
  await fetch(`${kvUrl}/ltrim/donations/0/49`, {
    method: "GET",
    headers: { Authorization: `Bearer ${kvToken}` }
  });

  console.log("✅ Donasi tersimpan:", donation.nama, donation.amount);
  return res.status(200).json({ success: true });
}
