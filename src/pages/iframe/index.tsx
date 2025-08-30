// 引入 Framer Motion 的核心组件和 Transition 类型
import '@ant-design/v5-patch-for-react-19';
// 1. 引入 LobeChat SDK 和新的 n8n 服务
import { lobeChat } from '@lobehub/chat-plugin-sdk/client';
// 引入 Select 和 Radio 组件
import {
  App,
  Button,
  Card,
  ConfigProvider,
  DatePicker,
  Radio,
  Select,
  Steps,
  Switch,
  Typography,
  theme,
} from 'antd';
import dayjs from 'dayjs';
import * as echarts from 'echarts/core';
import { AnimatePresence, Transition, motion } from 'framer-motion';
import { memo, useEffect, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import EChartRender from '@/components/EChartRender';
import TableRender from '@/components/TableRender';
import { fetchBIAnalysis } from '@/services/n8n';

const { Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

// ... generateChartOption 函数保持不变 ...
const generateChartOption = (tableData: any[], chartType: 'bar' | 'line' | 'pie') => {
  if (!tableData || tableData.length === 0) return {};
  const columns = Object.keys(tableData[0]);
  const categoryColumn = columns[0];
  const valueColumn = columns[1];
  const colorPalette = ['#5470C6', '#91CC75', '#EE6666', '#73C0DE', '#3BA272', '#FC8452'];
  let option = {};
  switch (chartType) {
    case 'bar':
      option = {
        xAxis: { type: 'category', data: tableData.map((row) => row[categoryColumn]) },
        yAxis: { type: 'value' },
        series: [
          {
            name: valueColumn,
            type: 'bar',
            data: tableData.map((row) => row[valueColumn]),
            itemStyle: {
              borderRadius: [4, 4, 0, 0],
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: colorPalette[0] },
                { offset: 1, color: '#91CC75' },
              ]),
              shadowColor: 'rgba(0, 0, 0, 0.2)',
              shadowBlur: 5,
            },
            emphasis: {
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#73C0DE' },
                  { offset: 1, color: colorPalette[0] },
                ]),
              },
            },
          },
        ],
      };
      break;
    case 'line':
      option = {
        xAxis: { type: 'category', data: tableData.map((row) => row[categoryColumn]) },
        yAxis: { type: 'value' },
        series: [
          {
            name: valueColumn,
            type: 'line',
            data: tableData.map((row) => row[valueColumn]),
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
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(238, 102, 102, 0.5)' },
                { offset: 1, color: 'rgba(238, 102, 102, 0)' },
              ]),
            },
          },
        ],
      };
      break;
    case 'pie':
      option = {
        series: [
          {
            name: categoryColumn,
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
            label: { show: false, position: 'center' },
            emphasis: { label: { show: true, fontSize: '20', fontWeight: 'bold' } },
            data: tableData.map((row) => ({ name: row[categoryColumn], value: row[valueColumn] })),
          },
        ],
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
    legend: { show: chartType === 'pie', orient: 'vertical', left: 'left' },
  };
};

// ✅ 使用具名函数表达式来修复 display-name 错误
const Render = memo(function Render() {
  const [biResult, setBiResult] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepStatus, setStepStatus] = useState<'process' | 'finish' | 'error'>('process');
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  const [chartOption, setChartOption] = useState<object | undefined>();
  const [view, setView] = useState<'chart' | 'table'>('chart');

  const [payload, setPayload] = useState<any>();

  // ✅ 新增状态来管理筛选器的值
  const [dataset, setDataset] = useState('sales_data');
  const [queryMode, setQueryMode] = useState('aggregate');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([dayjs(), dayjs()]);

  useEffect(() => {
    lobeChat.getPluginPayload().then((payload) => {
      if (
        payload &&
        (payload.name === 'generateChart' ||
          payload.name === 'generateChart--wuliu' ||
          payload.name === 'generateChart--gongyinglian' ||
          payload.name === 'generateChart--shengwuzhiyao' ||
          payload.name === 'generateChart--zhinengzhizao')
      ) {
        // console.log('接收到 LobeChat payload:', payload.arguments);
        setPayload(payload.arguments);
      }
    });
  }, []);

  const runAnalysis = async () => {
    if (!payload) {
      // eslint-disable-next-line no-alert
      alert('没有从 LobeChat 接收到分析指令');
      return;
    }

    setLoading(true);
    setCurrentStep(0);
    setStepStatus('process');
    setBiResult(undefined);

    // ✅ 核心修改：在调用 n8n 之前，先获取插件的设置

    const analysisPayload = {
      ...payload,
      filters: {
        dataset,
        queryMode,
        dateRange: dateRange.map((d) => d.format('YYYY-MM-DD')),
      },
    };

    const params = new URLSearchParams(window.location.search);
    const webhookId = params.get('webhookId') || '';

    // ✅ 核心修改：将获取到的 webhookId 作为第二个参数传递给 n8n 服务
    const result = await fetchBIAnalysis(analysisPayload, webhookId);

    setTimeout(() => {
      setCurrentStep(1);
      setBiResult({ sql: result.sql });
    }, 500);

    setTimeout(() => {
      setCurrentStep(2);
      setBiResult(result);
      setStepStatus(result.error ? 'error' : 'finish');
      setLoading(false);
    }, 1500);
  };

  useEffect(() => {
    if (biResult?.data) {
      const newOption = generateChartOption(biResult.data, chartType);
      setChartOption(newOption);
    }
  }, [biResult, chartType]);

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  const cardTransition: Transition = {
    duration: 0.5,
    ease: 'easeInOut',
  };

  const steps = [
    {
      title: '筛选条件',
      description: (
        <motion.div
          variants={cardVariants}
          initial="initial"
          animate="animate"
          transition={cardTransition}
        >
          <Card size="small">
            <Flexbox gap={16} direction="vertical">
              <Flexbox horizontal align="center" gap={8}>
                <Text style={{ width: 80, textAlign: 'right', flexShrink: 0 }}>数据时间:</Text>
                {/* ✅ 变为受控组件 */}
                <RangePicker
                  value={dateRange}
                  onChange={(dates) => {
                    if (dates) {
                      setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs]);
                    }
                  }}
                  style={{ flex: 1 }}
                />
              </Flexbox>
            </Flexbox>
          </Card>
        </motion.div>
      ),
    },
    {
      title: 'SQL 语句',
      description: biResult?.sql ? (
        <motion.div
          variants={cardVariants}
          initial="initial"
          animate="animate"
          transition={cardTransition}
        >
          <Card size="small">
            <Paragraph>
              <pre
                style={{
                  margin: 0,
                  background: '#fafafa',
                  padding: '8px 12px',
                  borderRadius: 4,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}
              >
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
        <motion.div
          variants={cardVariants}
          initial="initial"
          animate="animate"
          transition={cardTransition}
        >
          <Card
            size="small"
            extra={
              <Switch
                checkedChildren="图表"
                unCheckedChildren="表格"
                checked={view === 'chart'}
                onChange={(checked) => setView(checked ? 'chart' : 'table')}
              />
            }
          >
            {view === 'chart' ? (
              <>
                <Flexbox align="center" style={{ marginBottom: 16 }}>
                  <Text type="secondary" style={{ marginRight: 8 }}>
                    选择图表类型:
                  </Text>
                  <Radio.Group
                    options={[
                      { label: '柱状图', value: 'bar' },
                      { label: '折线图', value: 'line' },
                      { label: '饼图', value: 'pie' },
                    ]}
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
            <Button type="primary" onClick={runAnalysis} loading={loading} disabled={!payload}>
              {loading ? '分析中...' : payload ? '开始分析' : '等待 LobeChat 指令...'}
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
