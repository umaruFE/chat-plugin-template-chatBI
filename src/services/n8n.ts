import { mockBIResult } from './mock';

// ✅ 核心修改：创建一个 Webhook URL 的映射表
const webhookUrlMap: Record<string, string> = {
  XQY: 'http://8.130.93.151:5678/webhook/4e2370bd-25b6-419d-856c-6c179fa17e3a',
  WL: 'http://8.130.93.151:5678/webhook/45df2d4e-71df-45d1-b0b3-801fb28d3304',
  GYL: 'http://8.130.93.151:5678/webhook/234d6bfa-a43d-4043-a4e0-09637679b971',
  SWZY: 'http://8.130.93.151:5678/webhook/d721eb7e-7fde-4fad-9e52-b5caa1763968',
  ZNZZ: 'http://8.130.93.151:5678/webhook/0ead941d-3313-4731-bd48-dae98ba9d65a',
};

export const fetchBIAnalysis = async (payload: any, webhookId?: string) => {
  if (!webhookId) {
    // eslint-disable-next-line no-console
    console.warn('⚠️ 未提供 webhookId，将返回 mock 数据。');
    return mockBIResult;
  }

  // ✅ 核心修改：从我们写死的映射表中查找 URL
  const webhookUrl = webhookUrlMap[webhookId];

  if (!webhookUrl) {
    // eslint-disable-next-line no-console
    console.warn(`⚠️ 未在映射表中找到 ID 为 "${webhookId}" 的 Webhook URL，将返回 mock 数据。`);
    return mockBIResult;
  }

  try {
    const sessionId = crypto.randomUUID();
    const body = {
      ...payload,
      sessionId: sessionId,
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`请求 n8n 失败, 状态码: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('调用 n8n 工作流时出错:', error);
    return {
      ...mockBIResult,
      error: '调用 n8n 失败，已使用 mock 数据代替。',
    };
  }
};
