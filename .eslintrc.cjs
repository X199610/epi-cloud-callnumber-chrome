module.exports = {
  // eslintrc.js文件所在的目录为root目录，
  // eslint规则将对这个目录以及该目录下所有文件起作用。
  root: true,
  globals: {
    defineProps: 'readonly',
    defineEmits: 'readonly',
    defineExpose: 'readonly',
    withDefaults: 'readonly',
  },
  extends: ['plugin:@typescript-eslint/recommended'],
  plugins: ['vue'], // 是对规则进行补充vue规则
  parser: 'vue-eslint-parser', // 检测 vue 语法规范的解析器
  parserOptions: {
    ecmaVersion: 2021,
    parser: '@typescript-eslint/parser', // 检测 ts 语法规范的解析器
  },
  rules: {
    //  生产环境不允许控制台输出，开发允许允许控制台输出。
    // 'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'space-before-function-paren': 0, // 不允许函数的()前有空格
    'vue/no-multiple-template-root': 0,
    '@typescript-eslint/no-empty-function': 0, //允许出现空的函数
    '@typescript-eslint/no-explicit-any': [0], // 允许使用any
    '@typescript-eslint/no-var-requires': 0, // 项目中允许使用 require()语法。
    '@typescript-eslint/triple-slash-reference': 0,
    semi: 0, // 关闭语句结尾分号
    quotes: [2, 'single'], //使用单引号
    'prefer-const': 2, // 开启不变的变量一定要使用const
    '@typescript-eslint/no-unused-vars': 0, // 允许出现未使用过的变量
    '@typescript-eslint/no-inferrable-types': 0, //  允许变量后面添加类型
    '@typescript-eslint/no-non-null-assertion': 0,
    '@typescript-eslint/ban-ts-comment': 0,
    '@typescript-eslint/no-extra-semi': 0,
  },
}
