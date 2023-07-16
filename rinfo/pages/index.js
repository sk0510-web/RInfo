import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Head from 'next/head'
import Link from 'next/link'

const API_KEY = '5e7653c1a566d6d9';
const defaultEndpoint = 'https://webservice.recruit.co.jp/hotpepper/gourmet/v1/?key=5e7653c1a566d6d9&format=json&large_area=Z011'

export async function getServerSideProps() {
  const res = await fetch(defaultEndpoint)
  const data = await res.json()

  return {
    props: {
      data,
    },
  }
}

export default function Home({ data }) {

  const {
    results_available = 0,
    results_start = 1,
    shop: defaultShops = [],
  } = data.results

  //取得した店舗データを格納
  const [shop, updateShops] = useState(defaultShops)

  //取得したページデータを格納
  const [page, updatePage] = useState({
    results_available: results_available,
    results_start: results_start,
  })

  // 開始位置の変更を監視
  useEffect(() => {
    if (page.results_start === 1) return

    const params = { start: page.results_start, keyword: keyword }
    const query = new URLSearchParams(params)

    const request = async () => {
      const res = await fetch(`/api/search?${query}`)
      const data = await res.json()
      const nextData = data.results

      updatePage({
        results_available: nextData.results_available,
        results_start: nextData.results_start,
      })

      if (nextData.results_start === 1) {
        updateShops(nextData.shop)
        return
      }

      updateShops((prev) => {
        return [...prev, ...nextData.shop]
      })
    }

    request()
  }, [page.results_start])


  // もっと読むボタンを押したときの処理
  const handlerOnClickReadMore = () => {
    if (page.results_returned <= page.results_start) return

    updatePage((prev) => {
      return {
        ...prev,
        results_start: prev.results_start + 1,
      }
    })
  }

// キーワードを格納
const [keyword, setKeyword] = useState('')

// キーワードの変更を監視
useEffect(() => {
  if (keyword === '') return

  const params = { keyword: keyword }
  const query = new URLSearchParams(params)

  // リクエスト、レスポンスの取得
  const request = async () => {
    const res = await fetch(`/api/search?${query}`)
    const data = await res.json()
    const nextData = data.results

    updatePage({
      results_available: nextData.results_available,
      results_start: nextData.results_start,
    })

    updateShops(nextData.shop)
  }

  request()
}, [keyword])

// 検索ボタン押下時の処理
const handlerOnSubmitSearch = (e) => {
  e.preventDefault()

  const { currentTarget = {} } = e
  const fields = Array.from(currentTarget?.elements)
  const fieldQuery = fields.find((field) => field.name === 'query')

  // keywordをセット
  const value = fieldQuery.value || ''
  setKeyword(value)
}

return (
  <>
    <Head>
      <title>東京グルメ店検索</title>
    </Head>
    <div className="max-w-3xl font-mono bg-gray-100 mx-auto">
      <div>
        <div className="text-2xl py-6 text-center">
          <h2 className="font-medium tracking-wider ">東京グルメ店検索</h2>
        </div>
        <div className="">
          <form onSubmit={handlerOnSubmitSearch} className="text-center">
            <input
              type="search"
              name="query"
              className="rounded py-2 px-4 text-left border-red-500"
              placeholder="キーワードを入力して下さい"
            />
            <button className="ml-2 text-white bg-red-500 rounded py-2 px-6 hover:opacity-75">
              Search
            </button>
          </form>
          <div className="text-sm pt-2 text-gray-600 text-center">
            <span>{page.results_available}</span> <span>件</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl font-mono bg-gray-100 mx-auto">
        <ul className="mx-4">
          {data.results.shop.map((item, index) => (
            <li
              key={index}
              className="my-4 bg-white rounded border-red-500 border-2"
            >
              <Link href={item.urls.pc}>
                <div className="grid grid-cols-10">
                  <div className="col-span-2 self-center">
                    <div>
                      <img src={item.photo.mobile.s} alt={item.name} />
                    </div>
                  </div>
                  <div className="ml-3 col-span-8">
                    <div className="text-lg mt-2 mr-2">{item.name}</div>
                    <div className="text-xs mt-2 mr-2 pb-2">
                      <div className="text-xs">
                        <span className="font-medium">{item.genre.name}</span>
                        <span className="ml-4">{item.catch}</span>
                      </div>
                      <p className="mt-1">{item.access}</p>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        {page.results_returned <= page.results_start ? (
          <div></div>
        ) : (
          <div className="text-center pt-4 pb-8">
            <button
              className="bg-red-500 rounded text-white tracking-wider font-medium hover:opacity-75 py-2 px-6 "
              onClick={handlerOnClickReadMore}
            >
              もっと読む
            </button>
          </div>
        )}
      </div>
    </div>
  </>
);
}