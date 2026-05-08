import { donations } from "../../lib/store.js";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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

  donations.push(donation);

  if (donations.length > 50) {
    donations.splice(0, donations.length - 50);
  }

  console.log("Donasi masuk:", donation.nama, donation.amount);
  return res.status(200).json({ success: true });
}
