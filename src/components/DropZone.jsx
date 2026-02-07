import React, { useState, useRef, useCallback } from 'react';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export default function DropZone({ onImageSelect, disabled }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const processFile = useCallback((file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }
    if (file.size > MAX_SIZE) {
      alert('파일 크기는 5MB 이하만 가능합니다.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result;
      const base64 = dataUrl.split(',')[1];
      onImageSelect({ dataUrl, base64, mimeType: file.type });
    };
    reader.readAsDataURL(file);
  }, [onImageSelect]);

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
      <p className="dropzone-hint">JPG, PNG, WEBP (최대 5MB)</p>
    </div>
  );
}
