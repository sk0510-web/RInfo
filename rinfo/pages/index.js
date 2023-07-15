import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_KEY = '5e7653c1a566d6d9';

const SearchForm = ({ onSubmit }) => {
  const [radius, setRadius] = useState(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(radius);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Search Radius (km):
        <input
          type="number"
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          min={1}
          max={10}
        />
      </label>
      <button type="submit">Search</button>
    </form>
  );
};

const RestaurantList = ({ restaurants }) => (
  <ul>
    {restaurants.map((restaurant) => (
      <li key={restaurant.id}>
        <h3>{restaurant.name}</h3>
        <p>Access: {restaurant.access}</p>
        {restaurant.photo.mobile ? (
          <img src={restaurant.photo.mobile.l} alt={restaurant.name} />
        ) : (
          <p>No Image</p>
        )}
      </li>
    ))}
  </ul>
);

const RestaurantDetail = ({ restaurant }) => (
  <div>
    <h2>{restaurant.name}</h2>
    <p>Address: {restaurant.address}</p>
    <p>Opening Hours: {restaurant.open}</p>
    {restaurant.photo.mobile ? (
      <img src={restaurant.photo.mobile.l} alt={restaurant.name} />
    ) : (
      <p>No Image</p>
    )}
  </div>
);

export default function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://webservice.recruit.co.jp/hotpepper/gourmet/v1`,
          {
            params: {
              key: API_KEY,
              lat: '35.6895',
              lng: '139.6917',
              range: 1,
              format: 'json',
            },
          }
        );
        setRestaurants(response.data.results.shop);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const handleSearch = async (radius) => {
    try {
      const response = await axios.get(
        `http://webservice.recruit.co.jp/hotpepper/gourmet/v1`,
        {
          params: {
            key: API_KEY,
            lat: '35.6895',
            lng: '139.6917',
            range: radius,
            format: 'json',
          },
        }
      );
      setRestaurants(response.data.results.shop);
      setSelectedRestaurant(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRestaurantSelect = (restaurant) => {
    setSelectedRestaurant(restaurant);
  };

  return (
    <div>
      <h1>Restaurant Search</h1>
      <SearchForm onSubmit={handleSearch} />
      {restaurants.length > 0 ? (
        <RestaurantList
          restaurants={restaurants}
          onRestaurantSelect={handleRestaurantSelect}
        />
      ) : (
        <p>No restaurants found.</p>
      )}
      {selectedRestaurant && <RestaurantDetail restaurant={selectedRestaurant} />}
    </div>
  );
}