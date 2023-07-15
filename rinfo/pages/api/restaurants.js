import axios from 'axios';

export default async function handler(req, res) {
  const { latitude, longitude } = req.query;

  try {
    const url = 'http://webservice.recruit.co.jp/hotpepper/gourmet/v1';
    const apiKey = '5e7653c1a566d6d9';

    const response = await axios.get(`${url}/restaurants`, {
      params: {
        key: apiKey,
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