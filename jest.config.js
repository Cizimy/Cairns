/** @type {import('jest').Config} */
const config = {
  // Node.js 環境で実行することを明示
  testEnvironment: 'node',
  // ES Modules をサポートするための設定
  // デフォルトの Babel トランスフォームを無効にする
  transform: {},
  // verbose: true, // 必要に応じて詳細ログを有効にする

  // カバレッジ設定を追加
  collectCoverage: true,
  coverageDirectory: 'coverage', // レポートの出力先
  coverageProvider: 'v8', // Node.js v8 カバレッジを使用
  collectCoverageFrom: [
    'scripts/generate-prompt.js', // メインスクリプト
    'utils/fsCache.js',         // キャッシュユーティリティ
    // 他の計測対象ファイルがあればここに追加
    // '!**/node_modules/**', // node_modules は除外 (デフォルトで除外されるはずだが明示)
    // '!**/vendor/**', // vendor ディレクトリなども除外
  ],
  // カバレッジ閾値の設定 (任意)
  // coverageThreshold: {
  //   global: {
  //     branches: 80,
  //     functions: 80,
  //     lines: 80,
  //     statements: -10, // ステートメント数は目安程度
  //   },
  // },
};

export default config;