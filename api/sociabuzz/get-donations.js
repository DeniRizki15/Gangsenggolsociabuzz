export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const kvUrl = process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  const headers = { Authorization: `Bearer ${kvToken}`, "Content-Type": "application/json" };

  let donations = [];
  try {
    const getRes = await fetch(`${kvUrl}/lrange/donations/0/-1`, { headers });
    const getData = await getRes.json();
    if (getData.result && Array.isArray(getData.result)) {
      donations = getData.result.map(d => JSON.parse(d));
    }
  } catch (e) {
    return res.status(200).json({ success: true, donations: [] });
  }

  const unprocessed = donations.filter(d => !d.processed);

  // Mark semua sebagai processed pakai pipeline (DEL + LPUSH dalam 1 request)
  if (unprocessed.length > 0) {
    const updated = donations.map(d => ({ ...d, processed: true }));
    const pipeline = [
      ["del", "donations"],                          // ← DEL dalam pipeline, bukan request terpisah
      ...updated.map(d => ["lpush", "donations", JSON.stringify(d)]),
      ["ltrim", "donations", 0, 49]
    ];

    await fetch(`${kvUrl}/pipeline`, {
      method: "POST",
      headers,
      body: JSON.stringify(pipeline)
    });
  }

  return res.status(200).json({ success: true, donations: unprocessed });
}
