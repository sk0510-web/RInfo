export default function handler(req, res) {
    if (req.method === 'GET') {
      if (typeof window !== 'undefined' && 'geolocation' in navigator) {
        // Geolocation is available on the client-side
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            res.status(200).json({ latitude, longitude });
          },
          (error) => {
            console.error(error);
            res.status(500).json({ error: 'Failed to get geolocation' });
          }
        );
      } else {
        res.status(400).json({ error: 'Geolocation is not supported' });
      }
    } else {
      res.status(405).json({ error: 'Method Not Allowed' });
    }
  }