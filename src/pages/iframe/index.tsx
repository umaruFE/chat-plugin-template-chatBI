// 引入 Framer Motion 的核心组件
import { motion, AnimatePresence } from 'framer-motion';
import '@ant-design/v5-patch-for-react-19';
import { App, Button, Card, ConfigProvider, DatePicker, Radio, Space, Steps, Switch, theme, Typography } from 'antd';
import dayjs from 'dayjs';
import { memo, useEffect, useState } from 'react';
import { Center, Flexbox } from 'react-layout-kit';
// 暂时移除 echarts/core 的导入来修复 SSR 编译错误
// import * as echarts from 'echarts/core';


import EChartRender from '@/components/EChartRender';
import TableRender from '@/components/TableRender';
import { mockBIResult } from '@/services/mock';

const { Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

// ========================================================================
// ========= 核心改动：替换为美化版的 generateChartOption 函数 =========
// ========================================================================
const generateChartOption = (tableData: any[], chartType: 'bar' | 'line' | 'pie') => {
  if (!tableData || tableData.length === 0) return {};

  const columns = Object.keys(tableData[0]);
  const categoryColumn = columns[0];
  const valueColumn = columns[1];
  
  // 1. 定义一组更现代、更漂亮的颜色
  const colorPalette = ['#5470C6', '#91CC75', '#EE6666', '#73C0DE', '#3BA272', '#FC8452'];

  let option = {};

  switch (chartType) {
    case 'bar':
      option = {
        xAxis: { type: 'category', data: tableData.map(row => row[categoryColumn]) },
        yAxis: { type: 'value' },
        series: [{
          name: valueColumn,
          type: 'bar',
          data: tableData.map(row => row[valueColumn]),
          // 2. 美化柱状图样式
          itemStyle: {
            borderRadius: [4, 4, 0, 0], // 顶部圆角
            color: colorPalette[0], // 临时修复：使用纯色代替渐变色
            shadowColor: 'rgba(0, 0, 0, 0.2)', // 阴影
            shadowBlur: 5,
          },
          emphasis: {
            itemStyle: {
              color: colorPalette[3], // 临时修复：高亮时使用另一种纯色
            }
          }
        }],
      };
      break;

    case 'line':
      option = {
        xAxis: { type: 'category', data: tableData.map(row => row[categoryColumn]) },
        yAxis: { type: 'value' },
        series: [{
          name: valueColumn,
          type: 'line',
          data: tableData.map(row => row[valueColumn]),
          // 3. 美化折线图样式
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: {
            color: colorPalette[2],
            width: 3,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
            shadowBlur: 10,
            shadowOffsetY: 8,
          },
          // 临时修复：暂时移除渐变填充区域
          // areaStyle: { ... }
        }],
      };
      break;
      
    case 'pie':
      option = {
        series: [{
          name: categoryColumn,
          type: 'pie',
          radius: ['40%', '70%'], // 改为环形图，更美观
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '20',
              fontWeight: 'bold'
            }
          },
          data: tableData.map(row => ({
            name: row[categoryColumn],
            value: row[valueColumn],
          })),
        }],
      };
      break;
  }
  
  return {
    ...option,
    title: { text: `按'${categoryColumn}'分析'${valueColumn}'`, left: 'center' },
    color: colorPalette,
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    tooltip: {
      trigger: chartType === 'pie' ? 'item' : 'axis',
      backgroundColor: 'rgba(255,255,255,0.9)',
      borderColor: '#E8E8E8',
      borderWidth: 1,
      textStyle: { color: '#333' },
    },
    legend: {
      show: chartType === 'pie', // 只在饼图时显示图例
      orient: 'vertical',
      left: 'left',
    },
  };
};


const Render = memo(() => {
  const [biResult, setBiResult] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepStatus, setStepStatus] = useState<'process' | 'finish' | 'error'>('process');
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  const [chartOption, setChartOption] = useState<object | undefined>();
  const [view, setView] = useState<'chart' | 'table'>('chart');

  const runAnalysis = () => {
    setLoading(true);
    setCurrentStep(0);
    setStepStatus('process');
    setBiResult(undefined);
    setTimeout(() => {
      setCurrentStep(1);
      setBiResult({ sql: mockBIResult.sql });
    }, 500);
    setTimeout(() => {
      setCurrentStep(2);
      setBiResult(mockBIResult);
      setStepStatus('finish');
      setLoading(false);
    }, 1500);
  };

  useEffect(() => {
    if (biResult?.data) {
      const newOption = generateChartOption(biResult.data, chartType);
      setChartOption(newOption);
    }
  }, [biResult, chartType]);

  const cardAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: 'easeInOut' },
  };

  const steps = [
    {
      title: '筛选条件',
      description: (
        <motion.div {...cardAnimation}>
          <Card size="small">
            <Space direction="vertical">
              <Text>数据时间:</Text>
              <RangePicker defaultValue={[dayjs(), dayjs()]} />
            </Space>
          </Card>
        </motion.div>
      ),
    },
    {
      title: 'SQL 语句',
      description: biResult?.sql ? (
        <motion.div {...cardAnimation}>
          <Card size="small">
            <Paragraph>
              <pre style={{ margin: 0, background: '#fafafa', padding: '8px 12px', borderRadius: 4, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {biResult.sql}
              </pre>
            </Paragraph>
          </Card>
        </motion.div>
      ) : null,
    },
    {
      title: '数据查询与可视化',
      description: biResult?.data ? (
        <motion.div {...cardAnimation}>
          <Card
            size="small"
            extra={<Switch checkedChildren="图表" unCheckedChildren="表格" checked={view === 'chart'} onChange={(checked) => setView(checked ? 'chart' : 'table')} />}
          >
            {view === 'chart' ? (
            <>
              <Flexbox align="center" style={{ marginBottom: 16 }}>
                <Text type="secondary" style={{ marginRight: 8 }}>选择图表类型:</Text>
                <Radio.Group
                  options={[{ label: '柱状图', value: 'bar' }, { label: '折线图', value: 'line' }, { label: '饼图', value: 'pie' }]}
                  onChange={(e) => setChartType(e.target.value)}
                  value={chartType}
                  optionType="button"
                  buttonStyle="solid"
                />
              </Flexbox>
              <EChartRender option={chartOption || {}} />
            </>
          ) : (
            <TableRender data={biResult.data} />
          )}
          </Card>
        </motion.div>
      ) : null,
    },
  ];

  return (
    <ConfigProvider theme={{ algorithm: theme.defaultAlgorithm }}>
      <App>
        <Flexbox style={{ padding: '16px', background: '#f5f7fa', minHeight: '100vh' }} gap={16}>
          <Card size="small">
            <Button type="primary" onClick={runAnalysis} loading={loading}>
              {loading ? '分析中...' : '加载数据并分析'}
            </Button>
          </Card>
          
          <AnimatePresence>
            <Steps
              direction="vertical"
              progressDot
              current={currentStep}
              status={stepStatus}
              items={steps}
            />
          </AnimatePresence>
        </Flexbox>
      </App>
    </ConfigProvider>
  );
});

export default Render;
