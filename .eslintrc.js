module.exports = {
  // 1. 继承 Next.js 的官方推荐配置，这是最关键的一步
  extends: 'next/core-web-vitals',

  // 2. 针对 TypeScript 文件进行特殊配置
  overrides: [
    {
      files: ['*.ts', '*.tsx'], // 只对 .ts 和 .tsx 文件生效
      // 告诉 ESLint 使用 TypeScript 解析器
      parser: '@typescript-eslint/parser',
      parserOptions: {
        // 指定 tsconfig.json 文件路径，以便进行类型检查
        project: './tsconfig.json',
      },
      // 继承 TypeScript-ESLint 的推荐规则
      extends: ['next/core-web-vitals','plugin:@typescript-eslint/recommended'],

      // 3. 在这里整合您自定义的规则
      rules: {
        'react/jsx-sort-props': 'off', // 保留您关闭的属性排序规则
        '@typescript-eslint/no-unused-vars': 'warn', // 保留您修改的 TS 未使用变量规则
        '@typescript-eslint/no-explicit-any': 'off', // 允许使用 any 类型，在插件开发中很常见
      },
    },
  ],

  // 4. 在这里整合您自定义的插件和环境
  plugins: ['jest'],
  env: {
    'jest/globals': true,
  },
  
  // 5. 全局规则（如果需要）
  rules: {
     'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn', // 保留您按环境自定义的 console 规则
  }
};
