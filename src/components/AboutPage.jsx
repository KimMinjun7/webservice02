import React from 'react';

export default function AboutPage() {
  return (
    <div className="about">
      <span className="about-kicker">서비스 소개</span>
      <h2 className="about-title">AI 닮은 동물 찾기</h2>
      <p className="about-lead">
        한 장의 사진으로 얼굴의 분위기와 특징을 분석해 닮은 동물을 재미있게 제안합니다.
        결과는 엔터테인먼트 목적의 참고용이며, 결과를 책임지지 않습니다.
      </p>

      <div className="about-section">
        <h3>사용 방법</h3>
        <p>1. 사진을 업로드합니다.</p>
        <p>2. AI가 분석을 완료하면 결과가 표시됩니다.</p>
        <p>3. 결과를 공유하거나 다시 시도할 수 있습니다.</p>
      </div>

      <div className="about-section">
        <h3>개인정보 안내</h3>
        <p>업로드한 사진은 분석에만 사용되며, 영구 저장되지 않습니다.</p>
      </div>

      <div className="about-section">
        <h3>문의</h3>
        <p>문의가 필요하면 아래 메일로 연락해주세요.</p>
        <p className="about-email">rla1576@naver.com</p>
      </div>
    </div>
  );
}
