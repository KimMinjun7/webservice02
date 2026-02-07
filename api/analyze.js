const API_URL =
  'https://router.huggingface.co/hf-inference/models/Qwen/Qwen3-VL-8B-Instruct/v1/chat/completions';

const PROMPT = `You are an expert at finding animal look-alikes for human faces. Analyze this person's photo and determine which animal they resemble the most.

Consider facial features like:
- Face shape, eye shape/size, nose shape
- Expression, overall vibe/energy
- Hair style/color if visible

Respond ONLY with valid JSON (no markdown fences, no extra text) in this exact format:
{
  "animal": "동물 이름 (한국어)",
  "animalEn": "Animal name (English)",
  "emoji": "single emoji of the animal",
  "matchPercent": 85,
  "description": "2-3 sentences in Korean explaining WHY this person looks like this animal. Be specific about which facial features match. Make it fun and complimentary.",
  "traits": ["특성1", "특성2", "특성3"]
}

Rules:
- matchPercent should be between 70 and 97
- traits should be 3 Korean words/short phrases that describe shared characteristics
- Be creative and fun, but also specific about the resemblance
- Always be positive and complimentary
- Do NOT wrap your response in markdown code fences
- Output ONLY the JSON object, nothing else`;

function parseResponse(text) {
  let cleaned = text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // ignore
  }

  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch {
      // ignore
    }
  }

  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      // ignore
    }
  }

  throw new Error('AI 응답을 파싱할 수 없습니다. 다시 시도해주세요.');
}

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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const token = process.env.HF_TOKEN;
  if (!token) {
    res.status(500).json({ error: 'HF_TOKEN이 설정되지 않았습니다.' });
    return;
  }

  const { imageBase64, mimeType } = req.body || {};
  if (!imageBase64 || !mimeType) {
    res.status(400).json({ error: '이미지 데이터가 없습니다.' });
    return;
  }

  const dataUrl = `data:${mimeType};base64,${imageBase64}`;

  try {
    const hfRes = await fetch(API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'Qwen/Qwen3-VL-8B-Instruct',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: dataUrl } },
              { type: 'text', text: PROMPT },
            ],
          },
        ],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!hfRes.ok) {
      const errorBody = await hfRes.text().catch(() => '');
      res.status(hfRes.status).json({ error: mapError(hfRes.status, errorBody) });
      return;
    }

    const data = await hfRes.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) {
      res.status(502).json({ error: 'AI로부터 응답을 받지 못했습니다. 다시 시도해주세요.' });
      return;
    }

    const parsed = parseResponse(text);
    res.status(200).json(parsed);
  } catch (err) {
    res.status(500).json({ error: mapError(0, err?.message || '') });
  }
}
