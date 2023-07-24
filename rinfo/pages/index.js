import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Head from 'next/head';
import Link from 'next/link';
import '../app/globals.css';
import { css } from '@emotion/react'
import Modal from '../app/Modal';
import { GoogleMap, withGoogleMap, withScriptjs, Marker, InfoWindow } from "react-google-maps";

const API_KEY = '5e7653c1a566d6d9';
const defaultEndpoint = `https://webservice.recruit.co.jp/hotpepper/gourmet/v1/?key=${API_KEY}&format=json`;

const CustomGoogleMapComponent = withScriptjs(
  withGoogleMap(props => (
    <GoogleMap
      defaultZoom={14}
      defaultCenter={{ lat: props.latitude, lng: props.longitude }}
      defaultOptions={{ disableDefaultUI: true }}
      zoom={props.zoom}
    >
      {props.markers.map((marker, index) => (
        <Marker key={index} position={{ lat: marker.lat, lng: marker.lng }} onClick={() => props.onMarkerClick(index)} />
      ))}
      {props.selectedMarker !== null && (
        <InfoWindow
          position={{ lat: props.markers[props.selectedMarker].lat, lng: props.markers[props.selectedMarker].lng }}
          onCloseClick={() => props.onMarkerClick(null)}
        >
          <div className="map_item">
            <img src={props.markers[props.selectedMarker].photo.pc.l} onClick={() => handleMarkerClick(props.selectedMarker)} />
            <h3>{props.markers[props.selectedMarker].name}</h3>
            <h6>{props.markers[props.selectedMarker].genre.name}</h6>
            <h5>{props.markers[props.selectedMarker].genre.catch}</h5>
            <p>{props.markers[props.selectedMarker].catch}</p>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  ))
);

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
  const [searchResults, setSearchResults] = useState([]);
  const [zoom, setZoom] = useState(14);
  const [selectedMarker, setSelectedMarker] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

  const setSelectedModalData = (data) => {
    setModalData(data);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleModalOpen = (item) => {
    if (item) {
      setSelectedModalData(item);
      setModalOpen(true);
    }
  };
  
  const handleMarkerClick = (index) => {
    props.onMarkerClick(index);
    // クリックされたマーカーに対応する店舗情報を取得
    const selectedShop = shop[index];
    setSelectedModalData(selectedShop); // モーダルに店舗情報をセット
  };
  
  const handleRadiusChange = (e) => {
    const newRadius = parseInt(e.target.value, 10); // Parse the selected value as a number
    setSearchRadius(newRadius);
    setZoom(calculateZoom(newRadius));
  };

  const calculateZoom = (radius) => {
    return Math.max(1, Math.min(20, Math.round(14 - Math.log(radius) / Math.LN2)));
  };

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

  const markers = searchResults.map(item => ({
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lng)
  }));


  useEffect(() => {
    const fetchData = async () => {
      try {
        if (latitude && longitude) {
          const response = await axios.get(
            `/api/hotpepper?lat=${latitude}&lng=${longitude}&range=${searchRadius}`
          );
          const data = response.data;
          const shopData = data.results.shop;
          updateShops(shopData);

          // Update the markers based on the new search results
          setSearchResults(shopData);
        }
      } catch (error) {
        console.error('ホットペッパーAPIからのデータ取得に失敗しました', error);
      }
    };

    fetchData();
  }, [latitude, longitude, searchRadius]);

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
        if (latitude && longitude) {
          const response = await axios.get(`/api/hotpepper?lat=${latitude}&lng=${longitude}&range=${searchRadius}`);
          const data = response.data;
          const shopData = data.results.shop;
          updateShops(shopData);
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
              <div className='credit'>
              Powered by <br></br><a href="http://webservice.recruit.co.jp/">ホットペッパー Webサービス</a>
              </div>
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
              <form action="" method="post" id="form" name = "local" className = "form">
                        
              <select name="range" id="date" value={searchRadius} onChange={handleRadiusChange}>
                      <option value="" disabled>検索範囲(m)</option>
                            
                            <option value={5}>500m</option>
                            <option value={10}>1000m</option>
                            <option value={20}>1500m</option>
                            <option value={30}>3000m</option>

                        </select>
                        <button type="submit" className=""></button>
                    </form>
              </div>
            </div>
          </div>
        </header>

<main>
  <div className='map'>
  {currentLocation && (
              <CustomGoogleMap
                latitude={currentLocation.latitude}
                longitude={currentLocation.longitude}
                zoom={calculateZoom(searchRadius) + 5}
                markers={searchResults} // ここでマーカーの位置情報を渡す
                selectedMarker={selectedMarker} // 選択されたマーカーのインデックスを渡す
                onMarkerClick={handleMarkerClick} // マーカークリック時のハンドラーを渡す
                googleMapURL={`https://maps.googleapis.com/maps/api/js?key=AIzaSyCJNPlapAMB7Fg3udUECkCvphXmJrKViKM&libraries=places`}
                loadingElement={<div style={{ height: `100%` }} />}
                containerElement={<div style={{ height: `100vh` }} />}
                mapElement={<div style={{ height: `100%` }} />}
              />
            )}
        </div>

<div className="SRes">
  <div className="carousel">
    <h2>検索結果一覧</h2><br></br>
    {shop && shop.length > 0 ? (
      <div className="RList__viewport">
        {shop.map((item, index) => (
          <div key={index} className="RList__slide1">
              <div className="RBox" onClick={() => handleModalOpen(item)}>
              <Modal modalOpen={modalOpen} handleModalClose={handleModalClose} modalData={modalData} />
                <div className="RBox1">
                  <img src={item.photo.mobile.s} alt={item.name} />
                </div>
                <div className="RBox2">
                  <div>
                  <h3>{item.name}</h3>
                    <div className='detail'>
                      <span>{item.genre.name}</span>
                      <span>{item.catch}</span>
                    </div>
                    <p>{item.access}</p>
                  </div>
                </div>
              </div>
          
          </div>
        ))}
      </div>
    ) : (
      <div></div>
    )}
  </div>
</div>
</main>
      </div>
    </>
  );
}