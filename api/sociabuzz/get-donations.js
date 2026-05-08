export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const kvUrl = process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.UPSTASH_REDIS_REST_TOKEN;

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

  // Update processed = true untuk semua
  if (unprocessed.length > 0) {
    // Hapus semua lalu simpan ulang dengan processed = true
    const updated = donations.map(d => ({ ...d, processed: true }));
    
    await fetch(`${kvUrl}/del/donations`, {
      method: "GET",
      headers: { Authorization: `Bearer ${kvToken}` }
    });

    for (const d of updated.reverse()) {
      await fetch(`${kvUrl}/lpush/donations/${encodeURIComponent(JSON.stringify(d))}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${kvToken}` }
      });
    }
  }

  return res.status(200).json({ success: true, donations: unprocessed });
}
