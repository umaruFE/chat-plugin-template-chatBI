// 1. SQL 字段：存储本次查询的 SQL 语句
const sql = "SELECT city, SUM(sales) as total_sales, COUNT(*) as order_count FROM sales_data WHERE country = '中国' GROUP BY city ORDER BY total_sales DESC LIMIT 5;";

// 2. Data 字段：存储纯净的、由对象组成的数组格式的表格数据
const data = [
  { 城市: '上海', 总营业额: 8200, 订单数: 120 },
  { 城市: '广州', 总营业额: 7100, 订单数: 105 },
  { 城市: '深圳', 总营业额: 6800, 订单数: 98 },
  { 城市: '北京', 总营业额: 5400, 订单数: 85 },
  { 城市: '杭州', 总营业额: 4500, 订单数: 72 }
];

export const mockBIResult = { sql, data };