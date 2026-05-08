export const config = {
  api: {
    bodyParser: true,
  },
};

let donations = [];

export default function handler(req, res) {
  // Handle CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body;
  console.log("Body diterima:", JSON.stringify(body));

  const donation = {
    id: body.invoice_id || Date.now().toString(),
    nama: body.donatur_name || "Anonymous",
    amount: body.amount_raw || 0,
    message: body.donatur_note || "",
    email: body.donatur_email || "",
    timestamp: new Date().toISOString(),
    processed: false
  };

  donations.push(donation);

  if (donations.length > 50) {
    donations.splice(0, donations.length - 50);
  }

  return res.status(200).json({ success: true });
}
