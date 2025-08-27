// 这是一个包含了柱状图和折线图的典型 ECharts 配置对象
export const mockChartOption = {
  title: {
    text: '模拟销售报表',
    subtext: '纯前端模拟数据',
    left: 'center'
  },
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    data: ['订单量 (柱状)', '销售额 (折线)'],
    top: 'bottom'
  },
  xAxis: {
    type: 'category',
    data: ['一月', '二月', '三月', '四月', '五月', '六月']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '订单量 (柱状)',
      type: 'bar', // 类型：柱状图
      data: [120, 200, 150, 80, 70, 110]
    },
    {
      name: '销售额 (折线)',
      type: 'line', // 类型：折线图
      data: [1500, 2300, 2200, 1200, 900, 1400]
    }
  ]
};