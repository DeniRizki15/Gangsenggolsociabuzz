export const config = { api: { bodyParser: true } };

if (!global._donations) global._donations = [];

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const body = req.body;
  console.log("📦 RAW BODY:", JSON.stringify(body));

  const donation = {
    id: body.id || Date.now().toString(),
    nama: body.supporter || "Anonymous",
    amount: body.amount || 0,
    message: body.message || "",
    email: body.email_supporter || "",
    timestamp: body.created_at || new Date().toISOString(),
    processed: false
  };

  global._donations.unshift(donation);
  if (global._donations.length > 50) global._donations = global._donations.slice(0, 50);

  console.log("✅ Donasi tersimpan:", donation.nama, donation.amount);
  return res.status(200).json({ success: true });
}
