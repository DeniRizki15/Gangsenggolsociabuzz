export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const kvUrl = process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  let donations = [];
  try {
    const getRes = await fetch(`${kvUrl}/get/donations`, {
      headers: { Authorization: `Bearer ${kvToken}` }
    });
    const getData = await getRes.json();
    if (getData.result) {
      const parsed = JSON.parse(getData.result);
      donations = Array.isArray(parsed) ? parsed : [];
    }
  } catch (e) {
    donations = [];
  }

  const unprocessed = donations.filter(d => !d.processed);
  donations.forEach(d => d.processed = true);

  // Simpan balik
  try {
    await fetch(`${kvUrl}/set/donations/${encodeURIComponent(JSON.stringify(donations))}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${kvToken}` }
    });
  } catch (e) {}

  return res.status(200).json({ success: true, donations: unprocessed });
}
