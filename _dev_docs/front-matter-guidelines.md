# Front Matter 記述ガイドライン {#h1-front-matter-guidelines}

## 1. はじめに {#h2-introduction}

### 1.1. このガイドラインの目的と対象読者 {#h3-purpose-and-audience}

#### 目的 {#h4-purpose}

このガイドラインは、Cairns プロジェクトにおける Markdown ドキュメントの品質、一貫性、および自動処理（検証、インデックス作成、ガバナンス等）を担保するために、ドキュメントのメタデータである **Front Matter** の記述方法を標準化することを目的とします。

主な目的は以下の通りです。

* 開発者やドキュメントコントリビューターが、Cairns プロジェクトの要件（JSON Schema 定義、カスタム検証ルール、命名規則、フォルダ構成など）に準拠し、正確かつ効果的に Front Matter を記述できるよう支援します。
* プロジェクト全体の目標である AI (RAG) 活用促進や開発者体験 (DX) 向上との整合性を確保し、将来のプロジェクト進化（LLM連携深化、ガバナンス強化）に対応できる記述基盤を確立します。
* [`template.md`](templates/template.md) や VSCode 拡張機能だけではカバーしきれない詳細なルール、ベストプラクティス、各フィールドの意図、そして **ローカルでのカスタム検証の重要性** について解説します。

#### 対象読者 {#h4-audience}

このガイドラインは、以下の方々を対象としています。

* Cairns プロジェクトに関わるすべてのドキュメント作成者、編集者、レビュー担当者。
* プロジェクトの技術ツール（CI/CD、検証スクリプト、RAG Indexer、静的サイトジェネレーター等）の開発・保守担当者。
* プロジェクトのアーキテクチャ、情報管理、ガバナンスに関心を持つステークホルダー。

### 1.2. Front Matter の重要性 (一貫性、自動化、AI活用、ガバナンス) {#h3-importance-of-front-matter}

Cairns プロジェクトにおいて、ドキュメントの Front Matter は単なるメタデータではなく、プロジェクト全体の品質と効率性を支える基盤です。その重要性は、以下の4つの観点から理解できます。

* **一貫性の担保 (Consistency):**
    * リポジトリ内のすべてのドキュメントが共通の構造と語彙を持つことを保証し、**開発者の学習コストを削減し、ドキュメント間の関連性の理解を容易にします。**
    * `id` とファイル名の一致、`layer` とフォルダ構造の整合性など、命名規則 ([`naming-conventions.md`](naming-conventions.md) 参照) やフォルダ構成 ([`folder-structure.md`](folder-structure.md) 参照) との連携により、体系的な知識管理を実現し、**ツールによる自動処理の信頼性を向上させます。**
    * [`template.md`](templates/template.md) と本ガイドラインの併用により、記述の標準化を促進します。

* **自動化の基盤 (Automation):**
    * CI/CD パイプラインにおける自動検証（スキーマ準拠、カスタムルールに基づく整合性チェック：ID一意性・命名規則、参照整合性 (リンク切れ検知)、時間整合性、**`core_principles` 記述ルール** 等）を可能にし、ドキュメントの品質を維持し、**ヒューマンエラーを削減します。** ([`devtools-list.md`](devtools-list.md), [`document-map.md`](document-map.md) 参照)
    * 静的サイトジェネレーター (SSG) によるドキュメントサイトの自動構築（ナビゲーション生成、関連ドキュメント表示、メタデータ表示など）を支援し、**情報アクセシビリティを高めます。** ([`devtools-list.md`](devtools-list.md) 参照)

* **AI活用 (RAG) の鍵 (AI Enablement):**
    * `abstract`, `summary`, `keywords`, `core_principles`, `relationships`, `applicable_contexts`, `target_audience` などのフィールドに正確かつ質の高い情報を記述することで、AI（特に RAG システム）によるドキュメントの検索精度、要約生成、関連知識の抽出能力を大幅に向上させ、**開発者の生産性向上や AI エージェントのタスク遂行能力向上に貢献します。** ([`document-map.md`](document-map.md) 参照)
    * 将来の高度な LLM 連携 (例: `llm_usage_hints` の活用) のための基礎となり、**よりインテリジェントなドキュメント活用を実現します。** ([`action-plan.md`](action-plan.md) 参照)

* **ガバナンスとライフサイクル管理 (Governance):**
    * `status`, `version`, `authors`, `owner`, `last_updated`, `created_at`, `review_cycle_days`, `expires_at`, `license`, `checksum`, `signed_by` などのフィールドを通じて、ドキュメントの鮮度、信頼性、責任体制、承認状態を管理・追跡可能にし、**ドキュメントのトレーサビリティと信頼性を確保します。**
    * プロジェクト全体のガバナンスプロセス (例: 承認フロー、定期レビュー) の運用を支え、**コンプライアンス遵守や品質基準の維持に貢献します。** (`l0-governance.md` (作成中) 参照)

### 1.3. 関連ドキュメントへのリンク {#h3-related-documents}

本ガイドラインを理解し、効果的に活用するために、以下の関連ドキュメントを参照することを強く推奨します。

* **JSON Schema:**
    * [`schema/cairns-front-matter.schema.json`](../schema/cairns-front-matter.schema.json): Front Matter の正確な構造、型、必須項目、許容値などを定義する公式な定義。本ガイドラインの記述の根拠となります。
    * [`schema/patterns.schema.json`](../schema/patterns.schema.json): ID やパスなどに使われる正規表現パターンを定義。特定のフィールドのフォーマットを確認する際に参照。
    * (その他: [`schema/common-defs.schema.json`](../schema/common-defs.schema.json), [`schema/content-defs.schema.json`](../schema/content-defs.schema.json), [`schema/metadata-defs.schema.json`](../schema/metadata-defs.schema.json)): より詳細な共通定義や特定フィールド群の定義。

* **情報アーキテクチャと規約:**
    * [`_dev_docs/l0-cairns-overview.md`](../docs/L0-library-overview/l0-cairns-overview.md): Cairns プロジェクト全体の目的、構造、基本方針を解説。本ガイドラインを読む上での前提知識として役立ちます。 *(追加)*
    * [`_dev_docs/document-map.md`](document-map.md): Cairns プロジェクト全体のドキュメント体系 (L0-L5 レイヤー構造)、各ドキュメントの目的、CI で検証される項目などを定義。`layer` や `core_principles` の記述ルールなどを理解するために参照。
    * [`_dev_docs/naming-conventions.md`](naming-conventions.md): フォルダ名、ファイル名、ドキュメント ID (`id`)、原則 ID (`principle_id`) などの命名規則を定義。特に **`id` とファイル名の一致ルール** は厳守事項です。
    * [`_dev_docs/folder-structure.md`](folder-structure.md): リポジトリ全体のフォルダ構成を定義。特に `snippets/`, `media/` 配下へのリソース配置とパス構造のルールを参照。

* **テンプレートとツール:**
    * [`_dev_docs/templates/template.md`](templates/template.md): 新規ドキュメント作成時に使用する基本テンプレート。主要なフィールドと簡単な説明が含まれます。
    * [`_dev_docs/devtools-list.md`](devtools-list.md): プロジェクトで使用される Linter、Validator、CI ツールなどのリスト。特に、**ローカルでのカスタム検証スクリプトの必要性** とその背景 (VSCode 拡張機能の限界等) を理解するために参照。

* **プロジェクト管理と運用:**
    * `_dev_docs/l0-glossary.md` (**作成中：完成次第参照必須**): プロジェクト内で使用される共通の専門用語や略語の定義。
    * `_dev_docs/l0-contribution-guide.md` (**作成中：完成次第参照必須**): ドキュメントの作成・更新プロセス、レビュー手順など、貢献方法の詳細。
    * `_dev_docs/l0-governance.md` (**作成中：完成次第参照必須**): ドキュメントのライフサイクル管理、承認プロセス、`status` 変更に伴う要件 (`checksum`, `signed_by` 等) の詳細。
    * [`_dev_docs/action-plan.md`](action-plan.md): プロジェクト全体の開発計画。AI連携 (RAG) やガバナンス強化など、将来的な方向性を理解する上で参考になります。

-----

## 2. 【最重要】ローカル検証ガイド (DX向上) {#h2-local-validation-guide}

### 2.1. なぜローカル検証が必要か {#h3-why-local-validation-is-needed}

このセクションでは、Cairns プロジェクトにおいて、なぜ CI/CD パイプラインだけに頼るのではなく、開発者自身のローカル環境で Front Matter の検証を行うことが**非常に重要**なのか、その理由を明確に解説します。

ローカル検証は、単なる推奨プラクティスではなく、プロジェクトの品質維持と開発効率向上のために**必須**のプロセスと位置づけられています。その必要性を理解することで、後続セクションで解説する具体的なセットアップや実行手順の意義がより明確になるでしょう。

#### 2.1.1. スキーマだけでは不十分な理由 (Cairns 固有ルール) {#h4-why-schema-is-not-enough}

Cairns プロジェクトでは、Front Matter の記述ルールを定義するために JSON Schema ([`schema/cairns-front-matter.schema.json`](../schema/cairns-front-matter.schema.json) 参照) を活用しています。JSON Schema は、フィールドの有無、データ型、必須/任意、許容される値 (enum)、文字列パターンなどを定義するための強力なツールであり、Draft 2020-12 の高度な機能（条件付き必須項目、レイヤーに応じた必須項目など）も利用しています。

しかし、JSON Schema による検証だけでは、Cairns プロジェクトが要求する全ての品質基準を満たすことはできません。なぜなら、スキーマ定義は主に**構造的な妥当性**を保証するものであり、プロジェクト固有の**意味論的な整合性**や、ファイルシステムなどの**外部リソースとの依存関係**までは検証できないためです (この点はスキーマファイル自身のコメントにも記載されています)。

具体的には、以下のような **Cairns 固有のルール** は、JSON Schema の範囲を超えており、カスタム検証スクリプト ([`devtools-list.md`](devtools-list.md) の A6 参照) によるチェックが必要です。これらのルールは、[`document-map.md`](document-map.md) で定義されている CI 検証項目の一部にも対応しています。これらのルールに違反すると、リンク切れや情報の不整合、CI エラーなど、様々な問題を引き起こす可能性があります。

  * **ID とファイル名の一致:**

      * Front Matter の `id` フィールドの値は、その Markdown ファイルの名前 (拡張子を除く) と完全に一致する必要があります ([`naming-conventions.md`](naming-conventions.md) 参照)。
      * スキーマは `id` の**形式** (例: `^[a-z0-9\\-]+$`) を検証できますが、ファイルシステム上の**ファイル名との照合**はできません。
      * *(違反時の影響例: ツールによるドキュメント間の自動リンク生成や参照解決が失敗したり、開発者が手動で関連ファイルを探す際に混乱が生じます。)*

  * **参照整合性 (リンク切れチェック):**

      * `snippet_refs` ([`schema/patterns.schema.json#pattern-snippetPath`](../schema/patterns.schema.json) 参照) で指定されたスニペットファイルが、**推奨されるパス形式 (`./snippets/<doc-id>/<principle-id>.code.md`) に従っており、かつ実際に存在するか**。
      * `media[].path` で指定された画像などのメディアファイルが実際に存在するか。
      * `relationships[].to`, `references[].doc_id`, `deprecation_info` などで参照される他の Cairns ドキュメント ID や原則 ID (`docId#principleId` 形式) がリポジトリ内に実際に存在するか。
      * `detail_ref` や `core_principles[].detail_ref` などで指定された Markdown 本文中のアンカー (`#anchor-name`) が実際に存在するか。
      * スキーマは参照先のパスや ID の**形式**を検証できますが、その**実在性**までは保証できません。
      * *(違反時の影響例: ドキュメント内にリンク切れが発生したり、存在しないコードスニペットや画像を参照しようとしてエラーとなり、読者の理解を妨げ、ドキュメントの信頼性を損ないます。)*

  * **時間整合性:**

      * `created_at`, `last_updated`, `expires_at` の各フィールド間の時間的な前後関係 (`created_at <= last_updated <= expires_at`) が保たれているか。
      * スキーマは各々が有効な日時形式であることは検証しますが、フィールド間の**値の比較**はできません。
      * *(違反時の影響例: ドキュメントの更新履歴や有効期限の管理に矛盾が生じ、ステータス管理やレビュープロセスの自動化に支障をきたす可能性があります。)*

  * **構造整合性 (例: `core_principles`):**

      * [`document-map.md`](document-map.md) で定義されているように、ドキュメントの `layer` に応じて `core_principles` の記述方法に関するルールがあります (例: `L2` では複数の原則定義が可能だが、`L3` 以上では原則としてドキュメント全体を表す単一の `<doc-id>-main` という ID の原則を定義するなど)。
      * スキーマの `if/then` を使ってレイヤーに応じた `core_principles` フィールド自体の必須化は行っていますが、その**内容** (配列の要素数や特定の ID 命名規則など) に関する詳細なルールは表現しきれません。(これらのカスタムルールの詳細は、本ガイドラインの**セクション 5「カスタム検証ルールの詳細」**で解説します)。
      * *(違反時の影響例: ドキュメントの意図した構造が崩れ、ツールによる原則リストの自動生成や、特定のレイヤーのドキュメントに対する構造的な分析が正しく機能しなくなります。)*

  * **(補足) ID の一意性:**

      * ドキュメント `id` や `core_principles[].principle_id` が、リポジトリ全体やドキュメント内でユニークであることの保証も、スキーマ単体では困難であり、カスタム検証の範囲となります。
      * *(違反時の影響例: 同じIDを持つドキュメントや原則が複数存在すると、参照関係が曖昧になったり、特定の情報を一意に特定できなくなり、システム全体の整合性が崩れます。)*

**結論として、** これらの Cairns プロジェクト固有の品質基準を満たし、ドキュメント間の整合性を保つためには、JSON Schema 検証に加えて、これらのカスタムルールを網羅的にチェックする**専用の検証スクリプトが不可欠**です。

#### 2.1.2. CI 前の早期フィードバック {#h4-early-feedback-before-ci}

Cairns プロジェクトでは、品質保証のため、CI/CD パイプライン (例: GitHub Actions, [`devtools-list.md`](devtools-list.md) A5 参照) において、Pull Request 作成時や main ブランチへのマージ前に、自動的に各種 Lint (YAML, Markdown) や検証 (スキーマ, カスタムルール) を実行する仕組みを導入しています。これは、リポジトリ全体の品質を維持するための**最後の砦**として機能します。

しかし、もしローカル環境で事前に検証を行わず、CI パイプラインで初めてエラーが発見された場合、以下のような非効率が発生します。

  * **フィードバックの遅延:** コードをプッシュしてから CI の実行結果がわかるまで待つ必要があり、問題の発見が遅れます。
  * **手戻りの発生:** CI でエラーが出た場合、ローカルで修正 → 再コミット → 再プッシュ → CI 再実行、という手間のかかるサイクルが発生します。
  * **コンテキストスイッチ:** 他の作業中に CI エラーの通知を受けると、修正のために思考を切り替える必要があり、集中が途切れます。
  * **CI リソースの消費:** エラーと修正の繰り返しにより、貴重な CI の実行時間を無駄に消費します。

これに対し、ローカル環境で検証を行うことで、以下のような大きなメリットが得られます。

  * **超高速フィードバックループ:** ファイルを保存した後やコミットする前に、手元のコマンド一つで**即座に**検証結果を確認でき、迅速に問題を修正できます。
  * **CI エラーの未然防止:** ローカルで問題を潰しておくことで、CI パイプラインでのエラー発生を大幅に減らすことができます。
  * **開発リズムの維持:** 面倒な手戻りが減ることで、思考の流れを止めずにスムーズに開発作業を進められます。
  * **自信の向上:** CI でエラーが出るかもしれないという不安なく、品質を確認した上で自信を持ってコードをプッシュ・共有できます。

**結論として、** ローカル検証は、単に CI の失敗を防ぐだけでなく、開発プロセス全体の効率とスピードを向上させるための**積極的な品質活動**です。CI の結果を待つのではなく、開発者自身が手元で問題を早期に発見し、解決することが強く推奨されます。

#### 2.1.3. DX ギャップの補完 {#h4-complementing-dx-gap}

現代の開発では、VSCode のような高機能なテキストエディタやその拡張機能が、開発者体験 (DX: Developer Experience) の向上に大きく貢献しています。リアルタイムでのエラー検出やコード補完、スタイルチェックなどは、開発の効率と快適性を高める上で非常に有用です。

Cairns プロジェクトでも、以下の VSCode 拡張機能の利用を推奨しており、これらは DX 向上に役立ちます ([`devtools-list.md`](devtools-list.md) A7 参照)。

  * **`redhat.vscode-yaml`:** YAML の構文エラーや、JSON Schema に基づく**基本的な** Front Matter の検証 (フィールドの型、必須項目、enum 値など) をリアルタイムで検知してくれます。
  * **`DavidAnson.vscode-markdownlint`:** Markdown 本文のスタイルや構文に関するルール違反をリアルタイムで検知し、Quick Fix 機能も提供してくれるため、非常に便利です。

しかし、これらの便利な拡張機能をもってしても、Cairns プロジェクトの検証要件を**完全に**カバーすることはできません。ここには、**「DX ギャップ」** と呼ぶべき限界が存在します ([`devtools-list.md`](devtools-list.md) A3, A7 の DX 課題・最重要課題も参照)。

  * **JSON Schema の高度な機能サポートの限界:**

      * Cairns の Front Matter スキーマは、JSON Schema Draft 2020-12 の高度な機能 (例: `$dynamicRef`) を利用しています。しかし、`redhat.vscode-yaml` をはじめとする一部の VSCode 拡張機能では、これらの最新機能が**完全にはサポートされていない**可能性があります。
      * その結果、**エディタ上ではエラーが表示されていないにも関わらず、実際にはスキーマ違反である**、という状況が発生し得ます。これは混乱を招き、DX を損なう原因となります。

  * **カスタム検証ルールの非対応:**

      * 前述 (2.1.1) の通り、Cairns プロジェクトには ID とファイル名の一致、参照整合性、時間整合性など、**プロジェクト固有のカスタム検証ルール**が多数存在します。
      * これらのカスタムルールは、**汎用的な VSCode 拡張機能では原理的にチェックすることができません**。

この DX ギャップが存在するため、開発者は**エディタのリアルタイムフィードバックだけを過信することはできません**。

そこで重要になるのが、後続セクション (2.2, 2.3) で詳しく解説する**ローカル検証スクリプト**です。このスクリプトは、まさにこの DX ギャップを埋めるために用意されています。

  * JSON Schema の**完全な**検証 (Draft 2020-12 の高度な機能を含む) を、CI 環境と同じライブラリ (例: Ajv, jsonschema) を使って実行します。
  * **全ての** Cairns 固有カスタム検証ルールを実行します。

ローカル検証スクリプトは、開発者が手元で実行できる、**プロジェクトの全ルールを網羅する、最も信頼性の高い検証手段**です。

**結論として、** ローカル検証は、IDE や拡張機能が提供するリアルタイムフィードバックの限界 (DX ギャップ) を補完し、記述した Front Matter が Cairns プロジェクトの全ての品質基準を満たしていることを開発者自身が**確実に**確認するための**必須プロセス**です。IDE の支援は最大限に活用しつつも、最終的な検証、特にコミットやプッシュ前の確認は、ローカル検証スクリプトで行う習慣をつけましょう。

-----

### 2.2. 検証環境のセットアップ {#h3-validation-environment-setup}

このセクションでは、Cairns ドキュメントの Front Matter と本文の品質を、開発者自身のローカル環境で完全に検証するために必要な環境構築の手順を解説します。

セクション 2.1 で述べたように、Cairns プロジェクトでは JSON Schema だけでは検証しきれない独自のルールが存在し、また、CI/CD パイプラインでのエラー検出を待つよりもローカルで早期に問題を特定することが開発効率と品質向上の鍵となります。VSCode などのエディタ拡張機能は有用ですが、それだけでは検証範囲 (特にカスタムルールや最新のスキーマ機能) に限界 (DX ギャップ) があります。

ここで説明するセットアップを行うことで、CI 環境と同等の検証レベルをローカルで実現し、次セクション 2.3 で示す検証コマンドを実行できるようになります。

#### 2.2.1. 前提となるツール {#h4-prerequisite-tools}

ローカル検証スクリプトを実行するために、事前に以下のツールがご自身の開発環境にインストールされている必要があります。

  * **Node.js:**

      * カスタム検証スクリプト (JavaScript) の実行環境として使用します。
      * npm (Node Package Manager) も同時にインストールされ、依存ライブラリの管理に使用します。
      * **バージョン:** `v18.x LTS` 以降 (プロジェクト推奨バージョン。プロジェクトで特定のバージョンが要求される場合は `package.json` の `engines` フィールドを確認してください。このフィールドが設定されていると、`npm install` 時に互換性のない Node.js/npm バージョンでの実行を警告または防止します)。
      * **インストールガイド:** [Node.js 公式サイト](https://nodejs.org/) からダウンロードするか、[Volta](https://volta.sh/) や [nvm](https://github.com/nvm-sh/nvm) といったバージョンマネージャの使用を推奨します。

  * **npm (Node Package Manager):**

      * Node.js に同梱されるパッケージマネージャです。検証スクリプトが必要とする依存ライブラリ (例: `ajv`, `gray-matter`) のインストールと管理に使用します。
      * **バージョン:** Node.js に同梱されるバージョン (例: `v9.x` 以降)。
      * **インストールガイド:** Node.js と共にインストールされます。

  * **Git:**

      * Cairns プロジェクトのリポジトリをローカルにクローン (取得) し、バージョン管理を行うために必要です。
      * **バージョン:** 最新の安定版を推奨します。
      * **インストールガイド:** [Git 公式サイト](https://git-scm.com/) を参照してください。

> **注意:**
> カスタム検証スクリプトの言語選択 (Node.js or Python) は [`devtools-list.md`](devtools-list.md) (A3, A6) に基づきます。ここでは、**Node.js が選択されたことを前提**として説明しています。もし Python が選択された場合は、Python 実行環境 (`python`) とパッケージマネージャ (`pip`) が前提ツールとなり、依存関係のインストールには `pip install -r requirements.txt` 等のコマンドが必要になります。

#### 2.2.2. セットアップ手順とコマンド例 {#h4-setup-procedure-and-commands}

検証に必要な依存ライブラリをインストールします。

1.  **リポジトリの準備と依存ライブラリのインストール**

    まず、プロジェクトの **`README.md`** に記載されている手順に従って、Cairns リポジトリをローカルにクローンし、プロジェクトのルートディレクトリに移動してください。

    次に、プロジェクトルートディレクトリで以下のコマンドを実行し、必要な依存ライブラリをインストールします。Cairns プロジェクトでは、検証スクリプトを含む開発に必要な依存ライブラリがプロジェクトルートの `package.json` ファイルに定義されています。

    ```bash
    # プロジェクトルートディレクトリで実行
    npm install
    ```

      * **補足:** このコマンドにより、開発に必要な全ての依存関係 (`dependencies` および `devDependencies`) が `node_modules` ディレクトリにインストールされます。これには、Front Matter の検証に必要なライブラリ (例: `ajv`, `gray-matter` など、通常 `devDependencies` に含まれます) も含まれます。具体的なライブラリやバージョンについては、[`devtools-list.md`](devtools-list.md) の A3, A6 やプロジェクトの `package.json` を参照してください。カスタム検証スクリプトもこれらのライブラリを利用します。
      * **注意:** プロジェクトによっては、セットアップ手順を簡略化するために `Makefile` などでラップされたコマンド (例: `make setup` や `make install-dev`) が用意されている場合があります。その場合は、**`README.md` に記載されているセットアップ手順を優先**してください。

    このステップが完了すると、ローカル環境で検証スクリプトを実行する準備が整います。次セクション 2.3 では、実際に検証を実行する方法について解説します。

-----

### 2.3. 検証の実行方法 {#h3-how-to-run-validation}

セクション 2.1 で述べた通り、Cairns 固有のルール検証や CI 前の早期フィードバック、そして VSCode 拡張機能だけでは埋められない DX ギャップの補完のため、ローカル環境での検証が不可欠です。
ここでは、その具体的な実行方法を解説します。VSCode 拡張機能による基本的なスキーマ検証と、プロジェクトの全ルールを網羅するカスタム検証スクリプトによる完全検証の2つの方法を説明します。
CI/CD パイプラインでのエラーを未然に防ぎ、開発効率を高めるために、特に後者のカスタム検証スクリプトの実行を強く推奨します。

#### 2.3.1. 基本的なスキーマ検証 (VSCode 拡張機能) {#h4-basic-schema-validation-vscode}

VSCode 拡張機能 ([`redhat.vscode-yaml`](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml) など) を利用した、リアルタイムに近い基本的なスキーマ検証の方法とその限界について説明します。
手軽に始められる一方、Cairns プロジェクトの全てのルールをカバーできない点に注意が必要です。

##### 2.3.1.1. 簡単な使い方 {#h5-simple-usage}

1.  **VSCode でファイルを開く:** YAML Front Matter を含む `.md` ファイルを VSCode で開きます。
2.  **拡張機能の確認:**
    * [`redhat.vscode-yaml`](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml) 拡張機能がインストールされ、有効になっていることを確認してください。
3.  **スキーマの関連付け設定:**
    * プロジェクトのスキーマ定義ファイル ([`schema/cairns-front-matter.schema.json`](../schema/cairns-front-matter.schema.json)) が、VSCode の設定 (`.vscode/settings.json` またはユーザー設定) で Markdown ファイル内の YAML に関連付けられている必要があります。以下は、プロジェクトルートに `.vscode/settings.json` を作成または編集する場合の設定例です。*(リポジトリに設定例がある場合は、[`.vscode/settings.json.example`](../.vscode/settings.json.example) などを参照してください)*

        ```json
        // .vscode/settings.json の例
        {
          "yaml.schemas": {
            // プロジェクトルートからの相対パスでスキーマファイルを指定
            "./schema/cairns-front-matter.schema.json": [
              // どのファイルパターンの YAML に適用するかを指定
              "docs/**/*.md"
              // 必要に応じて他のパターンも追加可能
            ]
          }
        }
        ```
4.  **リアルタイム検証の確認:**
    * 上記設定が正しければ、エディタがリアルタイムで基本的なスキーマ違反 (例: フィールドのデータ型間違い、必須フィールドの欠落、`enum` で定義されていない値の使用など) を検出し、問題箇所に波線などで表示します。
    * 問題箇所にマウスカーソルを合わせると、エラーの詳細メッセージが表示され、修正のヒントを得られます。

##### 2.3.1.2. 限界 (カスタムルール非対応等) {#h5-limitations-no-custom-rules}

* **最重要:** この VSCode 拡張機能による検証は、あくまで**基本的なスキーマ構造のチェック**に限定されます。以下の Cairns プロジェクト固有のルールや整合性チェックは**行われません**。これらは後述する**カスタム検証スクリプトでのみ検証可能**です。

* **カスタムルールの非対応:**
    * **ID とファイル名の一致:** Front Matter `id` とファイル名が一致するか ([`naming-conventions.md`](naming-conventions.md) 参照)。
    * **参照整合性 (リンク切れチェック):**
        * `snippet_refs` で指定されたスニペットファイルが存在し、**パス形式が規約 ([`folder-structure.md`](folder-structure.md) 4.3 参照) に従っているか**。
        * `media[].path` で指定されたメディアファイルが存在するか。
        * `relationships[].to`, `references[].doc_id`, `deprecation_info` などで参照されるドキュメントIDや原則ID (`docId#principleId`) がリポジトリ内に存在するか。
        * `detail_ref` や `core_principles[].detail_ref` などで指定された Markdown 本文中のアンカー (`#anchor-name`) が存在するか。
    * **時間整合性:** `created_at` <= `last_updated` <= `expires_at` が満たされているか。
    * **構造整合性:** `layer` に応じた `core_principles` の記述ルール（例: L3+での単一原則ルール）が守られているか ([`document-map.md`](document-map.md) 参照)。
    * **ID の一意性:** ドキュメント `id` やドキュメント内の `principle_id` がユニークか。
    * *(これらのカスタムルールの詳細については、[セクション 5「カスタム検証ルールの詳細」](#h2-custom-validation-rule-details) を参照してください。)*

* **JSON Schema Draft 2020-12 高度機能のサポート限界:**
    * 本プロジェクトのスキーマ ([`schema/cairns-front-matter.schema.json`](../schema/cairns-front-matter.schema.json)) では、`$dynamicRef` などの Draft 2020-12 の高度な機能を利用しています。
    * [`redhat.vscode-yaml`](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml) 拡張機能は、これらの機能を**完全にはサポートしていない可能性**があります ([`devtools-list.md`](devtools-list.md) A3 DX課題参照)。
    * その結果、**エディタ上ではエラーが表示されなくても、実際にはスキーマ違反である可能性**があります。

* **結論:** VSCode 拡張機能はコーディング中の補助として非常に有用ですが、Cairns の品質基準を完全に満たすためには、コミット前などに**必ずカスタム検証スクリプトによる検証を実行**してください。

#### 2.3.2. 推奨： カスタム検証スクリプトによる完全検証 {#h4-recommended-full-validation-script}

Cairns プロジェクトの **全ての** 検証ルール (JSON Schema の厳密なチェック + 独自のカスタムルール) を網羅的にチェックするための、**強く推奨される** 検証方法です。
セクション 2.1.3 で述べた VSCode 拡張機能の限界 (DX ギャップ) を完全に補完し、CI/CD パイプラインで実行される内容と同じレベルの検証をローカルで実行できます。これにより、プロジェクトの品質を確実に担保します。
この検証は、セクション 2.2 でセットアップした環境で実行します。

##### 2.3.2.1. 実行コマンド例 {#h5-execution-command-examples}

* **実行場所:** プロジェクトのルートディレクトリで以下のコマンドを実行します。
* **コマンド:** 以下のコマンドは通常、[`package.json`](../package.json) の `scripts` セクションで定義されています。
    *(**重要:** 実際のスクリプト名 (`validate`, `validate:all` 等) はプロジェクトによって異なる場合があります。必ず [`package.json`](../package.json) の `scripts` セクションを確認してください。)*

    * **特定のファイルまたはディレクトリを対象に実行する場合:**
        ```bash
        npm run validate <ファイルパス または ディレクトリパス>

        # 例1: 特定の Markdown ファイルを検証
        # npm run validate docs/L2-principles/l2-design-principles.md

        # 例2: 特定のディレクトリ配下の全 Markdown ファイルを検証
        # npm run validate docs/L4-domain/js-stack/
        ```
    * **リポジトリ内の全てのドキュメントを対象に実行する場合:**
        ```bash
        npm run validate:all
        # または (プロジェクトの設定によっては):
        # npm run validate
        ```
* **(オプション) Makefile:** プロジェクトによっては `Makefile` で実行コマンドがラップされている場合もあります。その場合は `README.md` 等の指示に従ってください。
    ```bash
    # 例: Makefile が定義されている場合
    # make validate
    ```
* **実行結果:**
    * 検証に成功した場合 (エラーがない場合): コマンドは通常、成功を示す終了コード `0` で終了し、成功メッセージが表示されます。
    * 検証に失敗した場合 (エラーがある場合): 発見されたエラーの詳細メッセージがコンソールに出力され、コマンドは失敗を示す非ゼロの終了コード (例: `1`) で終了します。

##### 2.3.2.2. コマンド内容の説明 {#h5-command-description}

上記の `npm run validate` (または同等のコマンド) は、内部でカスタム検証スクリプト (例: [`scripts/validate.js`](../scripts/validate.js) や [`scripts/validate_cairns_rules.js`](../scripts/validate_cairns_rules.js) など、実際のスクリプト名はプロジェクトの実装によります) を呼び出しています。このスクリプトは、以下のステップで検証を実行します。

1.  **対象ファイルの探索:** コマンドライン引数で指定されたパス、またはリポジトリ全体から、検証対象となる Markdown ファイル (`.md`) を特定します。
2.  **Front Matter の抽出:** 特定された各 Markdown ファイルから、YAML Front Matter 部分を抽出・パースします (例: `gray-matter` ライブラリを使用)。
3.  **JSON Schema 検証 (厳密):** 抽出した Front Matter オブジェクトを、CI 環境と同じ JSON Schema バリデーターライブラリ (例: `ajv` または `jsonschema` など、[`devtools-list.md`](devtools-list.md) A3 参照) を用いて、[`schema/cairns-front-matter.schema.json`](../schema/cairns-front-matter.schema.json) に対して**厳密に**検証します。これには Draft 2020-12 の高度な機能の検証も含まれます。
4.  **カスタムルール検証:** JSON Schema 検証をパスしたドキュメントに対して、プロジェクト固有のカスタムルールをチェックします。これには、[セクション 2.3.1.2](#h5-limitations-no-custom-rules) で挙げた以下の項目などが含まれます:
    * ID とファイル名の一致
    * 参照整合性 (スニペット、メディア、ドキュメントID、原則ID、アンカー等の存在確認)
    * 時間整合性 (`created_at`, `last_updated`, `expires_at` の順序)
    * 構造整合性 (`core_principles` の記述ルールなど)
    * ID の一意性
    * *(カスタムルールの詳細については、[セクション 5「カスタム検証ルールの詳細」](#h2-custom-validation-rule-details) を参照してください。)*
5.  **結果の表示:** 全ての検証が成功した場合は、成功した旨のメッセージを表示します。エラーが検出された場合は、どのファイルのどの部分で、どのルールに違反したかの詳細なエラーメッセージをコンソールに出力します。

* **ポイント:**
    * このカスタム検証スクリプトによる検証が、CI/CD パイプラインで実行されるものと**同等レベル**であり、プロジェクトの品質基準を満たしていることを確認するための**最も信頼性の高いローカル検証手段**です。
    * コミットや Pull Request を作成する前には、**必ずこの検証を実行し、エラーが出ないことを確認**してください。
    * 検証でエラーが発生した場合の具体的なエラーメッセージ例とその解決策については、次セクション [2.4 よくあるエラーとその対処法](#h3-common-errors-and-solutions) で詳しく解説します。

-----

### 2.4. よくあるエラーとその対処法 {#h3-common-errors-and-solutions}

このセクションでは、セクション 2.3.2 で解説したカスタム検証スクリプトを実行した際に遭遇する可能性のある、典型的なエラーメッセージとその原因、具体的な対処法を解説します。
ここで紹介するエラーは、JSON Schema による構造的な違反と、Cairns プロジェクト固有のカスタムルール違反に大別されます。
これらのエラーをローカルで早期に特定し修正することで、CI/CD パイプラインでの失敗を防ぎ、開発プロセスをスムーズに進めることができます。

#### 2.4.1. スキーマ違反エラー (例) {#h4-schema-violation-errors}

カスタム検証スクリプトは、まず [`schema/cairns-front-matter.schema.json`](../schema/cairns-front-matter.schema.json) に基づいて Front Matter の基本的な構造を検証します (セクション 2.3.2.2 ステップ 3 参照)。
ここでは、このスキーマ検証でよく発生するエラーの例を示します。

**注意:** VSCode 拡張機能 (`redhat.vscode-yaml` 等) でも、これらの基本的なスキーマ違反の一部はリアルタイムで検出される可能性があります。しかし、セクション 2.1.3 および 2.3.1.2 で述べた通り、拡張機能は JSON Schema Draft 2020-12 の高度な機能 (例: `$dynamicRef`) を完全にはサポートしていない可能性があり、またカスタムルールは一切検証できません。したがって、**カスタム検証スクリプトによるチェックが、スキーマ適合性を確認する最も信頼性の高い方法であり、コミット前には必須**となります。

##### 2.4.1.1. 型間違い {#h5-type-mismatch}

  * **典型的なエラーメッセージ:**

    ```
    Error: Schema validation failed for 'docs/L2-principles/l2-sample.md':
     - Path: /review_cycle_days | Message: must be integer | Details: {"type":"integer"} | Value: "90"
    ```

  * **原因:**
    Front Matter のフィールドに、JSON Schema で定義されたデータ型 (例: `string`, `integer`, `boolean`, `array`, `object`) と異なる型の値が指定されています。
    上記例では、`review_cycle_days` フィールド (スキーマ定義: `metadata-defs.schema.json` -> `integer`) に文字列 (`"90"` など) が指定されている場合に発生します。
    各フィールドの正しいデータ型は [`schema/cairns-front-matter.schema.json`](../schema/cairns-front-matter.schema.json) およびそれが参照する `*-defs.schema.json` ファイルで定義されています。

  * **対処法:**

    1.  エラーメッセージで指摘されたフィールド (`review_cycle_days` など) とその値 (`Value: "90"` など) を確認します。
    2.  エラーメッセージ内の期待される型 (`Message: must be integer` など) や、`_dev_docs/front-matter-guidelines.md` のフィールド解説セクション、または [`schema/cairns-front-matter.schema.json`](../schema/cairns-front-matter.schema.json) (及び関連スキーマ) を参照し、該当フィールドに期待される正しいデータ型 (例: `integer`) を確認します。
    3.  値を正しいデータ型に修正します (例: `"90"` (文字列) を `90` (数値) に修正)。

##### 2.4.1.2. パターン不一致 (`id` 等) {#h5-pattern-mismatch-id}

  * **典型的なエラーメッセージ:**

    ```
    Error: Schema validation failed for 'docs/L2-principles/L2-Sample_Doc.md':
     - Path: /id | Message: must match pattern "^[a-z0-9\\-\\.]+$" | Details: {"pattern":"^[a-z0-9\\-\\.]+$"} | Value: "L2-Sample_Doc"
    ```

  * **原因:**
    Front Matter のフィールドに、JSON Schema ([`schema/patterns.schema.json`](../schema/patterns.schema.json)) で定義された正規表現パターン (`pattern`) に一致しない値が指定されています。
    上記例は、`id` フィールド ([`patterns.schema.json#pattern-docId`](../schema/patterns.schema.json)) で、許可されていない文字 (例: 大文字 `L`, `S`, `D` やアンダースコア `_`) が使用されている場合に発生します。
    **重要:** スキーマパターン (`^[a-z0-9\\-\\.]+$`) ではドット (`.`) が許可されていますが、Cairns の命名規則 ([`naming-conventions.md`](naming-conventions.md)) では**ハイフン (`-`) のみを推奨**しています。カスタム検証スクリプトは ID 整合性チェック (2.4.2.1 参照) で**命名規則違反も検出**するため、スキーマのパターンには一致していても、命名規則違反としてエラーになる可能性があります。**混乱を避けるため、常に [`naming-conventions.md`](naming-conventions.md) の規約に従うことを強く推奨します。**
    他にも `version` (SemVer [`patterns.schema.json#pattern-semVer`](../schema/patterns.schema.json))、`language` (BCP-47 [`patterns.schema.json#pattern-bcp47LangCode`](../schema/patterns.schema.json)) など、多くのフィールドでパターンが定義されています。

  * **対処法:**

    1.  エラーメッセージで指摘されたフィールド (`id` など) とその値 (`Value: "L2-Sample_Doc"` など) を確認します。
    2.  エラーメッセージ内の期待されるパターン (`Message: must match pattern "..."` など) や、`_dev_docs/front-matter-guidelines.md` のフィールド解説、[`schema/patterns.schema.json`](../schema/patterns.schema.json)、そして**最優先で [`naming-conventions.md`](naming-conventions.md) を参照**し、期待されるフォーマットを確認します。
    3.  値をパターンおよび**命名規則**に一致するように修正します (例: `id` を小文字とハイフンのみに修正: `'L2-Sample_Doc'` -> `'l2-sample-doc'`)。

##### 2.4.1.3. 日時フォーマット (`last_updated` 等) {#h5-datetime-format-last-updated}

  * **典型的なエラーメッセージ:**

    ```
    Error: Schema validation failed for 'docs/L3-process/l3-workflow.md':
     - Path: /last_updated | Message: must match format "date-time" | Details: {"format":"date-time"} | Value: "2025/04/30 10:00"
    ```

  * **原因:**
    日時の指定が期待されるフィールド (`created_at`, `last_updated`, `expires_at`) に、JSON Schema で定義された `date-time` フォーマット (ISO 8601 形式) に従わない値が指定されています。
    スキーマ ([`cairns-front-matter.schema.json`](../schema/cairns-front-matter.schema.json)) ではこれらのフィールドに `format: date-time` が指定されています。

  * **対処法:**

    1.  エラーメッセージで指摘された日時フィールド (`last_updated` など) とその値 (`Value: "2025/04/30 10:00"` など) を確認します。
    2.  値を **ISO 8601 形式** (`YYYY-MM-DDTHH:mm:ssZ` または `YYYY-MM-DDTHH:mm:ss+HH:mm` / `-HH:mm`) に修正します。
    3.  例: `'2025/04/30 10:00'` -> `'2025-04-30T10:00:00Z'` (UTCの場合) または `'2025-04-30T10:00:00+09:00'` (JSTの場合)。
    4.  **推奨:** タイムゾーンオフセットを含めることで曖昧さをなくします。UTC (`Z`) またはローカルタイムゾーンのオフセット (例: `+09:00`) を明記してください。

#### 2.4.2. カスタム検証ルール違反エラー (例) {#h4-custom-rule-violation-errors}

JSON Schema による基本的な構造チェックに加え、カスタム検証スクリプトは Cairns プロジェクト固有のルール (セクション 2.1.1 で解説) をチェックします (セクション 2.3.2.2 ステップ 4 参照)。
これらのルールは、ドキュメント間の整合性やプロジェクトの規約 ([`document-map.md`](document-map.md), [`naming-conventions.md`](naming-conventions.md), [`folder-structure.md`](folder-structure.md) 等) を維持するために重要です。ここでは、これらのカスタムルール違反でよく発生するエラーの例を示します。
これらのエラーは VSCode 拡張機能では検出できません。

**注記:** ここに示すエラーメッセージ例 (`Error [Custom Rule]: ...`) は、カスタム検証スクリプトがより詳細な情報を提供するために整形したものです。実際の出力はスクリプトの実装によって若干異なる場合があります。

##### 2.4.2.1. ID 整合性違反 {#h5-id-consistency-violation}

  * **典型的なエラーメッセージ:**

    ```
    Error [Custom Rule]: ID inconsistency detected in 'docs/L2-principles/l2-sample_doc.md'.
    Front matter 'id' ('l2-sample-doc') does not match the expected filename derived from the path ('l2-sample_doc').
    Please ensure the filename (excluding '.md') matches the 'id' field and follows naming conventions. (Ref: naming-conventions.md)
    ```

    または (ドキュメントID重複)

    ```
    Error [Custom Rule]: Unique ID violation detected. Document ID 'l2-duplicate-id' found in 'docs/L2-principles/new-doc.md' is already used by 'docs/L2-principles/existing-doc.md'.
    Document IDs must be unique across the entire repository.
    ```

    または (原則ID重複)

    ```
    Error [Custom Rule]: Duplicate principle ID 'duplicate-principle-id' found within 'docs/L2-principles/l2-some-principles.md'.
    Principle IDs must be unique within the same document.
    ```

  * **原因:**
    Cairns プロジェクトの重要なルールである ID に関する整合性違反です ([`devtools-list.md`](devtools-list.md) A6.2, [`document-map.md`](document-map.md) CI 検証項目参照)。

      * **ID とファイル名の不一致:** Front Matter の `id` フィールドの値が、その Markdown ファイルのファイル名 (拡張子 `.md` を除く) と完全に一致していません。このルールは [`naming-conventions.md`](naming-conventions.md) で定義されています。
      * **ドキュメント ID の重複:** 定義されたドキュメント `id` が、リポジトリ内の他のドキュメントで既に使用されています。ドキュメント ID は Cairns 全体で一意である必要があります。
      * **原則 ID の重複:** `core_principles` 配列内で、同じ `principle_id` が複数回定義されています。原則 ID は同一ドキュメント内で一意である必要があります。

  * **対処法:**

      * **ID とファイル名の不一致の場合:**
        1.  エラーメッセージで指摘されたファイルの `id` フィールドとファイル名を確認します。
        2.  [`naming-conventions.md`](naming-conventions.md) を参照し、命名規則 (小文字、ハイフン区切り推奨) を確認します。
        3.  `id` フィールドの値かファイル名のどちらか (または両方) を修正し、完全に一致させます。ファイル名を変更する場合は、Git の履歴追跡のため `git mv` コマンドの使用を推奨します ([`document-map.md`](document-map.md) 運用ベストプラクティス参照)。
      * **ドキュメント ID の重複の場合:**
        1.  エラーメッセージで指摘された重複している ID とファイルパスを確認します。
        2.  新しく作成または編集しているドキュメントの `id` を、リポジトリ内で一意となるように変更します。
        3.  変更後の `id` がファイル名と一致していることも確認します。
      * **原則 ID の重複の場合:**
        1.  エラーメッセージで指摘されたドキュメントファイル内の `core_principles` 配列を確認します。
        2.  重複している `principle_id` を特定し、ドキュメント内で一意になるように修正します。

##### 2.4.2.2. スニペット参照整合性違反 {#h5-snippet-reference-violation}

  * **典型的なエラーメッセージ:**

    ```
    Error [Custom Rule]: Broken snippet reference found in 'docs/L2-principles/l2-design-principles.md'.
    Path './snippets/l2-design-principles/srp_good.code.ts' specified in 'core_principles[0].snippet_refs[0]' does not exist.
    Please check the path and ensure the snippet file exists.
    ```

    または

    ```
    Error [Custom Rule]: Invalid snippet path format found in 'docs/L2-principles/l2-design-principles.md'.
    Path '../snippets/srp_good.code.ts' specified in 'core_principles[0].snippet_refs[0]' does not follow the required convention: './snippets/<doc-id>/<principle-id>.code.md'.
    (Ref: folder-structure.md#43-snippets, patterns.schema.json#pattern-snippetPath)
    ```

  * **原因:**
    `core_principles[].snippet_refs` で指定されたコードスニペットファイルへの参照に問題があります ([`devtools-list.md`](devtools-list.md) A6.1, [`document-map.md`](document-map.md) CI 検証項目参照)。

      * **ファイルが存在しない:** 指定されたパス (`./snippets/...` 形式) にファイルが存在しません。
      * **パス形式が規約違反:** スニペットファイルのパスが、推奨される形式 (`./snippets/<doc-id>/<principle-id>.code.md`) に従っていません。このパス形式は [`folder-structure.md#h3-snippets-directory`](folder-structure.md#h3-snippets-directory) で定義されており、参照元ドキュメントと原則を明確にするための規約です。スキーマ ([`patterns.schema.json#pattern-snippetPath`](../schema/patterns.schema.json)) では、この形式 (拡張子が `.code.md`) が定義されています。カスタム検証スクリプトはこのスキーマ定義と規約に基づいてチェックを行います。**.code.md 以外の拡張子を使用したい場合は、規約やスキーマの改訂が必要になる可能性があります。**
      * **補足:** 同様の参照整合性チェックは `media[].path` (画像等)、`relationships[].to`, `references[].doc_id`, `deprecation_info` (他ドキュメント/原則 ID)、`detail_ref`, `core_principles[].detail_ref` (Markdown 内アンカー) など、他の参照フィールドに対しても行われます ([`devtools-list.md`](devtools-list.md) A6.1)。これらのエラーもファイル/ID/アンカーが存在しない、または形式が不正な場合に同様のパターンで発生します。**これらのフィールドに関する具体的なエラー例や詳細な検証ルールについては、[セクション 5「カスタム検証ルールの詳細」](#h2-custom-validation-rule-details) で網羅的に解説します。**

  * **対処法:**

    1.  エラーメッセージで指摘された参照元のドキュメントファイル (`l2-design-principles.md` など) と、参照先のパス (`./snippets/...` など) を確認します。
    2.  **ファイルが存在しない場合:**
          * `snippets/` ディレクトリ以下を確認し、ファイル名やパスが正しいか確認します。タイプミスがないか注意してください。
          * もしファイルが存在しない場合は、正しいファイルを作成するか、Front Matter の参照を修正・削除します。
    3.  **パス形式が規約違反の場合:**
          * [`folder-structure.md#h3-snippets-directory`](folder-structure.md#h3-snippets-directory) および [`patterns.schema.json#pattern-snippetPath`](../schema/patterns.schema.json) を参照し、正しいパス構造 (`./snippets/<doc-id>/<principle-id>.code.md`) を確認します。
          * 参照元ドキュメントの `id` と、関連する原則の `principle_id` を使用して、正しいパスを構築します。
          * スニペットファイルを正しいパスに移動するか、Front Matter の参照パスを修正します。
          * **重要:** パスは必ず `./` で始まる相対パスである必要があります。拡張子は現時点では `.code.md` に従ってください。
    4.  他の参照フィールド (メディア、ドキュメントID、アンカー等) で同様のエラーが出た場合も、参照先が存在するか、ID やアンカー名が正しいかを確認・修正します。Markdown 本文内のアンカー (`{<level>-<topic-slug>}` または見出しの自動生成アンカー) が正しく設定されているかも確認してください。

##### 2.4.2.3. Core Principle 構造違反 (L3+) {#h5-core-principle-structure-violation-l3plus}

  * **典型的なエラーメッセージ:**

    ```
    Error [Custom Rule]: Core principle structure violation in L3 document 'docs/L3-process/l3-dev-workflow.md'.
    Expected 1 core principle representing the document, but found 2 principles defined.
    For L3+ documents, typically only one principle summarizing the document is expected. (Ref: document-map.md)
    ```

    または

    ```
    Error [Custom Rule]: Core principle structure violation in L3 document 'docs/L3-process/l3-dev-workflow.md'.
    The single core principle ID 'main-principle' does not follow the recommended naming convention '<doc-id>-main'. Expected ID 'l3-dev-workflow-main'. (Ref: document-map.md)
    ```

    または

    ```
    Error [Custom Rule]: Missing required field 'core_principles' in L2 document 'docs/L2-principles/l2-missing-principles.md'.
    Core principles are required for documents in layers L0-L4. (Ref: document-map.md, cairns-front-matter.schema.json)
    ```

  * **原因:**
    `core_principles` フィールドの記述方法が、ドキュメントのレイヤー (`layer`) に関するルール ([`document-map.md`](document-map.md) で定義) やスキーマ ([`cairns-front-matter.schema.json`](../schema/cairns-front-matter.schema.json)) に違反しています。カスタム検証スクリプト ([`devtools-list.md`](devtools-list.md) A6) および CI (`document-map.md`) でチェックされます。

      * **L3 以上のドキュメントでの原則数:** [`document-map.md`](document-map.md) では、L3 以上のドキュメント (プロセス、ガイドライン等) では、原則としてドキュメント全体の主題を示す**単一の**原則 (`core_principles` 配列の要素数が 1) を定義することを推奨しています。上記例では、L3 ドキュメントに複数の原則が定義されている場合にエラーとなります。
      * **L3 以上のドキュメントでの原則 ID 命名:** L3 以上で単一原則を定義する場合、その `principle_id` は `<doc-id>-main` という形式 (例: `l3-dev-workflow-main`) にすることを推奨しています ([`document-map.md`](document-map.md))。これにより、その原則がドキュメント全体を表すものであることが明確になります。
      * **必須フィールドの欠落:** L0-L4 レイヤーのドキュメントでは `core_principles` フィールド自体が必須です ([`cairns-front-matter.schema.json`](../schema/cairns-front-matter.schema.json) の `if/then` 句参照)。これが未定義または空配列 (`[]`) の場合にエラーとなります。

  * **対処法:**

    1.  エラーメッセージで指摘されたドキュメントの `layer` と `core_principles` の内容を確認します。
    2.  [`document-map.md`](document-map.md) の `core_principles` に関する記述ルールと、[`cairns-front-matter.schema.json`](../schema/cairns-front-matter.schema.json) の定義を参照します。
    3.  **L3 以上のドキュメントで原則数が違反している場合:**
          * ドキュメントの主題を表す単一の原則に集約することを検討します。
          * 例外的に複数の原則が必要な場合は、その妥当性を再評価し、必要であれば設計者やレビュアーと相談します (`_dev_docs/front-matter-guidelines.md` セクション 3 フィールド解説 `core_principles` 参照)。
    4.  **L3 以上のドキュメントで原則 ID が推奨命名に従っていない場合:**
          * 単一原則の `principle_id` を推奨形式 `<doc-id>-main` に修正します。
          * 対応する `detail_ref` のアンカー名も修正が必要になる場合があります (例: `#l3-dev-workflow-main-details`)。
    5.  **L0-L4 ドキュメントで `core_principles` が未定義または空配列の場合:**
          * ドキュメントの内容を表す適切な原則を最低一つ定義します。L2 文書であれば複数の原則を、L3/L4 であれば単一の原則 (`<doc-id>-main` 形式) を定義します。

##### 2.4.2.4. 時間整合性違反 (`last_updated` vs `created_at`) {#h5-temporal-consistency-violation-last-updated-vs-created-at}

  * **典型的なエラーメッセージ:**

    ```
    Error [Custom Rule]: Temporal inconsistency detected in 'docs/L1-foundation/l1-values.md'.
    'last_updated' timestamp (2025-04-29T10:00:00Z) is earlier than 'created_at' timestamp (2025-04-30T12:00:00Z).
    Please ensure created_at <= last_updated <= expires_at (if defined).
    ```

  * **原因:**
    Front Matter 内の日時フィールド (`created_at`, `last_updated`, `expires_at`) の間に時間的な矛盾があります。
    カスタム検証スクリプト ([`devtools-list.md`](devtools-list.md) A6.3) および CI ([`document-map.md`](document-map.md) CI 検証項目参照) は、以下の順序が保たれているかをチェックします (各フィールドが存在する場合):
    `created_at <= last_updated <= expires_at`
    上記例では、`last_updated` が `created_at` より過去の日時になっています。

  * **対処法:**

    1.  エラーメッセージで指摘されたドキュメントファイルと、関連する日時フィールド (`created_at`, `last_updated`, `expires_at`) の値を確認します。
    2.  各タイムスタンプが正しいか、意図した順序 (`created_at <= last_updated <= expires_at`) になっているかを確認します。
    3.  誤っているタイムスタンプを修正します。`last_updated` は通常、ドキュメントの作成日時 (`created_at`) 以降、有効期限 (`expires_at`) 以前である必要があります。
    4.  日時フォーマット自体が誤っている可能性もあるため、セクション 2.4.1.3 も参照してください。

---

上記は代表的なエラーの例です。カスタム検証スクリプトはこれら以外にも、状態整合性 (`status` と `deprecation_info`, `checksum`, `signed_by` 等の関係) やガバナンス関連のチェック ([`devtools-list.md`](devtools-list.md) A6, B3, B4)、その他の参照整合性チェック ([`document-map.md`](document-map.md) CI項目参照) など、様々な検証を行う可能性があります。
エラーメッセージをよく読み、関連するスキーマ定義 ([`schema/`](../schema/)) やガイドライン ([`_dev_docs/front-matter-guidelines.md`](front-matter-guidelines.md), [`_dev_docs/document-map.md`](document-map.md), [`_dev_docs/naming-conventions.md`](naming-conventions.md), [`_dev_docs/folder-structure.md`](folder-structure.md)) を参照することで、ほとんどの問題は解決できるはずです。
**ここで挙げた例以外のカスタム検証ルールや、より詳細なエラーケースについては、[セクション 5「カスタム検証ルールの詳細」](#h2-custom-validation-rule-details) を参照してください。** 状態整合性やガバナンス関連のエラー、その他の参照整合性エラーについても、セクション 5 で網羅的に解説します。
不明な点や解決困難なエラーに遭遇した場合は、プロジェクトのメンテナーや他の開発者に相談してください。

-----

### 2.5. CI における検証 {#h3-validation-in-ci}

これまでのセクション (2.1〜2.4) では、Cairns ドキュメントの品質を維持し、開発者体験 (DX) を向上させるための**ローカル検証**の重要性と具体的な方法について解説してきました。本セクションでは、それらの検証がプロジェクトの継続的インテグレーション/継続的デリバリー (CI/CD) パイプラインにおいてどのように実行され、リポジトリ全体の品質保証にどう貢献するのかを説明します。

CI/CD パイプラインにおける自動検証は、ローカルでのチェックを補完し、プロジェクト全体の品質を維持するための**品質ゲート**として機能します。ローカル検証を励行することで CI でのエラーを未然に防ぐことが強く推奨されますが、CI の仕組みを理解することも重要です。

#### 2.5.1. CI 検証の目的と位置づけ {#h4-ci-validation-purpose-positioning}

CI/CD パイプライン (例: GitHub Actions - [`devtools-list.md`](devtools-list.md) A5: CI/CD プラットフォーム 参照) での自動検証は、プロジェクト全体の品質を維持するための**品質保証プロセス**です。
主な目的は以下の通りです。

  * ローカル検証 (セクション 2.1-2.4 参照) で見逃された可能性のあるエラーや規約違反を検出する。
  * `main` ブランチなど、保護されたブランチへのマージ前に、ドキュメントが定義された品質基準を満たしていることを保証する。
  * プロジェクト全体の整合性と一貫性を自動的に維持する。

ローカル検証は**開発者への早期フィードバック**を提供し開発効率を高めるために不可欠ですが、CI 検証は**リポジトリ全体の品質を最終的に担保**する役割を担います。両者は補完関係にあり、効果的な品質管理には双方の実施が重要です ([`document-map.md`](document-map.md) の品質維持プロセス定義も参照)。

#### 2.5.2. CI 検証における注意点 {#h4-ci-validation-notes}

CI 検証は効果的な品質保証プロセスですが、以下の点に留意が必要です。

  * **実行時間:** ドキュメント数や検証ルールの複雑さが増すにつれて、CI の実行時間が長くなる可能性があります。特に全ドキュメントを対象とするカスタムルール検証 ([`devtools-list.md`](devtools-list.md) A6.1: カスタム検証のパフォーマンス考慮事項 参照) は影響を受けやすいです。
  * **環境差異:** ローカルの開発環境と CI 実行環境 (OS, ツールバージョン等) のわずかな違いが、稀に予期せぬ検証結果の違いを生む可能性があります。
  * **カスタムスクリプトの保守:** Cairns 固有のルールを検証する**カスタム検証スクリプト群** (例: `scripts/` ディレクトリ配下に配置。関連ツールは [`devtools-list.md`](devtools-list.md) A3: スキーマ検証, A6: カスタム検証, B2: RAG Index 生成, B3: Checksum 検証, B4: 署名検証 参照) は CI の中核ですが、これらのスクリプト自体もプロジェクトの進化に合わせて継続的に保守・改善していく必要があります。（**※実際のスクリプト名や構成はプロジェクトの実装や [`devtools-list.md`](devtools-list.md) の A3, A6, B2-B4 を参照してください**）

これらの注意点からも、CI でのエラーを未然に防ぎ、手戻りを減らすために、**可能な限りローカル環境で問題を特定・修正しておくこと**が推奨されます ([`devtools-list.md`](devtools-list.md) A7: 開発者体験支援 参照)。

#### 2.5.3. CI で実行される主な検証・処理項目 {#h4-main-ci-validation-items}

CI パイプラインでは、[`devtools-list.md`](devtools-list.md) (ツールリスト) や [`document-map.md`](document-map.md) (ドキュメント体系) で定義されたツールとルールに基づき、主に以下の検証や関連処理が自動的に実行されます。

  * **構文・スタイルチェック:**
      * YAML Lint (`yamllint` - [`devtools-list.md`](devtools-list.md) A1: YAML Linter): Front Matter の基本的な YAML 構文とスタイル規約 (`.yamllint`) をチェック。
      * Markdown Lint (`markdownlint-cli2` - [`devtools-list.md`](devtools-list.md) A2: Markdown Linter): Markdown 本文の構文とスタイル規約 (`.markdownlint-cli2.*`) をチェック。
  * **Front Matter スキーマ検証:**
      * [JSON Schema](../schema/cairns-front-matter.schema.json) ([`devtools-list.md`](devtools-list.md) A3: JSON Schema Validator スクリプト参照) への準拠を、カスタムスクリプトを用いて**厳密に**検証 (Draft 2020-12 の高度な機能を含む)。
  * **Cairns 固有カスタムルール検証:**
      * **カスタム検証スクリプト群** (例: `scripts/` 配下。[`devtools-list.md`](devtools-list.md) A6: カスタム検証スクリプト 参照) により、スキーマだけでは表現できないプロジェクト固有のルールを網羅的にチェックします。（**※実際のスクリプト名や構成はプロジェクトの実装や [`devtools-list.md`](devtools-list.md) の A6 を参照してください**）
      * 主な検証カテゴリは以下の通りです (**各ルールの違反例については [セクション 2.4.2](#h4-custom-rule-violation-errors) を、ルールの網羅的な詳細については [今後のセクション 5](#h2-custom-validation-rule-details) で解説予定です**):
          * **ID 整合性:** `id` とファイル名の一致、ID の一意性など。
          * **参照整合性:** 内部リンク、スニペット、メディアファイル等の参照先の存在確認など。
          * **時間整合性・有効期限チェック:** 日時フィールド間の順序関係 (`created_at`, `last_updated`, `expires_at`) や有効期限 (`review_cycle_days`) の確認など。
          * **構造整合性:** ドキュメントレイヤーに応じた `core_principles` の記述ルールなど。
          * **言語整合性:** `language`, `preferred_langs`, `localized_overrides` 間の整合性や、BCP-47 フォーマットの検証 (例: [`devtools-list.md`](devtools-list.md) A6.4: 言語整合性 で推奨される `langcodes` ライブラリを利用)。
          * **状態整合性:** `status` フィールドと関連フィールド (`deprecation_info`, `license`, `checksum`, `signed_by`) の整合性検証。これには、特定ステータス (`APPROVED`/`FIXED`) における **Checksum 検証** ([`devtools-list.md`](devtools-list.md) B3: Checksum 生成・検証ツール) や**署名検証** ([`devtools-list.md`](devtools-list.md) B4: 署名検証ツール) が含まれます。**(※署名検証 (B4) の導入には、GitHub Actions Secrets 等を利用した鍵管理プロセスの確立が前提となります。詳細は [`devtools-list.md`](devtools-list.md) B4: 署名検証ツール の導入方針/備考を参照してください)**
  * **RAG Index 生成:**
      * RAG (Retrieval-Augmented Generation) システムとの連携準備として、インデックスファイル (`index.ndjson`) を生成します (詳細は [`devtools-list.md`](devtools-list.md) B2: RAG Index 生成ツール 参照)。

これらの検証や処理は、リポジトリの `.github/workflows/` ディレクトリ内で定義された GitHub Actions ワークフロー ([`devtools-list.md`](devtools-list.md) A5 参照) によって実行されます。

#### 2.5.4. 実行タイミングとフィードバック {#h4-ci-execution-timing-feedback}

CI 検証は、通常、以下のタイミングで GitHub Actions ワークフロー ([`devtools-list.md`](devtools-list.md) A5: CI/CD プラットフォーム 参照) によって自動的にトリガーされます。

  * Pull Request (PR) の作成時または更新時
  * 特定のブランチ (例: `main`) への push 時

検証結果は、以下のような形で開発者にフィードバックされます。

  * **GitHub Checks:** PR 画面に、各検証ステップ（Lint, Schema Check, Custom Rules Check など）の成功/失敗ステータスが表示されます。
  * **ログ:** 各ステップの詳細な実行ログを確認でき、エラーが発生した場合は具体的なエラーメッセージ（[セクション 2.4](#h3-common-errors-and-solutions) で解説したようなメッセージ）と発生箇所を特定できます。
  * **(設定により)** **インラインコメント:** Lint 違反などが PR の該当行に直接コメントとして表示される場合があります (`reviewdog/action-yamllint` など)。
  * **マージブロック:** 必須チェックとして設定された検証が失敗した場合、PR のマージが自動的にブロックされます ([`devtools-list.md`](devtools-list.md) A5.3: PRフィードバック/マージブロック)。

CI でエラーが検出された場合、開発者はフィードバックを確認し、ローカル環境で問題を修正して再度 push する必要があります。

#### 2.5.5. ローカル検証の再推奨 {#h4-ci-re-recommend-local-validation}

CI はプロジェクト全体の品質を担保する重要なプロセスですが、CI で初めてエラーを発見することは、開発サイクル全体を遅延させる可能性があります。**CI でのエラーは、修正・再プッシュ・再実行といった手戻りを発生させるため、[セクション 2.1](#h3-why-local-validation-is-needed) で述べたローカル検証が、CI 段階での手戻りを未然に防ぐ上で極めて重要です。特に、[セクション 2.1.3](#h4-complementing-dx-gap) や [セクション 2.3.1.2](#h4-basic-schema-validation-vscode) で述べたように、VSCode などのエディタ拡張機能だけでは検知できない Cairns 固有のカスタムルール違反や、高度なスキーマ機能に関するエラーも存在するため、ローカル検証スクリプトの実行が不可欠となります。**

開発効率と生産性を最大限に高めるためには、CI に依存するのではなく、コードをコミットまたは push する前に、必ずローカル環境で検証を実行することを強く推奨します。

  * **推奨コマンド:** (実際のコマンドは、プロジェクトルートの **`package.json` の `scripts` セクション** や `Makefile` 等を確認してください)
    ```bash
    # 例: リポジトリ全体のドキュメントを検証する場合 (package.json 内のスクリプト名は例です)
    npm run validate:all
    # または
    # npm run validate

    # 例: 特定のファイルやディレクトリを検証する場合 (引数を取るスクリプトが定義されている場合)
    npm run validate <ファイルパス または ディレクトリパス>
    # 例) npm run validate docs/L2-principles/l2-design-principles.md
    # 例) npm run validate docs/L4-domain/js-stack/

    # 例: Makefile が定義されている場合
    # make validate
    ```

[セクション 2.3.2](#h4-recommended-full-validation-script) で解説したカスタム検証スクリプトは、CI で実行される検証と**同等のチェック** (VSCode 拡張機能ではカバーしきれないチェックを含む) をローカルで実行できるように設計されています。ローカル検証を習慣づけることで、CI でのエラーを未然に防ぎ、よりスムーズで快適な開発プロセスを実現できます。**CI でのエラー修正にかかる時間を削減するためにも、ローカルでの事前検証を積極的に活用しましょう。**

-----

## 3. Front Matter フィールド詳細解説 {#h2-front-matter-field-details}

### 3.1. 解説の構造 {#h3-explanation-structure}

本ガイドラインのセクション 3 では、Cairns プロジェクトで使用される各 Front Matter フィールドについて、一貫性のある標準化された構造で解説を進めます。この構造化されたアプローチは、読者が各フィールドの目的、技術的な定義、具体的な使い方、および運用上の注意点などを効率的に理解し、必要な情報へ迅速にアクセスできるように設計されています。セクション [1.2 Front Matter の重要性](#h3-importance-of-front-matter) で述べた Front Matter の重要性（一貫性、自動化、AI 活用、ガバナンス）を、各フィールドレベルで具体的に理解するための一助となります。

各フィールドの解説（セクション 3.2 以降）は、原則として以下の項目から構成されます。

* **目的 (Why):**
    * そのフィールドが**なぜ**導入されたのか、どのような背景や課題解決のために存在するのかを説明します。フィールドの存在意義や設計意図を理解するための項目です。
* **意味 (What):**
    * そのフィールドが具体的に**何**を表しているのか、どのような情報を持つのかを定義します。フィールドの基本的な意味内容を明確にする項目です。
* **スキーマ定義:**
    * 関連する JSON Schema ファイル ([`schema/cairns-front-matter.schema.json`](../schema/cairns-front-matter.schema.json) や参照先の `*-defs.schema.json`, [`schema/patterns.schema.json`](../schema/patterns.schema.json)) における、そのフィールドの技術的な定義 **(データ型、必須/任意、パターン、enum 値など)** を示します。スキーマファイル名と参照パス (例: [`metadata-defs.schema.json#metadata-AccessibilityInfo`](../schema/metadata-defs.schema.json) や [`patterns.schema.json#pattern-docId`](../schema/patterns.schema.json)) を正確に明記し、定義の客観的な根拠を提供します。
* **記述ルール/規約 (How):**
    * そのフィールドを**どのように**記述すべきか、具体的なルールや従うべき規約 (例: [`naming-conventions.md`](naming-conventions.md), [`document-map.md`](document-map.md) 参照)、条件付き必須要件 (例: 特定の `status` 値の場合に必須となる他のフィールド)、推奨されるフォーマットや記述内容など、実践的な使い方を解説します。
* **具体例 (Good):**
    * フィールドの正しい記述方法を示す、シンプルで分かりやすい具体例 (YAML 形式) を1つ以上提示します。読者が具体的なイメージを持てるように支援します。
* **ベストプラクティス/推奨事項:**
    * フィールドをより効果的に活用するための推奨事項や、**保守性・可読性を高めるためのヒントを提供します。** これには、AI (RAG) 活用 ([`document-map.md`](document-map.md) の RAG Index 対象フィールド参照) を促進するための記述の工夫（例: `abstract`, `summary`, `keywords` の質を高める方法）などが含まれる場合があります。
* **アンチパターン (Bad):**
    * 避けるべき典型的な誤った記述例とその理由を示します。よくある間違いを防ぎ、ドキュメント全体の品質 ([`document-map.md`](document-map.md) の品質維持プロセス参照) を維持するための注意喚起を行います。
* **CI/ツール連携:**
    * そのフィールドが CI/CD パイプライン ([セクション 2.5 CI における検証](#h3-validation-in-ci) 参照) における自動検証 (スキーマ検証、カスタムルール検証) や、他の自動処理ツール (RAG Indexer ([`devtools-list.md`](devtools-list.md) B2), 静的サイトジェネレーター (SSG) ([`devtools-list.md`](devtools-list.md) B1), ガバナンス関連チェック ([`devtools-list.md`](devtools-list.md) B3, B4) 等) によってどのように利用されるかを説明します。フィールドの運用上の重要性や、自動化による品質保証・効率化との関連を示す項目です。関連するカスタム検証ルール ([セクション 5 カスタム検証ルールの詳細](#h2-custom-validation-rule-details) で定義される ID や説明など) への参照を含む場合があります。これにより、CI エラー発生時の原因特定やデバッグが容易になることを目指します。

後続のセクション [3.2 フィールド解説](#h3-field-explanations) では、上記で定義した構造に従って、各 Front Matter フィールドをアルファベット順に詳細に解説していきます。

-----

