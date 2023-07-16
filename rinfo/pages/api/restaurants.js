import axios from 'axios';

export default async function handler(req, res) {
  const { latitude, longitude } = req.query;

  try {
    const response = await axios.get('/api/hotpepper', {
      params: {
        key: '5e7653c1a566d6d9',
        lat: latitude,
        lng: longitude,
        range: 1,
        format: 'json',
      },
    });

    const restaurants = response.data.results.shop;
    res.json(restaurants);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
}