import { mockBIResult } from './mock';

// 这个函数现在接收一个 webhookId 作为参数
export const fetchBIAnalysis = async (payload: any, webhookId?: string) => {
  // 如果没有提供 webhookId，说明插件可能加载失败或配置错误
  // eslint-disable-next-line no-console
  console.log('成功从 URL 中获取 webhookId:', webhookId);
  if (!webhookId) {
    console.warn('⚠️ 未能从插件设置中获取 webhookId，将返回 mock 数据。');
    return mockBIResult;
  }

  // 1. 根据 webhookId 动态构造环境变量的名称
  const envVarName = `NEXT_PUBLIC_N8N_WEBHOOK_${webhookId}`;

  // 2. 从 process.env 中读取对应的 Webhook URL
  const webhookUrl = process.env[envVarName];

  if (!webhookUrl || !webhookUrl.startsWith('http')) {
    console.warn(`⚠️ 环境变量 ${envVarName} 未配置或无效，将返回 mock 数据。`);
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
    console.error('调用 n8n 工作流时出错:', error);
    return {
      ...mockBIResult,
      error: '调用 n8n 失败，已使用 mock 数据代替。',
    };
  }
};
