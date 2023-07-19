import fetch from 'node-fetch';

const defaultEndpoint = 'https://webservice.recruit.co.jp/hotpepper/gourmet/v1/';
const API_KEY = '5e7653c1a566d6d9';

const handler = async (req, res) => {
  let url = `${defaultEndpoint}?key=${API_KEY}&format=json`;

  if (typeof req.query.start !== 'undefined') {
    url = `${url}&start=${req.query.start}`;
  }

  if (typeof req.query.keyword !== 'undefined') {
    const keyword = encodeURIComponent(req.query.keyword);
    url = `${url}&keyword=${keyword}`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();

    res.status(200).json(data);
  } catch (error) {
    console.error('ホットペッパーAPIのリクエストエラー:', error);
    res.status(500).json({ message: 'ホットペッパーAPIのリクエストエラーが発生しました' });
  }
};

export default handler;