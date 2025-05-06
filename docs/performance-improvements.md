# パフォーマンス改善とリファクタリング (vX.Y.Z)

このドキュメントでは、`generate-prompt.js` スクリプトに対して行われたパフォーマンス改善とリファクタリングについて説明します。

## 変更点の概要

主な変更点は以下の通りです。

1.  **I/O 処理の並列化:**
    *   複数のファイル (`template`, `sub-task`, `micro-task`, `target-doc`, `section-list.yaml` など) を読み込む処理を `Promise.all` を使用して並列化しました。これにより、特に I/O バウンドな環境での実行時間短縮が期待されます。

2.  **ファイル読み込みキャッシュの実装:**
    *   `utils/fsCache.js` モジュールを導入し、一度読み込んだファイルの内容をメモリ上の `Map` にキャッシュするようにしました。同一ファイルへの複数回のアクセスが発生する場合、2回目以降はディスクアクセスを行わずにキャッシュから内容を返すため、高速化が期待されます。
    *   現状、キャッシュの有効期限やサイズ制限、明示的な無効化機能はありません。スクリプト実行ごとにキャッシュはクリアされます。

3.  **正規表現の最適化:**
    *   `extractHeadings` 関数内で見出し ID (`{#id}`) を除去するために使用していた正規表現を、関数呼び出しごとにコンパイルするのではなく、モジュールスコープで一度だけコンパイルして再利用するように変更しました。これにより、特に見出し数が多いドキュメントを処理する際の CPU 負荷が軽減されます。

4.  **ログ出力の改善 (`debug` ライブラリ導入):**
    *   従来の `console.log` / `console.warn` によるデバッグログ出力を、`debug` ライブラリを使用したスコープ付きのログ出力に置き換えました。
    *   これにより、環境変数 `DEBUG` を使用して、必要なスコープのログのみを選択的に表示できるようになりました。

## 使い方

### Debug ログの有効化

`debug` ライブラリによる詳細なログ出力を有効にするには、スクリプト実行時に環境変数 `DEBUG` を設定します。

*   **すべての `generate-prompt` 関連ログを表示:**
    ```bash
    DEBUG=generate-prompt* node scripts/generate-prompt.js [引数...]
    ```
*   **特定のスコープのログのみを表示 (例: スコープ決定ロジック):**
    ```bash
    DEBUG=generate-prompt:scope node scripts/generate-prompt.js [引数...]
    ```
*   **複数のスコープを指定:**
    ```bash
    DEBUG=generate-prompt:main,generate-prompt:error node scripts/generate-prompt.js [引数...]
    ```

利用可能な主なスコープ:

*   `generate-prompt`: 一般的なログ
*   `generate-prompt:main`: メイン処理の開始/終了、引数解析、ファイル読み書きなど
*   `generate-prompt:scope`: `determineNextScope` 関数の詳細な動作ログ
*   `generate-prompt:repomix`: `repomix` (runCli) 実行関連のログ
*   `generate-prompt:error`: エラー発生時の詳細ログ

`DEBUG` 環境変数を設定しない場合、スクリプトは従来通り、主要な処理ステップの開始/終了メッセージとエラーメッセージのみを `console.log` / `console.error` に出力します。

### キャッシュについて

ファイル読み込みキャッシュはデフォルトで有効になっています。現状、キャッシュを無効化するための明示的な環境変数はありません。キャッシュはスクリプトの実行プロセス内でのみ有効であり、プロセス終了時に破棄されます。