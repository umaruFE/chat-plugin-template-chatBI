import '@ant-design/v5-patch-for-react-19';
import { Button } from 'antd';
import { memo, useState } from 'react'; // 移除了 useEffect

// 引入图表组件和模拟数据
import EChartRender from '@/components/EChartRender';
import { mockChartOption } from '@/services/mock';

const Render = memo(() => {
  const [chartOption, setChartOption] = useState<object | undefined>();

  // 加载模拟数据的函数
  const loadMockData = () => {
    console.log("正在加载模拟图表数据...");
    setChartOption(mockChartOption);
  };

  // 新增一个清空图表数据的函数
  const clearChart = () => {
    console.log("清空图表数据...");
    setChartOption(undefined);
  };

  return (
    // 使用一个 flex 容器来更好地布局
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', height: '100vh', boxSizing: 'border-box' }}>
      {/* 1. 控制按钮区域 */}
      <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', flexShrink: 0 }}>
        <Button type="primary" onClick={loadMockData}>
          加载/重置模拟图表
        </Button>
        <Button onClick={clearChart}>
          清空图表
        </Button>
      </div>
      
      {/* 2. 图表渲染区域 */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <EChartRender option={chartOption || {}} />
      </div>
    </div>
  );
});

export default Render;