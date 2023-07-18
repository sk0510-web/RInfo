import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Head from 'next/head';
import Link from 'next/link';
import '../app/globals.css';

const API_KEY = '5e7653c1a566d6d9';
const defaultEndpoint = `https://webservice.recruit.co.jp/hotpepper/gourmet/v1/?key=${API_KEY}&format=json`;

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
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchData(latitude, longitude); // fetchDataをコールバック内で呼び出す
        },
        (error) => {
          console.error('位置情報の取得に失敗しました', error);
        }
      );
    } else {
      console.error('Geolocation APIがサポートされていません');
    }
  }, []);
  
  const fetchData = async (latitude, longitude) => {
    try {
      const url = `https://webservice.recruit.co.jp/hotpepper/gourmet/v1/?key=5e7653c1a566d6d9&format=json&lat=${latitude}&lng=${longitude}`;
      const response = await fetch(url);
      const data = await response.json();
      // レスポンスデータの処理
    } catch (error) {
      console.error('ホットペッパーAPIからのデータ取得に失敗しました', error);
    }
  };

  const handlerOnSubmitSearch = async (e) => {
    e.preventDefault();
  
    const { currentTarget = {} } = e;
    const fields = Array.from(currentTarget?.elements);
    const fieldQuery = fields.find((field) => field.name === 'query');
  
    const value = fieldQuery.value || '';
    setKeyword(value);
  
    if (value !== '') {
      try {
        const res = await fetch(`/api/search?keyword=${encodeURIComponent(value)}`);
        const data = await res.json();
  
        updateShops(data.results.shop);
        updatePage({
          results_available: data.results.results_available,
          results_start: data.results.results_start,
        });
      } catch (error) {
        console.error('検索エラー:', error);
      }
    }
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
        const response = await axios.get(`/api/hotpepper?lat=${latitude}&lng=${longitude}`);
        const data = response.data;
  
        // レスポンスデータを適切に加工して状態を更新する処理を記述する
  
        // 例: レスポンスデータから店舗情報の配列を取得し、状態を更新する
        const shopData = data.results.shop;
        updateShops(shopData);
      } catch (error) {
        console.error('ホットペッパーAPIからのデータ取得に失敗しました', error);
      }
    };
  
    fetchData();
  }, []);

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
        <title>東京グルメ店検索</title>
      </Head>

      <div className="SearchFunc">
        <header>
          <div className="Search">
            <div className="STitle">
              <h2 className="Title">東京グルメ店検索</h2>
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
              <div className="SRNum">
                <span>{page.results_available}</span> <span>件</span>
              </div>
            </div>
          </div>
        </header>

          {currentLocation && (
            <div className="map">
              <iframe
                src={`https://maps.google.com/maps?q=${currentLocation.latitude},${currentLocation.longitude}&output=embed`}
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                allowFullScreen=""
                aria-hidden="false"
                tabIndex="0"
              ></iframe>
            </div>
          )}

<section className="SRes" aria-label="Gallery">
  <div className="carousel">
    {shop && shop.length > 0 ? (
      <div className="RList__viewport">
        {shop.map((item, index) => (
          <div key={index} className="RList__slide1">
            <Link href={item.urls.pc}>
              <div className="RBox">
                <div className="RBox1">
                  <img src={item.photo.mobile.s} alt={item.name} />
                  <h3>{item.name}</h3>
                </div>
                <div className="RBox2">
                  <div>
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
</section>
      </div>
    </>
  );
}