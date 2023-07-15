import axios from 'axios';

export default async function handler(req, res) {
  const { latitude, longitude } = req.query;

  try {
    // ホットペッパー API のエンドポイント URL
    const url = 'https://api.hotpepper.jp/v1/';
    // 任意のアクセスキー
    const apiKey = '5e7653c1a566d6d9';

    // ホットペッパー API へのリクエスト
    const response = await axios.get(`${url}/restaurants`, {
      params: {
        key: apiKey,
        lat: latitude,
        lng: longitude,
        range: 3, // 範囲の指定（例: 3km）
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