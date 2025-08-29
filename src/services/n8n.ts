
import { mockBIResult } from './mock';

const N8N_WEBHOOK_URL =  process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || '';;

export const fetchBIAnalysis = async (payload: any) => {
  if (!N8N_WEBHOOK_URL.startsWith('http')) {
    console.warn('⚠️ N8N_WEBHOOK_URL 未配置，将返回 mock 数据。');
    return mockBIResult;
  }

  try {
    // 1. 核心修复：使用浏览器标准 API 生成一个唯一的 ID
    // 这比依赖不确定的 SDK 函数更稳定
    const sessionId = crypto.randomUUID(); 

    // 2. 将 sessionId 和 payload 一起放入新的请求体中
    const body = {
      ...payload, // 包含 { query: '...' }
      sessionId: sessionId,
    };

    console.log('正在向 n8n 发送请求, body:', body);

    // 3. 发送包含 sessionId 的新请求体
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
    console.log('收到 n8n 的响应:', result);
    return result;
  } catch (error) {
    console.error('调用 n8n 工作流时出错:', error);
    return {
      ...mockBIResult,
      error: '调用 n8n 失败，已使用 mock 数据代替。'
    };
  }
};

