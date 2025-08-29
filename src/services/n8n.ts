// 文件路径: src/services/n8n.ts
import { mockBIResult } from './mock';

const N8N_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || '';

export const fetchBIAnalysis = async (payload: any) => {
  if (!N8N_WEBHOOK_URL.startsWith('http')) {
    // ✅ 修复：移除了 console.warn
    return mockBIResult;
  }

  try {
    const sessionId = crypto.randomUUID();
    const body = {
      ...payload,
      sessionId: sessionId,
    };

    // ✅ 修复：移除了 console.log
    const response = await fetch(N8N_WEBHOOK_URL, {
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
    // ✅ 修复：移除了 console.log
    return result;
  } catch (error) {
    // ✅ 修复：移除了 console.error
    return {
      ...mockBIResult,
      error: '调用 n8n 失败，已使用 mock 数据代替。',
    };
  }
};
