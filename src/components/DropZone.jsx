import React, { useState, useRef, useCallback } from 'react';

const MAX_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_DIMENSION = 1280;
const OUTPUT_QUALITY = 0.86;
const MAX_PAYLOAD_BYTES = 1.5 * 1024 * 1024; // base64 payload limit guard

export default function DropZone({ onImageSelect, disabled }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const resizeImage = useCallback((dataUrl) => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const { width, height } = img;
      let scale = Math.min(1, MAX_DIMENSION / Math.max(width, height));
      let quality = OUTPUT_QUALITY;
      const outputType = 'image/jpeg';

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('이미지를 처리할 수 없습니다.'));
        return;
      }

      const render = () => {
        const targetWidth = Math.max(1, Math.round(width * scale));
        const targetHeight = Math.max(1, Math.round(height * scale));
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        ctx.clearRect(0, 0, targetWidth, targetHeight);
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        return canvas.toDataURL(outputType, quality);
      };

      let resizedDataUrl = render();
      let estimatedBytes = Math.floor((resizedDataUrl.length - 22) * 3 / 4);
      let attempts = 0;

      while (estimatedBytes > MAX_PAYLOAD_BYTES && attempts < 6) {
        scale *= 0.85;
        quality = Math.max(0.6, quality * 0.9);
        resizedDataUrl = render();
        estimatedBytes = Math.floor((resizedDataUrl.length - 22) * 3 / 4);
        attempts += 1;
      }

      if (estimatedBytes > MAX_PAYLOAD_BYTES) {
        reject(new Error('이미지 용량이 너무 커서 처리할 수 없습니다. 더 작은 사진으로 시도해주세요.'));
        return;
      }

      resolve({ resizedDataUrl, outputType });
    };
    img.onerror = () => reject(new Error('이미지를 읽을 수 없습니다.'));
    img.src = dataUrl;
  }), []);

  const processFile = useCallback(async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }
    if (file.size > MAX_SIZE) {
      alert('파일 크기가 너무 큽니다. 20MB 이하로 올려주세요.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const dataUrl = reader.result;
        const { resizedDataUrl, outputType } = await resizeImage(dataUrl);
        const base64 = resizedDataUrl.split(',')[1];
        onImageSelect({ dataUrl: resizedDataUrl, base64, mimeType: outputType });
      } catch (err) {
        alert(err.message || '이미지 처리 중 오류가 발생했습니다.');
      }
    };
    reader.readAsDataURL(file);
  }, [onImageSelect, resizeImage]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    processFile(file);
  }, [disabled, processFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    if (!disabled) setDragOver(true);
  }, [disabled]);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleClick = useCallback(() => {
    if (!disabled) inputRef.current?.click();
  }, [disabled]);

  const handleChange = useCallback((e) => {
    processFile(e.target.files[0]);
    e.target.value = '';
  }, [processFile]);

  return (
    <div
      className={`dropzone ${dragOver ? 'dropzone--active' : ''} ${disabled ? 'dropzone--disabled' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        hidden
      />
      <div className="dropzone-icon">📸</div>
      <p className="dropzone-text">
        사진을 드래그하거나<br />
        <span>클릭하여 업로드</span>
      </p>
      <p className="dropzone-hint">JPG, PNG, WEBP (최대 20MB, 자동 최적화)</p>
    </div>
  );
}
