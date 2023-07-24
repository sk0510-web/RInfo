import React, { useState } from 'react';
import Modal from './Modal'; // Modalコンポーネントのファイルパスを適切に修正

export default function App() {
  // trueになればmodal表示
  const [modalFlg, setFlg] = useState(false);
  // 選択確定のタグ
  const [selectTag, setTag] = useState([]);

  // Modalに渡すpropsをまとめる
  const props = {
    modalFlg,
    setFlg,
    selectTag,
    setTag
  };

  return (
    <>
      <div style={{ textAlign: 'center' }}>
        <Modal {...props} /> {/* Modalコンポーネントの呼び出し */}
        <button onClick={() => setFlg((flg) => !flg)}>modal Open!</button>
        <button onClick={() => setTag([])}>clear</button>
        {selectTag.length !== 0 ? (
          selectTag.map((tag) => <div key={tag}>{tag}</div>) // keyを追加
        ) : (
          <></>
        )}
      </div>
    </>
  );
}