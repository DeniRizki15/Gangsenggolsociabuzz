export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;

  // Ambil dari KV
  const getRes = await fetch(`${kvUrl}/get/donations`, {
    headers: { Authorization: `Bearer ${kvToken}` }
  });
  const getData = await getRes.json();

  let donations = [];
  if (getData.result) {
    try { donations = JSON.parse(getData.result); } catch { donations = []; }
  }

  const unprocessed = donations.filter(d => !d.processed);
  donations.forEach(d => d.processed = true);

  // Simpan balik
  await fetch(`${kvUrl}/set/donations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${kvToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(JSON.stringify(donations))
  });

  return res.status(200).json({ success: true, donations: unprocessed });
}
