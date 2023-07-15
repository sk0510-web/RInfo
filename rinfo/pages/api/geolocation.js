export default function handler(req, res) {
    const { latitude, longitude } = req.query;
    res.json({ latitude, longitude });
  }