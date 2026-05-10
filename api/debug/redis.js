export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const kvUrl = process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  const getRes = await fetch(`${kvUrl}/lrange/donations/0/-1`, {
    headers: { Authorization: `Bearer ${kvToken}` }
  });
  const getData = await getRes.json();

  return res.status(200).json({ raw: getData });
}
