import { css } from '@emotion/react';
import Link from 'next/link';
import '../app/globals.css';

const modalContentStyles = {
  zIndex: 999,
  /* 定位置 */
  position: 'fixed',
  top: 0,
  left: 0,
  /* フルスクリーン */
  width: '100vw',
  height: '100vh',
  background: 'rgba(0, 0, 0, 0.15)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'default',
};

const closeButtonStyles = {
    position: 'relative',
    top: '-250px',
    right: '0px',
    cursor: 'pointer',
    fontsize: '50px',
    color: 'white',
  };

const imgStyles = {
    position: 'relative',
    right: 'calc(-20%)',
    border: '5px solid #FFF',
    boxshadow: '0 0 5px #999', // Add border radius to make the border corners rounded
    maxWidth: '100%', // Ensure the image doesn't exceed its container's width
  };

const modalStyles = {
  /* モーダルのスタイルを記述 */
  /* 例: ボーダーや背景色など */
  position: 'relative',
  background: 'rgba(255, 255, 255, 0.15)', /* Example: Set the background color to white */
  padding: '200px',
  color: 'White',
};

const Modal = ({ modalOpen, handleModalClose, modalData }) => {
    // modalDataがnullの場合は何も表示しない
console.log(modalData);
    
    if (!modalData) {
      return null;
    }
  
    // ホットペッパーAPIから取得した店の情報を取り出す
    const { photo, name, genre, open, budget, access, urls } = modalData;
    return (
      <>
        {modalOpen && (
          <div crassName="Modal" style={modalContentStyles} onClick={handleModalClose}>
            <div style={modalStyles} onClick={(e) => e.stopPropagation()}>
              {/* モーダルウィンドウの内容を記述 */}
              <span style={closeButtonStyles} onClick={handleModalClose}>×</span>
              {/* photoがnullでない場合のみ画像を表示 */}
              {photo && photo.pc && photo.pc.l ? (
            <img src={photo.pc.l} alt={name} style={imgStyles}/>
          ) : null}
              <h2>{name}</h2>
              {/* genreがnullでない場合のみ表示 */}
              <h3>{genre.name}</h3>
              {/* openがnullでない場合のみ表示 */}
              <br></br>{open && <p>営業時間：{open}</p>}
              {/* budgetがnullでない場合のみ表示 */}
              <br></br>{budget && budget.name && <p>平均価格：{budget.name}</p>}
              {/* accessがnullでない場合のみ表示 */}
              <br></br>{access && <p>アクセス：{access}</p>}
              {/* urlsがnullでない場合のみ表示 */}
              {urls && <a href={urls.pc} target="_blank" rel="noopener noreferrer">▷予約はこちらから◁</a>}
            </div>
          </div>
        )}
      </>
    );
  };
  
  export default Modal;