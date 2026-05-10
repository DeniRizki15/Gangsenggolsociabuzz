export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const kvUrl = process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  // Ambil semua donasi
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

  // Ambil yang belum diproses
  const unprocessed = donations.filter(d => !d.processed);

  // Hapus semua lalu simpan ulang dengan processed = true
  if (donations.length > 0) {
    const updated = donations.map(d => ({ ...d, processed: true }));
    const pipeline = updated.map(d => ["lpush", "donations", JSON.stringify(d)]);
    
    await fetch(`${kvUrl}/del/donations`, {
      headers: { Authorization: `Bearer ${kvToken}` }
    });

    await fetch(`${kvUrl}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${kvToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(pipeline)
    });
  }

  return res.status(200).json({ success: true, donations: unprocessed });
}
