export const config = { api: { bodyParser: true } };

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const body = req.body;

  const donation = {
    id: body.invoice_id || Date.now().toString(),
    nama: body.donatur_name || "Anonymous",
    amount: body.amount_raw || 0,
    message: body.donatur_note || "",
    email: body.donatur_email || "",
    timestamp: new Date().toISOString(),
    processed: false
  };

  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;

  // Ambil data lama
  const getRes = await fetch(`${kvUrl}/get/donations`, {
    headers: { Authorization: `Bearer ${kvToken}` }
  });
  const getData = await getRes.json();

  let donations = [];
  if (getData.result) {
    try { donations = JSON.parse(getData.result); } catch { donations = []; }
  }

  donations.push(donation);
  if (donations.length > 50) donations.splice(0, donations.length - 50);

  // Simpan ke KV
  await fetch(`${kvUrl}/set/donations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${kvToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(JSON.stringify(donations))
  });

  console.log("✅ Donasi tersimpan:", donation.nama, donation.amount);
  return res.status(200).json({ success: true });
}
