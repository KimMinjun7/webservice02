import React, { useState, useCallback, useEffect } from 'react';
import './App.css';
import { analyzeFace } from './services/gemini';
import DropZone from './components/DropZone';
import LoadingAnimation from './components/LoadingAnimation';
import ResultCard from './components/ResultCard';
import AdBanner from './components/AdBanner';
import AboutPage from './components/AboutPage';

function App() {
  const [route, setRoute] = useState(() => window.location.hash.replace('#', '') || '/');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [adRefresh, setAdRefresh] = useState(0);

  useEffect(() => {
    const onHashChange = () => {
      setRoute(window.location.hash.replace('#', '') || '/');
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const handleImageSelect = useCallback((img) => {
    setImage(img);
    setResult(null);
    setError('');
  }, []);

  const bumpAd = useCallback(() => {
    setAdRefresh((prev) => prev + 1);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!image) return;
    bumpAd();
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
  }, [image, bumpAd]);

  const handleRetry = useCallback(() => {
    setImage(null);
    setResult(null);
    setError('');
    bumpAd();
  }, [bumpAd]);

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
        <div className="header-row">
          <h1 className="title">AI 닮은 동물 찾기</h1>
          <nav className="nav">
            <a className={`nav-link ${route === '/' ? 'active' : ''}`} href="#/">홈</a>
            <a className={`nav-link ${route === '/about' ? 'active' : ''}`} href="#/about">소개</a>
          </nav>
        </div>
        <p className="subtitle">사진 한 장으로 분위기와 표정을 읽고 닮은 동물을 찾아드려요.</p>
        <div className="meta">
          <span className="meta-chip">1. 사진 업로드</span>
          <span className="meta-chip">2. AI 분석</span>
          <span className="meta-chip">3. 결과 공유</span>
        </div>
      </header>

      <main className="main">
        {route === '/about' && (
          <section className="panel">
            <AboutPage />
          </section>
        )}

        {route === '/' && !result && !loading && (
          <section className="panel">
            <DropZone onImageSelect={handleImageSelect} disabled={loading} />
            <div className="privacy-note">
              <span className="privacy-icon" aria-hidden="true">🔒</span>
              <div>
                <strong>사진은 저장되지 않습니다.</strong>
                <p>업로드한 이미지는 분석에만 사용되며 영구 저장하지 않습니다.</p>
              </div>
            </div>
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

        {route === '/' && loading && (
          <section className="panel panel--center">
            <LoadingAnimation />
          </section>
        )}

        {route === '/' && error && (
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

        {route === '/' && result && (
          <section className="panel">
            <ResultCard
              result={result}
              imageUrl={image.dataUrl}
              onRetry={handleRetry}
              onShare={handleShare}
            />
          </section>
        )}

        {route === '/' && <AdBanner refreshKey={adRefresh} />}
      </main>

      <footer className="footer">
        <div className="footer-copy">
          <span>Powered by Qwen3-VL AI</span>
          <span className="footer-disclaimer">면책 조항: 업로드한 사진은 분석에만 사용되며 저장·공유되지 않고, 분석 결과는 참고용으로 결과에 책임지지 않습니다.</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
