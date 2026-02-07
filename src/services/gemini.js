function mapError(status, message) {
  if (status === 401 || status === 403) {
    return 'HuggingFace 토큰이 유효하지 않습니다. 토큰을 확인해주세요.';
  }
  if (status === 422) {
    return '이미지를 처리할 수 없습니다. 다른 사진으로 시도해주세요.';
  }
  if (status === 429) {
    return '요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.';
  }
  if (status === 503) {
    return '모델을 로딩 중입니다. 20~30초 후 다시 시도해주세요.';
  }
  if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
    return '네트워크 연결을 확인해주세요.';
  }
  return `분석 중 오류가 발생했습니다: ${message || '알 수 없는 오류'}`;
}

export async function analyzeFace(base64Data, mimeType) {
  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageBase64: base64Data,
        mimeType,
      }),
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      const message = errorBody?.error || '';
      throw new Error(mapError(res.status, message));
    }

    return await res.json();
  } catch (error) {
    if (error.message.includes('분석') || error.message.includes('토큰') ||
        error.message.includes('요청') || error.message.includes('모델') ||
        error.message.includes('네트워크') || error.message.includes('이미지') ||
        error.message.includes('AI')) {
      throw error;
    }
    throw new Error(mapError(0, error.message));
  }
}
