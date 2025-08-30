import { v4 as uuidv4 } from 'uuid';

// 1. 引入 uuid 库
import { mockBIResult } from './mock';

// ... webhookUrlMap 保持不变 ...
const webhookUrlMap: Record<string, string> = {
  XQY: 'https://guixu.chat/n8n/webhook/4e2370bd-25b6-41d-856c-6c179fa17e3a',
  WL: 'https://guixu.chat/n8n/webhook/45df2d4e-71df-45d1-b0b3-801fb28d3304',
  GYL: 'https://guixu.chat/n8n/webhook/234d6bfa-a43d-4043-a4e0-09637679b971',
  SWZY: 'https://guixu.chat/n8n/webhook/d721eb7e-7fde-4fad-9e52-b5caa1763968',
  ZNZZ: 'https://guixu.chat/n8n/webhook/0ead941d-3313-4731-bd48-dae98ba9d65a',
};

export const fetchBIAnalysis = async (payload: any, webhookId?: string) => {
  if (!webhookId) {
    // eslint-disable-next-line no-console
    console.warn('⚠️ 未提供 webhookId，将返回 mock 数据。');
    return mockBIResult;
  }

  const webhookUrl = webhookUrlMap[webhookId];

  if (!webhookUrl) {
    // eslint-disable-next-line no-console
    console.warn(`⚠️ 未在映射表中找到 ID 为 "${webhookId}" 的 Webhook URL，将返回 mock 数据。`);
    return mockBIResult;
  }

  try {
    // 2. 核心修复：使用 uuid 库生成唯一 ID
    const sessionId = uuidv4();
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
