import { donations } from "../../lib/store.js";

export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const unprocessed = donations.filter(d => !d.processed);
  unprocessed.forEach(d => (d.processed = true));

  return res.status(200).json({
    success: true,
    donations: unprocessed
  });
}
