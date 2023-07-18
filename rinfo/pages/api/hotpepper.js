import axios from 'axios';

const handler = async (req, res) => {
  const { lat, lng } = req.query;
  const apiUrl = `https://webservice.recruit.co.jp/hotpepper/gourmet/v1/?key=5e7653c1a566d6d9&format=json&lat=${lat}&lng=${lng}`;

  try {
    const response = await axios.get(apiUrl);
    const data = response.data;
    res.status(200).json(data);
  } catch (error) {
    console.error('ホットペッパーAPIからのデータ取得に失敗しました', error);
    res.status(500).json({ error: 'ホットペッパーAPIからのデータ取得に失敗しました' });
  }
};

export default handler;