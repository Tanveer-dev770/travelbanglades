// Optional Vercel serverless proxy for a keyed weather provider.
// The current app uses Open-Meteo directly and does not require an API key.
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: 'Missing coordinates' });
  // Keep provider credentials server-side if you later switch providers.
  // Example: const key = process.env.WEATHER_API_KEY;
  return res.status(501).json({ error: 'Proxy not configured; current frontend uses Open-Meteo.' });
}
