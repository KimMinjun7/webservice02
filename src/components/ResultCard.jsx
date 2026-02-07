import React from 'react';

export default function ResultCard({ result, imageUrl, onRetry, onShare }) {
  return (
    <div className="result-card">
      <div className="result-card-photo">
        <img src={imageUrl} alt="내 사진" className="result-my-photo" />
      </div>
      <div className="result-emoji">{result.emoji}</div>
      <h2 className="result-animal">{result.animal}</h2>
      <div className="result-match">
        <div className="result-match-bar">
          <div
            className="result-match-fill"
            style={{ width: `${result.matchPercent}%` }}
          />
        </div>
        <span className="result-match-text">{result.matchPercent}% 닮음</span>
      </div>
      <p className="result-description">{result.description}</p>
      <div className="result-traits">
        {result.traits?.map((trait, i) => (
          <span key={i} className="result-trait">{trait}</span>
        ))}
      </div>
      <div className="result-actions">
        <button className="btn-retry" onClick={onRetry}>
          다시 해보기
        </button>
        <button className="btn-share" onClick={onShare}>
          📤 공유하기
        </button>
      </div>
    </div>
  );
}
