// src/components/EChartRender.tsx

import React from 'react';
// 1. 从 'echarts-for-react' 导入核心组件
import ReactECharts from 'echarts-for-react';

// 2. 定义组件接收的属性（Props）类型
interface EChartRenderProps {
  // 'option' 就是从 n8n 接收或我们模拟的 ECharts 配置对象
  option: object;
  // 'isLoading' 是一个可选属性，用于在请求数据时显示加载状态
  isLoading?: boolean;
}

const EChartRender = ({ option, isLoading = false }: EChartRenderProps) => {
  // 3. 处理加载状态
  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, color: '#999' }}>
        正在加载图表数据...
      </div>
    );
  }

  // 4. 处理没有数据或数据为空的情况
  if (!option || Object.keys(option).length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, color: '#999' }}>
        等待生成图表...
      </div>
    );
  }

  // 5. [可选但推荐] 处理我们自定义的错误格式，方便调试 n8n
  //    这对应 n8n 工作流中 Code 节点在 JSON 解析失败时返回的错误对象
  if ((option as any).error) {
    return (
      <div style={{ padding: 24, color: 'red', height: 400, overflowY: 'auto', border: '1px solid #ffccc7', borderRadius: 8, background: '#fff2f0' }}>
        <p style={{ marginTop: 0 }}><strong>图表生成失败:</strong> {(option as any).error}</p>
        <p>从语言模型收到的原始输出:</p>
        <pre style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: 8, borderRadius: 4, color: '#333', border: '1px solid #d9d9d9' }}>
          {(option as any).rawContent}
        </pre>
      </div>
    );
  }

  // 6. 渲染 ECharts 图表核心组件
  return (
    <ReactECharts
      option={option}
      style={{ height: '400px', width: '100%' }}
      // notMerge={true} 会在数据更新时完全替换旧的配置，避免数据残留
      notMerge={true}
      // lazyUpdate={true} 会在数据变化时延迟更新，提高性能
      lazyUpdate={true}
    />
  );
};

export default EChartRender;