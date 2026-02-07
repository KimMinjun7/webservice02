import React, { useState, useEffect } from 'react';

const MESSAGES = [
  '얼굴 특징을 분석하고 있어요...',
  '눈, 코, 입 모양을 살펴보는 중...',
  '동물 도감을 뒤적이고 있어요...',
  '닮은 동물을 찾았을지도?!',
  'AI가 열심히 비교하고 있어요...',
  '거의 다 됐어요! 조금만 기다려주세요...',
];

const PAWS = ['🐾', '🐾', '🐾', '🐾', '🐾'];

export default function LoadingAnimation() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading">
      <div className="loading-paws">
        {PAWS.map((paw, i) => (
          <span key={i} className="loading-paw" style={{ animationDelay: `${i * 0.2}s` }}>
            {paw}
          </span>
        ))}
      </div>
      <p className="loading-text">{MESSAGES[msgIndex]}</p>
    </div>
  );
}
