import React, { useState } from 'react';

export default function ApiKeyModal({ onSubmit }) {
  const [key, setKey] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = key.trim();
    if (trimmed) {
      onSubmit(trimmed);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-emoji">🤗</div>
        <h2>HuggingFace 토큰을 입력해주세요</h2>
        <p className="modal-desc">
          Qwen3-VL AI 모델을 사용하기 위해<br />
          HuggingFace 토큰이 필요합니다.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="hf_..."
            className="modal-input"
            autoFocus
          />
          <button type="submit" className="modal-button" disabled={!key.trim()}>
            시작하기
          </button>
        </form>
        <a
          href="https://huggingface.co/settings/tokens"
          target="_blank"
          rel="noopener noreferrer"
          className="modal-link"
        >
          HuggingFace에서 무료 토큰 발급받기 →
        </a>
      </div>
    </div>
  );
}
