/** @type {import('jest').Config} */
const config = {
  // Node.js 環境で実行することを明示
  testEnvironment: 'node',
  // ES Modules をサポートするための設定
  // デフォルトの Babel トランスフォームを無効にする
  transform: {},
  // verbose: true, // 必要に応じて詳細ログを有効にする
};

export default config;