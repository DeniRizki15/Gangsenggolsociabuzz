export const config = { api: { bodyParser: false } };

if (!global._donations) global._donations = [];

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const unprocessed = global._donations.filter(d => !d.processed);
  global._donations = global._donations.map(d => ({ ...d, processed: true }));

  return res.status(200).json({ success: true, donations: unprocessed });
}
