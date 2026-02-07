import React, { useEffect, useRef, useState } from 'react';

export default function AdBanner() {
  const pushedRef = useRef(false);
  const slotRef = useRef(null);
  const [status, setStatus] = useState('pending');

  useEffect(() => {
    if (pushedRef.current) return;
    try {
      // eslint-disable-next-line no-undef
      (adsbygoogle = window.adsbygoogle || []).push({});
      pushedRef.current = true;
    } catch {
      // ignore ad errors
    }
  }, []);

  useEffect(() => {
    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      const status = slotRef.current?.getAttribute('data-ad-status');
      if (status === 'filled') {
        setStatus('filled');
        clearInterval(timer);
      } else if (status === 'unfilled') {
        setStatus('unfilled');
        clearInterval(timer);
      } else if (attempts >= 6) {
        setStatus('unfilled');
        clearInterval(timer);
      }
    }, 500);
    return () => clearInterval(timer);
  }, []);

  if (status === 'unfilled') return null;

  return (
    <section
      className={`panel panel--ad ${status === 'pending' ? 'panel--ad-pending' : ''}`}
      aria-label="광고"
    >
      <div className="ad-wrap">
        <ins
          ref={slotRef}
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-1414505025330459"
          data-ad-slot="8632302781"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </section>
  );
}
