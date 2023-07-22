import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Head from 'next/head';
import Link from 'next/link';
import '../app/globals.css';
import { GoogleMap, withGoogleMap, withScriptjs, Marker } from "react-google-maps";

const API_KEY = '5e7653c1a566d6d9';
const defaultEndpoint = `https://webservice.recruit.co.jp/hotpepper/gourmet/v1/?key=${API_KEY}&format=json`;

const Map = withScriptjs(withGoogleMap((props) =>
  <GoogleMap
    defaultZoom={14}
    defaultCenter={{ lat: props.latitude, lng: props.longitude }}
    defaultOptions={{ disableDefaultUI: true }}
    zoom={props.zoom}
  />
));

export async function getServerSideProps() {
  const res = await fetch(defaultEndpoint);
  const data = await res.json();

  return {
    props: {
      data,
    },
  };
}

export default function Home({ data }) {
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [shops, setShops] = useState([]);
  const [searchRadius, setSearchRadius] = useState('20'); // Changed to a string value

  const handleRadiusChange = (e) => {
    const newRadius = e.target.value;
    setSearchRadius(newRadius);
    setZoom(calculateZoom(newRadius));  // Add this to calculate the zoom level based on radius
  };

  const calculateZoom = (radius) => {
    // Add function to calculate the appropriate zoom level based on radius
    return Math.max(1, Math.min(20, Math.round(14 - Math.log(radius) / Math.LN2)));
  }

  const CustomGoogleMap = withScriptjs(
    withGoogleMap(props => (
      <GoogleMap
        defaultZoom={14}
        defaultCenter={{ lat: props.latitude, lng: props.longitude }}
        defaultOptions={{ disableDefaultUI: true }}
        zoom={props.zoom}
      >
        {props.markers.map((marker, index) => (
          <Marker key={index} position={{ lat: marker.lat, lng: marker.lng }} />
        ))}
      </GoogleMap>
    ))
  );

  const getMarkers = () => {
    return shops.map(shop => ({
      lat: parseFloat(shop.lat),
      lng: parseFloat(shop.lng)
    }));
  };

  // マップ上のマーカーの位置情報を取得
  const markers = getMarkers();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLatitude(latitude);
          setLongitude(longitude);
        },
        (error) => {
          console.error('位置情報の取得に失敗しました', error);
        }
      );
    } else {
      console.error('Geolocation APIがサポートされていません');
    }
  }, []);

  useEffect(() => {
    const fetchDataByLocation = async () => {
      try {
        if (latitude && longitude) {
          const response = await axios.get(`/api/hotpepper?lat=${latitude}&lng=${longitude}&range=${searchRadius}`);
          const data = response.data;
          const shopData = data.results.shop;
          setShops(shopData);
        }
      } catch (error) {
        console.error('ホットペッパーAPIからのデータ取得に失敗しました', error);
      }
    };

    fetchDataByLocation();
  }, [latitude, longitude, searchRadius]);
  
  const fetchData = async (lat, lng) => {
    try {
      const response = await axios.get(`/api/hotpepper?lat=${lat}&lng=${lng}`);
      const data = response.data;

      // レスポンスデータを適切に加工して状態を更新する処理を記述する
      const shopData = data.results.shop;
      setShops(shopData);
    } catch (error) {
      console.error('ホットペッパーAPIからのデータ取得に失敗しました', error);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLatitude(latitude);
          setLongitude(longitude);
          setCurrentLocation({ latitude, longitude }); // currentLocationの状態を更新する
        },
        (error) => {
          console.error('位置情報の取得に失敗しました', error);
        }
      );
    } else {
      console.error('Geolocation APIがサポートされていません');
    }
  }, []);

  const handlerOnSubmitSearch = async (e) => {
    e.preventDefault();
  
    const { currentTarget = {} } = e;
    const fields = Array.from(currentTarget?.elements);
    const fieldQuery = fields.find((field) => field.name === 'query');
  
    const value = fieldQuery.value || '';
    setKeyword(value);
  };

  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    if (keyword === '') return;

    const params = { keyword: keyword };
    const query = new URLSearchParams(params).toString();

    const request = async () => {
      const res = await fetch(`/api/search?${query}`);
      const data = await res.json();
      const nextData = data.results;

      updatePage({
        results_available: nextData.results_available,
        results_start: nextData.results_start,
      });

      updateShops(nextData.shop);
    };

    request();
  }, [keyword]);

  const [currentLocation, setCurrentLocation] = useState(null);

  const {
    results_available = 0,
    results_start = 1,
    shop: defaultShops = [],
    page: { results_returned: pageResultsReturned = 0 } = {},
  } = data.results;

  const [shop, updateShops] = useState([]);

  useEffect(() => {
    // ...
  
    const fetchData = async () => {
      try {
        if (latitude && longitude) { // latitudeとlongitudeが定義されていることを確認する
          const response = await axios.get(`/api/hotpepper?lat=${latitude}&lng=${longitude}&range=${searchRadius}`);
          const data = response.data;
  
          // レスポンスデータを適切に加工して状態を更新する処理を記述する
  
          // 例: レスポンスデータから店舗情報の配列を取得し、状態を更新する
          const shopData = data.results.shop;
          updateShops(shopData);
        }
      } catch (error) {
        console.error('ホットペッパーAPIからのデータ取得に失敗しました', error);
      }
    };
  
    fetchData();
  }, [latitude, longitude, searchRadius]);

  const [page, updatePage] = useState({
    results_available: results_available,
    results_start: results_start,
  });

  const handlerOnClickReadMore = () => {
    if (page.results_available <= page.results_start) return;

    updatePage((prev) => {
      return {
        ...prev,
        results_start: prev.results_start + 1,
      };
    });
  };

  return (
    <>
      <Head>
        <link href="http://fonts.googleapis.com/earlyaccess/notosansjp.css" rel="stylesheet" />
        <title>周辺レストラン検索</title>
      </Head>

      <div className="SearchFunc">
      <header>
          <div className="Search">
            <div className="STitle">
              <h2 className="Title">ホットペッパー周辺レストラン検索</h2>
            </div>
            <div className="SBox">
              <form onSubmit={handlerOnSubmitSearch} id="form" className="form">
                <input
                  type="text"
                  name="query"
                  className=""
                  placeholder="キーワードを入力して下さい"
                />
                <button type="submit" className=""></button>
              </form>
              <div className="SRange">
              <form action="" method="post" id="form" name = "local" class = "form">
                        
                        <select name="range" id = "date" >
                            <option disabled selected value></option>
                            
                            <option value="1">300m</option>
                            <option value="2">500m</option>
                            <option value="3">1000m</option>
                            <option value="4">2000m</option>
                            <option value="5">3000m</option>

                        </select>
                        <a href="javascript:local.submit()" class = "btn-circle-stitch search_btn1" id = "button1">検索</a>
                        <button type="submit" className=""></button>
                    </form>
              </div>
            </div>
          </div>
        </header>

<div className='main'>
  <div className='map'>
{currentLocation && (
          <CustomGoogleMap
            latitude={currentLocation.latitude}
            longitude={currentLocation.longitude}
            zoom={calculateZoom(searchRadius) + 5}
            markers={markers} // ここでマーカーの位置情報を渡す
            googleMapURL={`https://maps.googleapis.com/maps/api/js?key=AIzaSyDSy5S3DrBEROlYOy2otaCKQrJhYkWC9QM&libraries=places`}
            loadingElement={<div style={{ height: `100%` }} />}
            containerElement={<div style={{ height: `100vh` }} />}
            mapElement={<div style={{ height: `100%` }} />}
          />
        )}
        </div>

<div className="SRes">
<span>{page.results_available}</span> <span>件</span>
  <div className="carousel">
    {shop && shop.length > 0 ? (
      <div className="RList__viewport">
        {shop.map((item, index) => (
          <div key={index} className="RList__slide1">
            <Link href={item.urls.pc} passHref target="_blank" rel="noopener noreferrer">
              <div className="RBox">
                <div className="RBox1">
                  <img src={item.photo.mobile.s} alt={item.name} />
                </div>
                <div className="RBox2">
                  <div>
                  <h3>{item.name}</h3>
                    <div>
                      <span>{item.genre.name}</span>
                      <span>{item.catch}</span>
                    </div>
                    <p>{item.access}</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    ) : (
      <div></div>
    )}
  </div>
  {page.results_available > page.results_start && (
    <div className="">
      <button className="" onClick={handlerOnClickReadMore}>
        もっと読む
      </button>
    </div>
  )}
</div>

</div>

<footer>
Powered by <a href="http://webservice.recruit.co.jp/">ホットペッパー Webサービス</a>
</footer>
      </div>
    </>
  );
}