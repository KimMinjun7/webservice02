import React, { useEffect, useRef } from 'react';

export default function AdBanner() {
  const pushedRef = useRef(false);

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

  return (
    <div className="ad-wrap" aria-label="광고">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-1414505025330459"
        data-ad-slot="8632302781"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
