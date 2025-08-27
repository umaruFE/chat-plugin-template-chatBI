import '@ant-design/v5-patch-for-react-19';
import { App, Button, Card, ConfigProvider, Radio, Switch, theme, Typography } from 'antd';
import { memo, useEffect, useState } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import EChartRender from '@/components/EChartRender';
import TableRender from '@/components/TableRender'; // 引入新的表格组件
import { mockBIResult } from '@/services/mock';

const { Text } = Typography;

// 我们重新引入这个核心转换函数
const generateChartOption = (tableData: any[], chartType: 'bar' | 'line' | 'pie') => {
  if (!tableData || tableData.length === 0) return {};
  const columns = Object.keys(tableData[0]);
  const categoryColumn = columns[0];
  const valueColumn = columns[1];
  let option = {};
  switch (chartType) {
    case 'bar':
    case 'line':
      option = {
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: tableData.map(row => row[categoryColumn]) },
        yAxis: { type: 'value' },
        series: [{ name: valueColumn, type: chartType, data: tableData.map(row => row[valueColumn]) }],
      };
      break;
    case 'pie':
      option = {
        tooltip: { trigger: 'item' },
        series: [{
          name: categoryColumn,
          type: 'pie',
          radius: '50%',
          data: tableData.map(row => ({ name: row[categoryColumn], value: row[valueColumn] })),
        }],
      };
      break;
  }
  return { ...option, title: { text: `按'${categoryColumn}'分析'${valueColumn}'`, left: 'center' } };
};

const Render = memo(() => {
  const [biResult, setBiResult] = useState<any>();
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  const [chartOption, setChartOption] = useState<object | undefined>();
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'chart' | 'table'>('chart'); // 新增状态：管理当前视图

  const loadData = () => {
    setLoading(true);
    setTimeout(() => {
      setBiResult(mockBIResult);
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    if (biResult?.data) {
      const newOption = generateChartOption(biResult.data, chartType);
      setChartOption(newOption);
    }
  }, [biResult, chartType]);

  return (
    <ConfigProvider theme={{ algorithm: theme.defaultAlgorithm }}>
      <App>
        <Flexbox style={{ padding: '16px', background: '#f5f7fa', minHeight: '100vh' }} gap={16}>
          <Card size="small">
            <Button type="primary" onClick={loadData} loading={loading}>
              {biResult ? '重新加载数据' : '加载数据并分析'}
            </Button>
          </Card>
          
          {biResult ? (
            <Card
              size="small"
              title="分析结果"
              // 卡片右上角添加视图切换开关
              extra={<Switch checkedChildren="图表" unCheckedChildren="表格" checked={view === 'chart'} onChange={(checked) => setView(checked ? 'chart' : 'table')} />}
            >
              {/* 根据 view 状态，条件渲染图表或表格 */}
              {view === 'chart' ? (
                <>
                  <Flexbox align="center" style={{ marginBottom: 16 }}>
                    <Text type="secondary" style={{ marginRight: 8 }}>选择图表类型:</Text>
                    <Radio.Group
                      options={[ { label: '柱状图', value: 'bar' }, { label: '折线图', value: 'line' }, { label: '饼图', value: 'pie' } ]}
                      onChange={(e) => setChartType(e.target.value)}
                      value={chartType}
                      optionType="button"
                      buttonStyle="solid"
                    />
                  </Flexbox>
                  <EChartRender option={chartOption || {}} isLoading={loading} />
                </>
              ) : (
                <TableRender data={biResult.data} />
              )}
            </Card>
          ) : (
            <Center flex={1}>
              <Text type="secondary">请点击按钮加载数据</Text>
            </Center>
          )}
        </Flexbox>
      </App>
    </ConfigProvider>
  );
});

export default Render;