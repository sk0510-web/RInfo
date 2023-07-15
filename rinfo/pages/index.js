import axios from 'axios';

export default function Home() {
  const fetchRestaurants = async () => {
    try {
      // 現在地の取得
      const geolocationResponse = await axios.get('/api/geolocation');
      const { latitude, longitude } = geolocationResponse.data;

      // レストランの取得
      const restaurantResponse = await axios.get(`/api/restaurants?latitude=${latitude}&longitude=${longitude}`);
      const restaurants = restaurantResponse.data;

      console.log(restaurants);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <button onClick={fetchRestaurants}>レストラン情報を取得</button>
    </div>
  );
}
