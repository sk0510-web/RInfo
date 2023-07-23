import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Head from 'next/head';
import Link from 'next/link';
import '../app/globals.css';
import { css } from '@emotion/react'
import { GoogleMap, withGoogleMap, withScriptjs, Marker, InfoWindow } from "react-google-maps";

const API_KEY = '5e7653c1a566d6d9';
const defaultEndpoint = `https://webservice.recruit.co.jp/hotpepper/gourmet/v1/?key=${API_KEY}&format=json`;

const CustomGoogleMap = withScriptjs(withGoogleMap(props => (
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
          <img src={props.markers[props.selectedMarker].photo.pc.l} onClick={() => detail(props.selectedMarker)} />
          <h3>{props.markers[props.selectedMarker].name}</h3>
          <h6>{props.markers[props.selectedMarker].genre.name}</h6>
          <h5>{props.markers[props.selectedMarker].genre.catch}</h5>
          <p>{props.markers[props.selectedMarker].catch}</p>
        </div>
      </InfoWindow>
    )}
  </GoogleMap>
)));

function shopMap(locations) {
  deleteMakers();
  locations.forEach(function (element, index) {
      var mapLatLng = new google.maps.LatLng(element['lat'], element['lng']);
      var marker = new google.maps.Marker({
          map: map,
          position: mapLatLng
      });
      marker_array.push(marker);

      // InfoWindowの内容を設定
      var box = '<div class="map_item">' +
          `<img src='${element['photo']['pc']['l']}' onclick='detail(${index})'>` +
          `<h3>${element['name']}</h3>` +
          `<h6>${element['genre']['name']}</h6>` +
          `<h5>${element['genre']['catch']}</h5>` +
          `<p>${element['catch']}</p>` +
          '</div>';

      var infowindow = new google.maps.InfoWindow({
          content: box
      });

      // マーカーをクリックした際にInfoWindowを表示するように設定
      marker.addListener('click', function () {
          infowindow.open(map, marker);
      });
  });
}

function data_display(data) {
  // 既存のコードをそのまま使用

  // 各店の詳細情報を取得して表示する
  data['shop'].forEach(function (element, index) {
      var child_div = document.createElement("div");
      child_div.setAttribute('onclick', `detail_close(${index})`);
      child_div.classList.add('popup');
      child_div.id = `shop-${index}`;
      var content = document.createElement("div");
      content.classList.add('content');

      var h3 = document.createElement("h3");
      h3.textContent = element['name'];
      content.appendChild(h3);

      var p = document.createElement("p");
      p.style.textAlign = "center";
      p.textContent = element['catch'];
      content.appendChild(p);

      var div = document.createElement("div");
      div.style.textAlign = "center";
      var img = document.createElement("img");
      img.setAttribute('src', element['photo']['pc']['l']);
      div.appendChild(img);
      content.appendChild(div);

      var detail_area = document.createElement("div");
      detail_area.classList.add('detail_area');

      var table = document.createElement("table");
      table.classList.add('detail_table');

      // その他の店の詳細情報をここで設定する（住所、営業時間、料金など）

      detail_area.appendChild(table);
      content.appendChild(detail_area);

      var close = document.createElement("a");
      close.classList.add('close');
      var icon = document.createElement("i");
      icon.classList.add('fas', 'fa-times-circle');
      close.appendChild(icon);
      close.setAttribute('href', `javascript: detail_close(${index})`);
      content.appendChild(close);

      child_div.appendChild(content);
      details.appendChild(child_div);
  });
}

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

  const handleMarkerClick = (index) => {
    setSelectedMarker(index);
  };

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

          setSearchResults(shopData);
        }
      } catch (error) {
        console.error('ホットペッパーAPIからのデータ取得に失敗しました', error);
      }
    };

    fetchDataByLocation();
  }, [latitude, longitude, searchRadius]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (latitude && longitude) {
          const response = await axios.get(`/api/hotpepper?lat=${latitude}&lng=${longitude}&range=${searchRadius}`);
          const data = response.data;
          const shopData = data.results.shop;
          updateShops(shopData);

          // ピンを表示するために、検索結果の店情報をsearchResultsにセットする
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
              <form action="" method="post" id="form" name = "local" class = "form">
                        
              <select name="range" id="date" value={searchRadius} onChange={handleRadiusChange}>
                      <option value="" disabled>選択してください</option>
                            
                            <option value="1">300m</option>
                            <option value="2">500m</option>
                            <option value="3">1000m</option>
                            <option value="4">3000m</option>

                        </select>
                        <a href="local.submit()" class = "btn-circle-stitch search_btn1" id = "button1">検索</a>
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
            <Link href={item.urls.pc} passHref target="_blank" rel="noopener noreferrer">
              <div className="RBox">
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
            </Link>
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