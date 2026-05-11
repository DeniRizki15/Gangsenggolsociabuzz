// GET /api/sociabuzz/get-donations
if (url.pathname === "/api/sociabuzz/get-donations" && request.method === "GET") {
  const existing = await env.DONATIONS.get("list");
  let donations = existing ? JSON.parse(existing) : [];

  const unprocessed = donations.filter(d => !d.processed);
  
  // Hanya write kalau ada donasi baru
  if (unprocessed.length > 0) {
    donations = donations.map(d => ({ ...d, processed: true }));
    await env.DONATIONS.put("list", JSON.stringify(donations));
  }

  return new Response(JSON.stringify({ success: true, donations: unprocessed }), { headers });
}
