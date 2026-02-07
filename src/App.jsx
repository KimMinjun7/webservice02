import React, { useState, useCallback, useEffect } from 'react';
import './App.css';
import { analyzeFace } from './services/gemini';
import ApiKeyModal from './components/ApiKeyModal';
import DropZone from './components/DropZone';
import LoadingAnimation from './components/LoadingAnimation';
import ResultCard from './components/ResultCard';

const API_KEY_STORAGE = 'hf_token';

function getStoredKey() {
  return localStorage.getItem(API_KEY_STORAGE) || import.meta.env.VITE_HF_TOKEN || '';
}

function App() {
  const [apiKey, setApiKey] = useState(getStoredKey);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleApiKey = useCallback((key) => {
    localStorage.setItem(API_KEY_STORAGE, key);
    setApiKey(key);
  }, []);

  const handleImageSelect = useCallback((img) => {
    setImage(img);
    setResult(null);
    setError('');
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!image || !apiKey) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await analyzeFace(image.base64, image.mimeType, apiKey);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [image, apiKey]);

  const handleRetry = useCallback(() => {
    setImage(null);
    setResult(null);
    setError('');
  }, []);

  const handleShare = useCallback(async () => {
    if (!result) return;
    const text = `나의 닮은 동물은 ${result.emoji} ${result.animal}! (${result.matchPercent}% 닮음)\n${result.description}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'AI 닮은 동물 찾기', text });
      } catch {
        // user cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        alert('결과가 클립보드에 복사되었습니다!');
      } catch {
        alert('공유 기능을 사용할 수 없습니다.');
      }
    }
  }, [result]);

  const handleResetKey = useCallback(() => {
    localStorage.removeItem(API_KEY_STORAGE);
    setApiKey('');
  }, []);

  if (!apiKey) {
    return <ApiKeyModal onSubmit={handleApiKey} />;
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🐾 AI 닮은 동물 찾기</h1>
        <p>사진을 올리면 AI가 닮은 동물을 찾아줘요!</p>
      </header>

      <main className="main">
        {!result && !loading && (
          <>
            <DropZone onImageSelect={handleImageSelect} disabled={loading} />
            {image && (
              <div className="preview-section">
                <img src={image.dataUrl} alt="미리보기" className="preview-image" />
                <button className="analyze-button" onClick={handleAnalyze}>
                  🔍 닮은 동물 찾기!
                </button>
              </div>
            )}
          </>
        )}

        {loading && <LoadingAnimation />}

        {error && (
          <div className="error-box">
            <span className="error-icon">😿</span>
            <p>{error}</p>
            <button className="btn-retry" onClick={() => setError('')}>
              다시 시도
            </button>
          </div>
        )}

        {result && (
          <ResultCard
            result={result}
            imageUrl={image.dataUrl}
            onRetry={handleRetry}
            onShare={handleShare}
          />
        )}
      </main>

      <footer className="footer">
        <span>Powered by Qwen3-VL AI</span>
        <button className="footer-key-btn" onClick={handleResetKey}>
          🤗 토큰 변경
        </button>
      </footer>
    </div>
  );
}

export default App;
