// src/components/EChartRender.tsx

import React from 'react';
// 1. 从 'echarts-for-react' 导入核心组件
import ReactECharts from 'echarts-for-react';

// 2. 定义组件接收的属性（Props）类型
interface EChartRenderProps {
  // 'isLoading' 是一个可选属性，用于在请求数据时显示加载状态
  isLoading?: boolean;
  // 'option' 就是从 n8n 接收或我们模拟的 ECharts 配置对象
  option: object;
}

const EChartRender = ({ option, isLoading = false }: EChartRenderProps) => {
  // 3. 处理加载状态
  if (isLoading) {
    return (
      <div style={{ alignItems: 'center', color: '#999', display: 'flex', height: 400, justifyContent: 'center' }}>
        正在加载图表数据...
      </div>
    );
  }

  // 4. 处理没有数据或数据为空的情况
  if (!option || Object.keys(option).length === 0) {
    return (
      <div style={{ alignItems: 'center', color: '#999', display: 'flex', height: 400, justifyContent: 'center' }}>
        等待生成图表...
      </div>
    );
  }

  // 5. [可选但推荐] 处理我们自定义的错误格式，方便调试 n8n
  //    这对应 n8n 工作流中 Code 节点在 JSON 解析失败时返回的错误对象
  if ((option as any).error) {
    return (
      <div style={{ background: '#fff2f0', border: '1px solid #ffccc7', borderRadius: 8, color: 'red', height: 400, overflowY: 'auto', padding: 24 }}>
        <p style={{ marginTop: 0 }}><strong>图表生成失败:</strong> {(option as any).error}</p>
        <p>从语言模型收到的原始输出:</p>
        <pre style={{ background: '#f5f5f5', border: '1px solid #d9d9d9', borderRadius: 4, color: '#333', padding: 8, whiteSpace: 'pre-wrap' }}>
          {(option as any).rawContent}
        </pre>
      </div>
    );
  }

  // 6. 渲染 ECharts 图表核心组件
  return (
    <ReactECharts
      lazyUpdate={true}
      notMerge={true}
      // notMerge={true} 会在数据更新时完全替换旧的配置，避免数据残留
      option={option}
      // lazyUpdate={true} 会在数据变化时延迟更新，提高性能
      style={{ height: '400px', width: '100%' }}
    />
  );
};

export default EChartRender;