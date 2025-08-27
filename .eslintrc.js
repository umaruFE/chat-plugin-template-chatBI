module.exports = {
  // 覆盖或新增规则
  rules: {
    'react/jsx-sort-props': 'off', // 关闭属性排序规则
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn', // 按环境自定义
    '@typescript-eslint/no-unused-vars': 'warn', // 修改 TS 未使用变量规则
  },
  // 添加插件（若预设未包含）
  plugins: ['jest'],
  // 扩展环境
  env: {
    'jest/globals': true,
  },
};