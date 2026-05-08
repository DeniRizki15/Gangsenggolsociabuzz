export const config = {
  api: {
    bodyParser: false,
  },
};

// Ambil dari global storage
if (!global._donations) {
  global._donations = [];
}

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const unprocessed = global._donations.filter(d => !d.processed);
  unprocessed.forEach(d => (d.processed = true));

  return res.status(200).json({
    success: true,
    donations: unprocessed
  });
}
