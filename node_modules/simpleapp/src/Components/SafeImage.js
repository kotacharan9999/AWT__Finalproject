import React, { useEffect, useMemo, useState } from 'react';

const escapeSvg = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const buildInlineFallback = (label = 'ShopPlus Product') => {
  const safeLabel = escapeSvg(label).slice(0, 28);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1d4ed8" />
          <stop offset="100%" stop-color="#0f172a" />
        </linearGradient>
      </defs>
      <rect width="320" height="320" rx="28" fill="url(#bg)" />
      <circle cx="160" cy="118" r="52" fill="rgba(255,255,255,0.14)" />
      <rect x="76" y="188" width="168" height="18" rx="9" fill="rgba(255,255,255,0.18)" />
      <rect x="100" y="216" width="120" height="14" rx="7" fill="rgba(255,255,255,0.12)" />
      <text x="160" y="280" fill="#ffffff" font-family="Arial, sans-serif" font-size="18" font-weight="700" text-anchor="middle">${safeLabel}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const SafeImage = ({ src, alt, productId, ...props }) => {
  const productFallback = useMemo(
    () => (productId ? `/api/products/${productId}/image` : ''),
    [productId]
  );
  const inlineFallback = useMemo(() => buildInlineFallback(alt), [alt]);
  const [currentSrc, setCurrentSrc] = useState(src || productFallback || inlineFallback);
  const [usedProductFallback, setUsedProductFallback] = useState(false);

  useEffect(() => {
    setCurrentSrc(src || productFallback || inlineFallback);
    setUsedProductFallback(false);
  }, [src, productFallback, inlineFallback]);

  const handleError = () => {
    if (!usedProductFallback && productFallback && currentSrc !== productFallback) {
      setCurrentSrc(productFallback);
      setUsedProductFallback(true);
      return;
    }

    if (currentSrc !== inlineFallback) {
      setCurrentSrc(inlineFallback);
    }
  };

  return <img {...props} src={currentSrc} alt={alt} onError={handleError} />;
};

export default SafeImage;
