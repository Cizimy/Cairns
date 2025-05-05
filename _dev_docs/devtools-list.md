# 選定ツールリスト (v1.1 - 監査フィードバック反映版) {#h1-selected-tool-list}

## 1. はじめに {#h2-introduction}

本ドキュメントは、「Cairns 開発・運用ツール調査レポート」(以下、調査レポート) および「Cairns 開発・運用ツール 機能要件リスト v1.1」(以下、機能要件リスト) に基づき、Cairns プロジェクトの開発・運用プロセスを支援するために採用するツール群を定義します。調査レポートの推奨に従い、各ツールの選定理由、基本的な設定方針、CI/CD への組み込みイメージ、および導入に関する考慮事項をまとめます。本バージョン (v1.1) は、2025-04-29 の監査/改善担当からのフィードバックを反映しています。

## 2. 必須 (Mandatory) 要件 (A) 対応ツール {#h2-mandatory-requirements-a-tools}

### A1. YAML Linter (YAML構文・スタイル検証ツール) {#h3-a1-yaml-linter}

* **選定ツール:**
    * **yamllint**: Python 製の YAML リンター。バージョンは CI 環境で利用可能な最新安定版を想定。
    * **GitHub Action:** `reviewdog/action-yamllint` (推奨) または `ibiqlik/action-yamllint` など。
    * **VSCode 拡張機能:** `redhat.vscode-yaml` (yamllint 統合)。
* **選定理由:**
    * 機能要件 A-1.1 (構文検証), A-1.2 (スタイル検証) を満たす。
    * 調査レポートで推奨されており、設定ファイル (`.yamllint`) によるルールのカスタマイズが可能。
    * CLI ツールとして提供され、ローカルおよび CI での実行が容易。
    * `reviewdog/action-yamllint` は PR へのインラインコメントによるフィードバックを提供し、CI/CD (A5) との連携に優れる。
* **基本設定/CI組み込み:**
    * リポジトリルートに `.yamllint` ファイルを配置し、ルールセット (例: `extends: default`) や個別のルール設定を行う。
    * GitHub Actions ワークフローのステップで、選択した Action (`reviewdog/action-yamllint` 等) を使用し、設定ファイルを参照して Lint を実行する。
* **導入方針/備考:**
    * 開発者はローカル環境に `yamllint` をインストールし、CLI で実行可能 (A7.1)。
    * VSCode 拡張機能 (`redhat.vscode-yaml`) により、基本的な構文チェックと一部のスタイル検証のリアルタイムフィードバックが可能 (A7.2)。ただし、調査レポートで指摘されている通り、`.yamllint` で定義された全てのカスタムルールがリアルタイムで完全に反映されるかは注意が必要。
    * エラーメッセージはファイル名、行/列番号、ルール ID を含み明確 (A7.3)。

### A2. Markdown Linter (Markdown構文・スタイル検証ツール) {#h3-a2-markdown-linter}

* **選定ツール:**
    * **markdownlint-cli2**: Node.js 製の Markdown リンター CLI。バージョンは CI 環境で利用可能な最新安定版を想定。
    * **GitHub Action:** `DavidAnson/markdownlint-cli2-action` (推奨)。
    * **VSCode 拡張機能:** `DavidAnson.vscode-markdownlint`。
* **選定理由:**
    * 機能要件 A-2.1 (構文検証), A-2.2 (スタイル検証) を満たす。
    * 調査レポートで推奨されており、CommonMark/GFM をサポートし、設定ファイル (`.markdownlint-cli2.{jsonc,yaml,cjs}`) による豊富なルールのカスタマイズが可能。
    * エコシステム (CLI, GitHub Action, VSCode 拡張) が成熟しており、連携がスムーズ。
* **基本設定/CI組み込み:**
    * リポジトリルートに `.markdownlint-cli2.{jsonc,yaml,cjs}` または `.markdownlint.{jsonc,json,yaml,yml,cjs}` ファイルを配置し、ルールを定義する。
    * GitHub Actions ワークフローのステップで、`DavidAnson/markdownlint-cli2-action` を使用し、設定ファイルを参照して Lint を実行する。
* **導入方針/備考:**
    * 開発者はローカル環境に `markdownlint-cli2` をインストールし、CLI で実行可能 (A7.1)。
    * VSCode 拡張機能 (`DavidAnson.vscode-markdownlint`) により、優れたリアルタイム警告表示、Quick Fix、自動修正機能が提供され、開発者体験 (A7.2) が非常に良好。
    * エラーメッセージはファイル名、行番号、ルール ID/名前を含み明確 (A7.3)。

### A3. JSON Schema Validator (Front Matter スキーマ検証ツール) {#h3-a3-json-schema-validator}

* **選定ツール:**
    * **カスタム検証スクリプト**: Cairns 固有の検証ロジックを実装するスクリプト (言語は **Python** または **Node.js** を推奨、A6 と統一。下記「導入方針/備考」参照)。
    * **バックエンドバリデーター (スクリプト内で使用):**
        * Node.js の場合: **Ajv (v8 以降)** + (オプション) **ajv-cli**。
        * Python の場合: **jsonschema** (最新版) + **referencing** (最新版)。
    * バージョン: 上記ライブラリの Draft 2020-12 対応最新安定版。
* **選定理由:**
    * 機能要件 A-3.1 (スキーマ準拠), A-3.2 (Draft 2020-12), A-3.3 ($ref), A-3.4 ($dynamicRef), A-3.5 (条件付き必須) の**厳格な要件**を満たすため、調査レポートで推奨されている通り、カスタム実装が必要。
    * Ajv (v8+) および jsonschema+referencing は Draft 2020-12 の高度な機能 (特に $dynamicRef) に対応している主要なライブラリ。
    * 既存の汎用 GitHub Actions は、これらの高度な機能に対応している保証がないため、採用しない。
* **基本設定/CI組み込み:**
    * カスタムスクリプトをリポジトリ内に配置。
    * スクリプト内で、YAML Front Matter を抽出・パースするライブラリ (例: Python: `python-frontmatter`, `PyYAML`; Node.js: `gray-matter`, `js-yaml`) を使用。
    * 抽出した Front Matter (JSON 形式に変換後) を、選択したバックエンドバリデーター (Ajv または jsonschema) を用いて `cairns-front-matter.schema.json` (および参照スキーマ) に対して検証。
    * GitHub Actions ワークフローの `run` ステップで、適切な実行環境 (Node.js or Python) をセットアップし、依存ライブラリをインストール後、カスタムスクリプトを実行する。
* **導入方針/備考:**
    * **カスタムスクリプト言語の決定:** A3, A6, B2, B3, B4 で使用するカスタムスクリプト言語の統一が推奨される。本ツール選定タスク (1.2.12) の一環として、または後続の初期実装タスク (例: アクションプラン フェーズ1完了まで) にて、プロジェクトチーム内で技術スタックの適合性や保守性を考慮し、Python または Node.js のいずれかに統一する方針を最終決定する。
    * **開発者体験 (DX) の課題と対策 (A7.2):** 調査レポートで強調されている通り、主要な VSCode 拡張機能 (`redhat.vscode-yaml`) は JSON Schema Draft 2020-12 の高度な機能に対応していないため、**リアルタイムでの厳密なスキーマ検証は提供できない**。開発者は、スキーマ適合性を確認するためにローカル環境でカスタムスクリプト (または ajv-cli) を手動で実行する必要があることを理解する必要がある (A7.1)。このギャップを補うため、**プロジェクトの README や開発者向けドキュメントに、ローカル環境でのセットアップ手順と検証スクリプトの具体的な実行方法を明記する。** また、**検証実行を容易にするための簡易的なラッパースクリプト (例: `npm run validate:schema` や `make validate-schema`) の提供も検討する。**
    * エラーメッセージ (A7.3) は、バリデーションライブラリ (Ajv/jsonschema) が提供する詳細な情報 (エラー箇所へのパス、違反キーワード等) を基に、カスタムスクリプト内で開発者が理解しやすい形式 (ファイル名、問題フィールド、原因など) で出力するように実装する。

### A4. Git クライアント / プラットフォーム {#h3-a4-git-client-platform}

* **選定ツール:**
    * **Git**: 分散バージョン管理システム。
    * **GitHub**: Git リポジトリホスティングプラットフォーム。
* **選定理由:**
    * 機能要件 A-4.1 (バージョン管理), A-4.2 (変更履歴/差分) を完全に満たす。
    * 業界標準のツールであり、Cairns プロジェクトの基盤として最適。
    * A5 で選定する GitHub Actions とシームレスに連携する。
* **基本設定/CI組み込み:**
    * GitHub 上にリポジトリを作成・管理。
    * 開発者はローカル環境で Git クライアントを使用。
    * CI/CD は GitHub Actions (A5) によってリポジトリイベント (push, pull_request など) をトリガーに実行される。
* **導入方針/備考:**
    * 標準的な Git ワークフロー (ブランチ運用、Pull Request ベースのレビュー) を採用する。

### A5. CI/CD プラットフォーム {#h3-a5-ci-cd-platform}

* **選定ツール:**
    * **GitHub Actions**
* **選定理由:**
    * 機能要件 A-5.1 (イベントトリガー), A-5.2 (ツール連携), A-5.3 (PRフィードバック/マージブロック), A-5.4 (ログ確認) を満たす。
    * 将来的な要件である A-5.5 (デプロイメント), A-5.6 (Secrets管理) にも対応。
    * GitHub (A4) に統合されており、設定・運用が容易。
    * 豊富な Marketplace Actions と、カスタムスクリプト実行 (`run`) の柔軟性を兼ね備える。
* **基本設定/CI組み込み:**
    * リポジトリの `.github/workflows/` ディレクトリ内に YAML ファイルでワークフローを定義。
    * `on:` キーでトリガーイベント (例: `pull_request`, `push`) を指定。
    * `jobs:` と `steps:` を定義し、`uses:` で既存の Action (A1, A2 など) を呼び出すか、`run:` でカスタムスクリプト (A3, A6 など) を実行する。
    * ブランチ保護ルールを設定し、必須チェック (CI ワークフローの成功) を指定することで、マージブロック (A5.3) を実現する。
    * 機密情報 (API キー、PGP 鍵情報など) は GitHub Actions Secrets (A5.6) を使用して管理する。
* **導入方針/備考:**
    * Cairns プロジェクトの品質保証と自動化の中核として位置づける。ワークフローの可読性・保守性を高めるため、将来的に Composite Actions や Reusable Workflows の利用も検討する。

### A6. カスタム検証スクリプト / ツール群 (CI/CD連携) {#h3-a6-custom-validation-scripts-tools}

* **選定ツール:**
    * **カスタム検証スクリプト**: 機能要件 A6.1～A6.4 で定義された Cairns 固有の検証ロジックを実装。言語は **Python** または **Node.js** を推奨 (A3 のスクリプト言語と統一)。
    * **利用ライブラリ (スクリプト内で使用):**
        * ファイルシステム操作 (標準ライブラリ)
        * YAML/Front Matter パーサー (A3 と同じもの: `python-frontmatter`/`PyYAML`, `gray-matter`/`js-yaml`)
        * Markdown パーサー (アンカー抽出用, 例: Python: `markdown`; Node.js: `remark`)
        * 日付/時刻処理 (標準ライブラリ, `moment.js` など)
        * 正規表現 (標準ライブラリ)
        * BCP-47 検証ライブラリ (例: Python: **`langcodes`** (推奨); Node.js: `bcp-47`, `langcodes-js` など)
* **選定理由:**
    * 機能要件 A-6.1 (参照整合性), A-6.2 (ID整合性/一意性), A-6.3 (時間整合性), A-6.4 (言語整合性) は、標準的な Linter/Validator ではカバーできないため、調査レポートの推奨通りカスタムスクリプトの開発が必須。
* **基本設定/CI組み込み:**
    * カスタムスクリプトをリポジトリ内に配置 (例: `scripts/validate.py` または `scripts/validate.js`)。
    * GitHub Actions ワークフローの `run` ステップで、適切な実行環境 (Node.js or Python) をセットアップし、依存ライブラリをインストール後、カスタムスクリプトを実行する。
    * スクリプトは、リポジトリ内の全ドキュメントを走査し、必要な情報を抽出・検証する。検証エラーが発生した場合は、非ゼロの終了コードで終了し、CI ワークフローを失敗させる。
* **導入方針/備考:**
    * A3 (JSON Schema 検証) のスクリプトと統合するか、別ファイルとして実装するかを決定する (言語統一が前提)。
    * **参照整合性検証 (A6.1) のパフォーマンス:** 初期フェーズ (アクションプラン フェーズ1, 2) では全ファイルチェックを基本とするが、ドキュメント数の増加に伴い CI 実行時間が課題となった場合、アクションプランのフェーズ3以降を目処に、差分チェック (例: `tj-actions/changed-files` の利用) やファイル構造/IDインデックスのキャッシングといった最適化策の導入を検討する。
    * **言語整合性検証 (A6.4):** BCP-47 の複雑性を考慮し、調査レポートで推奨されている `langcodes` (Python) のような専用ライブラリの使用を強く推奨する。
    * **エラーメッセージ (A7.3):** 開発者が問題を容易に特定できるよう、具体的で分かりやすいエラーメッセージ (例: 「ファイル X.md のフィールド Y の参照先 Z が見つかりません」) を出力するように実装する。

### A7. 開発者体験 (DX) 支援 {#h3-a7-developer-experience-dx-support}

* **選定ツール:**
    * A1, A2, A3, A6 で選定されたツールの **CLI (Command Line Interface)**。
    * **VSCode 拡張機能:**
        * YAML: `redhat.vscode-yaml` (A1)
        * Markdown: `DavidAnson.vscode-markdownlint` (A2)
* **選定理由:**
    * 機能要件 A-7.1 (ローカル実行容易性), A-7.2 (エディタ連携), A-7.3 (明確なエラーメッセージ) を可能な限り満たすため。
* **基本設定/CI組み込み:**
    * 開発者はローカル環境に各 CLI ツール (yamllint, markdownlint-cli2, A3/A6 用スクリプト実行環境) と VSCode 拡張機能をインストールする。
    * プロジェクトの README 等に、これらのツールのインストール方法とローカルでの実行手順を明記する (A3 DX課題への対策参照)。
* **導入方針/備考:**
    * **最重要課題:** A3 (JSON Schema Validator) における**リアルタイム検証のギャップ (A7.2)**。開発者は、特に Front Matter の複雑なルール (Draft 2020-12 仕様) に関しては、VSCode の表示に頼らず、ローカルで A3 用カスタムスクリプト/CLI を実行して検証する必要があることを周知徹底する。
    * A6 (カスタム検証) についても、リアルタイムのエディタ連携は想定されないため、ローカルでのスクリプト実行が必要。
    * 各ツール (特にカスタムスクリプト) のエラーメッセージ (A7.3) の品質を高く保つことが、DX 維持において重要。

## 3. 推奨 / 将来必要 (Recommended / Future) 要件 (B) 対応ツール {#h2-recommended-future-requirements-b-tools}

### B1. 静的サイトジェネレーター (SSG) {#h3-b1-static-site-generator-ssg}

* **選定ツール:**
    * **Docusaurus** (v3 以降): React/Node.js ベースの静的サイトジェネレーター。
    * **関連プラグイン:** `Arsero/docusaurus-graph` (関係性視覚化用)。
* **選定理由:**
    * 機能要件 B-1.1 (MD/YAMLからの生成), B-1.3 (多言語対応), B-1.4 (検索機能), B-1.5 (カスタマイズ性), B-1.6 (CI/CD連携) を満たす。
    * 調査レポートで強調されている通り、機能要件 **B-1.2 (Front Matter の relationships データに基づく関係性視覚化)** に対して、`docusaurus-graph` プラグインにより**既製ソリューションで対応可能**な点が他の候補 (Hugo, Jekyll, MkDocs) に対する明確なアドバンテージであるため。
* **基本設定/CI組み込み:**
    * Docusaurus プロジェクトをリポジトリ内にセットアップ (`npx create-docusaurus@latest`)。
    * 設定ファイル (`docusaurus.config.js`) で、テーマ、ナビゲーション、フッター、プラグイン (`docusaurus-graph` 等)、i18n (多言語) 設定を行う。
    * GitHub Actions ワークフローで、Node.js 環境をセットアップし、`npm install` で依存関係をインストール後、`npm run build` でサイトをビルドする。
    * ビルドされた静的ファイル (`build` ディレクトリ) を GitHub Pages などにデプロイする Action (例: `peaceiris/actions-gh-pages`) を使用する。
* **導入方針/備考:**
    * `docusaurus-graph` プラグインを活用し、Cairns ドキュメント間の繋がりを視覚化する。
    * サイトのデザインやコンポーネントのカスタマイズには React の知識が必要。
    * 多言語対応 (B1.3) は Docusaurus の i18n 機能 (ファイルシステムベース) を利用する。

### B2. RAG Index 生成ツール / スクリプト (CI/CD連携) {#h3-b2-rag-index-generation-tool-script}

* **選定ツール:**
    * **カスタムスクリプト**: 機能要件 B2.1, B2.2 を満たすスクリプト。言語は **A3/A6 と同じもの (Python or Node.js)** を推奨。
    * **利用ライブラリ (スクリプト内で使用):**
        * A6 と同様のファイル走査・Front Matter/Markdown パーサー。
        * NDJSON 生成ライブラリ (例: Python: **`jsonlines`** (推奨); Node.js: `ndjson`)。
* **選定理由:**
    * `l0-cairns-overview.md` で定義される RAG Index 仕様に基づき、Cairns ドキュメントから情報を抽出・整形して特定のフォーマット (NDJSON) で出力するという、カスタム ETL (Extract, Transform, Load) 処理が必要なため。
* **基本設定/CI組み込み:**
    * カスタムスクリプトをリポジトリ内に配置。
    * GitHub Actions ワークフローで、通常は main ブランチへの `push` イベントをトリガーとして実行。
    * スクリプトは全ドキュメントを解析し、RAG Index 仕様に従ってデータを整形し、選択したライブラリを用いて `index.ndjson` ファイルを生成する。
    * 生成された `index.ndjson` ファイルは、GitHub Artifacts として保存するか、別のブランチやリポジトリにコミット/プッシュするなどの方法で管理する。
* **導入方針/備考:**
    * A3/A6 と同じ言語・パーサーライブラリを共有することで開発・保守効率を高める。
    * 大量のドキュメントを扱う場合、NDJSON 生成にはストリーム処理に対応したライブラリ (Node.js の `ndjson` など) の利用を検討する。

### B3. Checksum 生成・検証ツール / スクリプト (CI/CD連携) {#h3-b3-checksum-generation-validation-tool-script}

* **選定ツール:**
    * **A6 のカスタム検証スクリプトに統合**: 機能要件 B3.1, B3.2 のロジックを A6 スクリプト内に実装。
    * **内部で使用するライブラリ:**
        * Python: **`hashlib`** (標準ライブラリ, Python 3.11+ では `hashlib.file_digest()` 推奨)。
        * Node.js: **`crypto`** (標準ライブラリ)。
* **選定理由:**
    * 調査レポートで推奨されている通り、Checksum 検証は Front Matter のステータス (`APPROVED`/`FIXED` 等) や `checksum` フィールドの値にアクセスする必要があるため、A6 スクリプトに統合するのが最も効率的。
    * 標準ライブラリで SHA256/SHA512 の計算は容易に実装可能。
* **基本設定/CI組み込み:**
    * A6 カスタムスクリプト内で、特定のステータスを持つドキュメントに対して Checksum (SHA256 または SHA512) を計算。
    * 計算した値と Front Matter 内の `checksum` フィールドの値を比較し、不一致の場合はエラーとして報告する。
* **導入方針/備考:**
    * Checksum の計算対象 (Markdown 本文のみか、ファイル全体かなど) を明確に定義する必要がある。

### B4. 署名検証ツール / スクリプト (CI/CD連携) {#h3-b4-signature-validation-tool-script}

* **選定ツール:**
    * **カスタム検証ステップ/スクリプト**: 機能要件 B4.1 を満たす検証ロジック (A6 スクリプトへの統合も可)。
    * **検証ライブラリ/ツール:**
        * Python の場合: **`python-gnupg`** (gpg コマンドが CI Runner 環境に必要)。
        * Node.js の場合: **`openpgp` (OpenPGP.js)** (外部依存なし)。
    * **公開鍵管理:** **GitHub Actions Secrets**。
* **選定理由:**
    * Front Matter の `signed_by` 情報に基づき、PGP 等の電子署名を検証する機能が必要。
    * `python-gnupg` と `openpgp` (JS) は、調査レポートで挙げられた PGP 検証の主要な選択肢。
    * **鍵管理が重要**であり、GitHub Actions Secrets が CI 環境で安全に鍵情報を扱うための現実的な手段。
* **基本設定/CI組み込み:**
    * 検証ステップ/スクリプト内で、選択したライブラリ (`python-gnupg` or `openpgp`) を使用し、Front Matter (`signed_by`) から署名情報 (アルゴリズム、鍵ID、署名値) と署名対象データ (例: Checksum 値 or ドキュメントコンテンツ) を取得。
    * **最重要:** 署名検証に必要な**公開鍵**を **GitHub Actions Secrets** に事前に登録しておく。
    * ワークフロー実行時に Secrets から該当する公開鍵データを読み込み、GPG キーリングに一時的にインポート (`gpg --import`) するか、`openpgp` ライブラリに直接渡して検証を実行する。
    * 検証失敗時はエラーとして報告する。
* **導入方針/備考:**
    * **運用プロセスの確立:** 署名機能 (B4) の本格導入はアクションプランのフェーズ3以降を想定している。それに先立ち、署名者の公開鍵を GitHub Actions Secrets に登録・更新・削除するための具体的な運用プロセスについては、アクションプランのフェーズ2における `l0-governance.md` (ガバナンス文書) の整備と並行して検討を開始し、フェーズ3での機能実装までに確立・文書化することを目指す。このプロセス確立が、B4 機能導入の前提条件となる。
    * `python-gnupg` を採用する場合、CI Runner 環境 (例: Ubuntu) に `gpg` コマンドがインストールされていることを確認 (通常は問題ない)。`openpgp` (JS) は Node.js 環境のみで動作する。A6/A3 と同じ言語を選択すると実装がしやすい。

### B5. LLM 連携ツール / ライブラリ (CI/CD連携・実験的) {#h3-b5-llm-integration-tool-library}

* **選定ツール (選択式):**
    * **API ベース (初期導入推奨):**
        * 埋め込み生成 (B5.1): **OpenAI API** (`text-embedding-3-small`等) または **Cohere API** (`embed-multilingual-v3.0`等)。
        * 要約/キーワード抽出 (B5.2): 上記 API のテキスト生成機能、または専用 API。
    * **ローカルモデルベース (将来検討):**
        * 埋め込み生成 (B5.1): **Sentence-Transformers** (Python ライブラリ, `all-MiniLM-L6-v2` 等のモデルを使用)。
        * 要約 (B5.2): **Hugging Face Transformers** (Python ライブラリ, `pipeline("summarization")`, `facebook/bart-large-cnn` 等)。
    * **キーワード抽出ライブラリ (オプション, B5.2):** **KeyBERT**, **Rake-NLTK**, **YAKE!** (Python)。
    * **API キー管理:** **GitHub Actions Secrets**。
* **選定理由:**
    * 機能要件 B5.1 (意味的類似度検出), B5.2 (要約/キーワード抽出) の実験的な実装のため。
    * 調査レポートの示唆に基づき、実装の容易さから初期は API ベースでの導入を推奨。コスト、プライバシー、性能要件に応じてローカルモデルへの移行を検討。
* **基本設定/CI組み込み:**
    * GitHub Actions ワークフローの専用ステップとして実装 (例: 特定ラベルが付いた PR でのみ実行するなど、実験的運用を考慮)。
    * **API ベースの場合:**
        * GitHub Actions Secrets から API キーを取得。
        * 適切なライブラリ (例: `openai`, `cohere-ai`) を使用して API を呼び出し、埋め込み生成やテキスト生成を行う。
        * 意味的類似度 (B5.1) は、取得した埋め込みベクトル間のコサイン類似度を計算し、閾値と比較して結果を報告。
    * **ローカルモデルベースの場合:**
        * 必要な Python ライブラリ (`sentence-transformers`, `transformers`, `torch` 等) とモデルファイルを CI 環境にインストール/ダウンロード。
        * CI Runner に十分な計算リソース (CPU/メモリ、場合によっては GPU) が必要となる可能性。
        * ライブラリを使用して埋め込み生成、類似度計算、要約生成などを実行。
* **導入方針/備考:**
    * **実験的位置づけ:** 当面はオプション機能とし、効果やコストを評価しながら本格導入を検討。
    * **API vs ローカル:** 実装容易性、APIコスト、データプライバシー、CI実行時間/リソースのトレードオフを考慮して選択・移行を検討。
    * **B5.1 と B2 の連携:** 意味的類似度計算 (B5.1) で使用する埋め込みモデル/API は、RAG Index (B2) の検索品質にも影響するため、一貫した戦略を検討することが望ましい。

## 4. まとめ {#h2-summary}

本ドキュメントで選定されたツール群と導入方針に基づき、Cairns プロジェクトの開発・運用基盤を構築します。特に、以下の点に留意して導入を進めます。

* **CI/CD (GitHub Actions) が中心:** Lint、スキーマ検証、カスタム検証、(将来的には) Checksum/署名検証、RAG Index 生成、SSG ビルド/デプロイなど、多くの品質維持・運用タスクを自動化します。
* **カスタムスクリプトの重要性:** 標準ツールでは対応できない A3 (JSON Schema Draft 2020-12)、A6 (Cairns固有検証)、B2 (RAG Index)、B3 (Checksum)、B4 (署名検証) の要件を満たすため、Python または Node.js によるカスタムスクリプトの開発と保守が鍵となります。言語はアクションプラン フェーズ1完了までを目処に統一します。
* **開発者体験 (DX) への配慮:** A2 (Markdown) では良好な DX が期待できますが、A3 (JSON Schema) のリアルタイム検証には限界があるため、ローカルでの CLI/スクリプト実行の必要性を開発者に周知し、README での手順明記や補助スクリプト提供等の対策を講じます。
* **段階的な導入:** 必須要件 (A) のツールと CI/CD の基本設定を優先的に導入し、推奨/将来要件 (B) のツール (SSG, RAG Index, Checksum/署名検証, LLM連携) はアクションプランに基づき段階的に導入・実装します。特にパフォーマンス (A6.1) や鍵管理 (B4) に関する課題は、プロジェクトの進捗に合わせて計画的に対応します。
* **Secrets 管理:** API キーや PGP 公開鍵などの機密情報は、GitHub Actions Secrets を用いて適切に管理します。特に B4 (署名検証) に関しては、鍵管理の運用プロセス確立が導入の前提条件となります。

これらのツールと方針により、Cairns プロジェクトのドキュメント品質を維持し、開発・運用プロセスを効率化することを目指します。