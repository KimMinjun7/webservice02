import React, { useState, useCallback } from 'react';
import './App.css';
import { analyzeFace } from './services/gemini';
import DropZone from './components/DropZone';
import LoadingAnimation from './components/LoadingAnimation';
import ResultCard from './components/ResultCard';

function App() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleImageSelect = useCallback((img) => {
    setImage(img);
    setResult(null);
    setError('');
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!image) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await analyzeFace(image.base64, image.mimeType);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [image]);

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

  return (
    <div className="app">
      <div className="bg-orb bg-orb--one" aria-hidden="true" />
      <div className="bg-orb bg-orb--two" aria-hidden="true" />
      <div className="bg-orb bg-orb--three" aria-hidden="true" />
      <header className="header">
        <span className="badge">AI VISUAL MATCH</span>
        <h1 className="title">AI 닮은 동물 찾기</h1>
        <p className="subtitle">사진 한 장으로 분위기와 표정을 읽고 닮은 동물을 찾아드려요.</p>
        <div className="meta">
          <span className="meta-chip">1. 사진 업로드</span>
          <span className="meta-chip">2. AI 분석</span>
          <span className="meta-chip">3. 결과 공유</span>
        </div>
      </header>

      <main className="main">
        {!result && !loading && (
          <section className="panel">
            <DropZone onImageSelect={handleImageSelect} disabled={loading} />
            {image && (
              <div className="preview-section">
                <img src={image.dataUrl} alt="미리보기" className="preview-image" />
                <button className="analyze-button" onClick={handleAnalyze}>
                  🔍 닮은 동물 찾기!
                </button>
              </div>
            )}
          </section>
        )}

        {loading && (
          <section className="panel panel--center">
            <LoadingAnimation />
          </section>
        )}

        {error && (
          <section className="panel panel--center">
            <div className="error-box">
              <span className="error-icon">😿</span>
              <p>{error}</p>
              <button className="btn-retry" onClick={() => setError('')}>
                다시 시도
              </button>
            </div>
          </section>
        )}

        {result && (
          <section className="panel">
            <ResultCard
              result={result}
              imageUrl={image.dataUrl}
              onRetry={handleRetry}
              onShare={handleShare}
            />
          </section>
        )}
      </main>

      <footer className="footer">
        <span>Powered by Qwen3-VL AI</span>
      </footer>
    </div>
  );
}

export default App;
