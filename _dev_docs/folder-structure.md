---
id: l0-folder-structure
title: "Cairns リポジトリ フォルダ/ファイル構成定義"
layer: L0
version: "1.0.0" # Version remains 1.0.0 as it's still in DRAFT phase reflecting feedback
status: DRAFT
authors: ["Cizimy"]
owner: "34811615+Cizimy@users.noreply.github.com"
last_updated: "2025-04-29T19:00:00+09:00"
created_at: "2025-04-29T18:11:29+09:00"
review_cycle_days: 180
# expires_at: ... # Example: Set based on review_cycle_days
abstract: "Cairns リポジトリ内のディレクトリとファイルの構造、目的、および基本方針を定義します。"
summary: "このドキュメントは、Cairns プロジェクトの知識基盤を体系的に管理するためのフォルダおよびファイル構成を定義します。`document-map.md` に基づく構造、関連リソースの配置、命名規則との連携、将来の拡張性について解説します。"
detail_ref: "#doc-body"
doc_type: reference
keywords: ["folder structure", "directory", "repository", "organization", "cairns", "L0", "architecture"]
core_principles:
  - principle_id: systematic-repo-organization
    title: "Systematic Repository Organization"
    status: DRAFT
    summary: "Maintain a consistent and logical folder structure to enhance discoverability, maintainability, and automation, ensuring alignment with the project's information architecture and tooling."
    detail_ref: "#doc-body"
relationships:
  - from: "l0-folder-structure"
    to: "l0-document-map"
    rel_type: "depends_on"
    description: "The folder structure is designed based on the information architecture defined in the Document Map."
  - from: "l0-folder-structure"
    to: "l0-naming-conventions"
    rel_type: "depends_on"
    description: "Folder and file naming within this structure must adhere to the defined Naming Conventions."
---

# Cairns リポジトリ フォルダ/ファイル構成定義 <a id="doc-body"></a>

## 1. はじめに (Introduction)

このドキュメントは、Cairns プロジェクトのリポジトリにおけるフォルダおよびファイルの構成、それぞれの目的、および構成を決定する上での基本方針を定義します。

一貫性のあるフォルダ構造は、以下の点で重要です。

* **情報の発見性:** 開発者や AI が目的の情報や関連リソースを効率的に見つけられるようにします。
* **整理と保守:** リポジトリ内のコンテンツを論理的に整理し、保守性を向上させます。
* **自動化の促進:** CI/CD パイプラインやカスタムスクリプトが、特定のファイルやディレクトリを前提として動作できるようにします。
* **拡張性:** プロジェクトの成長に合わせて新しいコンテンツや機能を追加しやすくします。

本ドキュメントは、以下のドキュメントと密接に関連しています。

* [Cairns ドキュメント体系 マップ (`document-map.md`)](document-map.md)
* [命名規則定義 (`naming-conventions.md`)](naming-conventions.md) （作成予定 - Task 1.3.1）

## 2. 基本方針 (Guiding Principles)

Cairns リポジトリのフォルダ構成は、以下の基本方針に基づいています。

* **`document-map.md` 準拠:** [`document-map.md`](document-map.md) で定義された 6層構造 (L0-L5) を `docs/` ディレクトリ構造の基礎とします。
* **関心の分離:** ドキュメント本体 (`docs/`)、スキーマ定義 (`schema/`)、コードスニペット (`snippets/`)、メディアファイル (`media/`)、開発用ドキュメント (`_dev_docs/`)、各種設定（ルート）、スクリプト (`scripts/`)、CI/CD設定 (`.github/`) などを明確に分離します。
* **命名規則との一貫性:** [`naming-conventions.md`](naming-conventions.md) （作成予定）で定義されるフォルダ名・ファイル名規則に従います。特に、`docs/` 配下のドキュメントファイル名は、Front Matter の `id` と一致させる必要があります。
* **ツール連携:** Linter, Validator, 静的サイトジェネレーター (SSG), カスタム検証スクリプトなどの開発ツール ([`devtools-list.md`](devtools-list.md) 参照) が効率的に動作できる構成とします。
* **拡張性と保守性:** 将来的な技術スタックの追加、ドキュメントタイプの増加、多言語対応などを考慮し、変更容易性と理解しやすさを重視します。

## 3. トップレベルディレクトリ構造 (Top-Level Directory Structure)

リポジトリのルートレベルには、以下の主要なディレクトリと設定ファイルが配置されます。

```plaintext
/
├── .github/              # GitHub Actions ワークフロー、Issue/PRテンプレート等
├── .gitignore            # Git で追跡しないファイル/ディレクトリを指定
├── .markdownlint-cli2.* # Markdown Linter (markdownlint-cli2) 設定ファイル (例: .jsonc, .yaml)
├── .yamllint             # YAML Linter (yamllint) 設定ファイル
├── README.md             # リポジトリの概要、はじめ方などを記述
├── _dev_docs/            # Cairns プロジェクト自体の開発用ドキュメント群
├── docs/                 # Cairns ドキュメント本体 (L0-L5)
├── media/                # 画像、図などのメディアファイル
├── schema/               # ドキュメント Front Matter の JSON Schema 定義
├── scripts/              # カスタム検証スクリプト等の補助スクリプト
├── snippets/             # ドキュメント内で参照されるコードスニペット
└── (その他設定ファイル)    # 例: package.json, pyproject.toml, docusaurus.config.js
````

  * **`.github/`**: CI/CD ワークフロー (`workflows/`)、Issue/Pull Request テンプレート (`ISSUE_TEMPLATE/`, `pull_request_template.md`) など、GitHub プラットフォーム固有の設定ファイルを格納します。CI/CD パイプラインはここで定義・管理されます ([`action-plan.md`](action-plan.md) フェーズ 1.4 以降参照)。
  * **`.gitignore`**: OS生成ファイル (`.DS_Store`)、IDE設定 (`.vscode/`)、依存関係 (`node_modules/`, `.venv/`, `__pycache__/`)、ビルド出力 (`build/`, `.docusaurus/`) など、バージョン管理対象外とするファイルを指定します (`Sub-task list 1.3.1` 参照)。詳細は `.gitignore` ファイル自体を参照してください。
  * **`.markdownlint-cli2.*` / `.markdownlint.*`**: Markdown のスタイルと構文をチェックする `markdownlint-cli2` の設定ファイルです ([`devtools-list.md`](devtools-list.md) A2 参照)。
  * **`.yamllint`**: YAML (特に Front Matter) のスタイルと構文をチェックする `yamllint` の設定ファイルです ([`devtools-list.md`](devtools-list.md) A1 参照)。
  * **`README.md`**: プロジェクトの入口となるファイルです。概要、目的、始め方、主要ドキュメントへのリンクなどを記載します。
  * **`_dev_docs/`**: Cairns プロジェクト自身の開発・管理に関するドキュメント（本ドキュメント、[`document-map.md`](document-map.md), [`action-plan.md`](action-plan.md), ガイドライン等）を格納します。
  * **`docs/`**: Cairns ライブラリの本体となるドキュメント群を格納します。詳細は[4.1. `docs/`](#41-docs)を参照してください。
  * **`media/`**: ドキュメント内で使用される画像 (`images/`) や図 (`diagrams/`) などのメディアファイルを格納します。詳細は[4.4. `media/`](#44-media)を参照してください。
  * **`schema/`**: ドキュメントの Front Matter 構造を定義する JSON Schema ファイル (`cairns-front-matter.schema.json` 及び関連ファイル) を格納します。詳細は[4.2. `schema/`](#42-schema)を参照してください。
  * **`scripts/`**: スキーマ検証、参照整合性チェック、ID整合性チェック、RAG Index 生成などのカスタムロジックを実装したスクリプト ([`devtools-list.md`](devtools-list.md) A3, A6, B2, B3, B4 参照) を格納します。詳細は[4.7. `scripts/`](#47-scripts)を参照してください。
  * **`snippets/`**: ドキュメント (`core_principles[].snippet_refs` 等) から参照される再利用可能なコードスニペットを格納します。詳細は[4.3. `snippets/`](#43-snippets)を参照してください。
  * **`(その他設定ファイル)`**: プロジェクトで使用するツール (Node.js, Python, Docusaurus 等) の設定ファイルが配置されます。例: `package.json`, `pyproject.toml`, `docusaurus.config.js` ([`devtools-list.md`](devtools-list.md) B1 参照)。

## 4\. 主要ディレクトリ詳細 (Detailed Directory Breakdown)

### 4.1. `docs/` \<a id="41-docs"\>\</a\>

Cairns ドキュメント本体を格納します。[`document-map.md`](document-map.md) の6層構造に従い、以下のサブディレクトリで構成されます。

```plaintext
docs/
├── L0-library-overview/    # Cairns 全体の概要、定義、ガバナンス等
├── L1-foundation/          # 不変の価値観、基本理念
├── L2-principles/          # 普遍的な技術原則 (Why/What)
├── L3-process/             # 開発プロセス、チーム連携、CI/CD
├── L4-domain/              # 特定技術・領域ガイドライン (How)
│   ├── common/             # 技術スタック横断ガイドライン (例: UX, Accessibility)
│   ├── js-stack/           # JavaScript/TypeScript スタック固有
│   ├── python-stack/       # Python スタック固有
│   └── vba-stack/          # VBA スタック固有
└── L5-ops/                 # 運用、実行環境
```

  * 各 `L*` ディレクトリには、それぞれのレイヤーに対応する Markdown ドキュメント (`.md`) が配置されます。
  * ファイル名は、[`naming-conventions.md`](naming-conventions.md) （作成予定）および [`document-map.md`](document-map.md) の指示に従い、Front Matter の `id` と拡張子を除いて一致させる**必要があります** (例: `id: l2-design-principles` ならファイル名は `l2-design-principles.md`)。
  * `L4-domain/` 配下は、対象とする技術スタックや領域ごとにサブディレクトリを作成します。新しいスタック (例: `go-stack/`, `cloud-infra/`) を追加する場合は、ここに新しいディレクトリを作成します。

### 4.2. `schema/` \<a id="42-schema"\>\</a\>

ドキュメントの Front Matter (YAML) の構造を定義し、検証するための JSON Schema ファイル (`v2.0.1` および後続バージョン) を格納します。

```plaintext
schema/
├── cairns-front-matter.schema.json # メインスキーマ (v2.0.1)
├── common-defs.schema.json       # 共通定義
├── content-defs.schema.json      # コンテンツ関連定義
├── metadata-defs.schema.json     # メタデータ関連定義
└── patterns.schema.json          # 正規表現パターン定義
```

これらのスキーマは、CI (`.github/workflows/`) やローカルの検証スクリプト (`scripts/`) によってドキュメントの構造的正しさを保証するために使用されます ([`devtools-list.md`](devtools-list.md) A3 参照)。

### 4.3. `snippets/` \<a id="43-snippets"\>\</a\>

ドキュメント内で具体例として参照されるコードスニペットを格納します。[`document-map.md`](document-map.md) の推奨に従い、以下のような構造で管理することを推奨します。

```plaintext
snippets/
└── <doc-id>/                 # 参照元ドキュメントIDに対応するディレクトリ (例: l2-design-principles)
    └── <principle-id>.code.* # 参照元原則IDに対応するファイル (例: srp-good.code.ts)
```

  * ファイルパスは、ドキュメント内の `core_principles[].snippet_refs` プロパティで指定します (例: `./snippets/l2-design-principles/srp-good.code.ts`)。スキーマ (`patterns.schema.json#pattern-snippetPath`) でパス形式が定義されていますが、拡張子は `.code.md` に限定せず、実際のコード言語に合わせることも可能です (例: `.code.ts`, `.code.py`)。この点は `naming-conventions.md` で明確化が必要です。
  * この構造により、どのドキュメントのどの原則に関連するスニペットかが明確になります。CI で参照先の存在確認を行うことを想定しています。
  * **注意:** 将来的なドキュメント数の増加によっては、この構造の見直しを検討する可能性があります。

### 4.4. `media/` \<a id="44-media"\>\</a\>

ドキュメント内で使用する画像や図などのメディアファイルを格納します。種類ごとにサブディレクトリで管理することを推奨します。

```plaintext
media/
├── diagrams/ # 図 (Mermaid, Draw.io 等のソースファイルや出力画像)
└── images/   # スクリーンショット、ロゴ等の画像ファイル
```

  * ファイルパスは、ドキュメント内の `media[]` プロパティ (`media[].path`) で指定します。
  * 動画 (`videos/`) やアイコン (`icons/`) など、他のタイプのメディアが増えた場合は、対応するサブディレクトリを作成します。CI で参照先の存在確認を行うことを想定しています。

### 4.5. `_dev_docs/` \<a id="45-devdocs"\>\</a\>

Cairns プロジェクト自体の開発、管理、運用に関するドキュメントを格納します。

```plaintext
_dev_docs/
├── action-plan.md
├── branch-strategy.md
├── devtools-functional-requirements.md
├── devtools-list.md
├── devtools-research.md
├── document-map.md
├── folder-structure.md          # このドキュメント
├── front-matter-guidelines.md   # 作成予定 (Task 1.3.3)
├── naming-conventions.md        # 作成予定 (Task 1.3.1)
└── templates/                   # ドキュメントテンプレート格納推奨場所
    └── template.md              # 基本テンプレート (Task 1.3.2)
```

  * `templates/` ディレクトリは、ドキュメント作成の効率化・標準化のためのテンプレートファイル (`template.md` など) を格納する場所として推奨されます (`Sub-task list 1.3.2` 参照)。

### 4.6. `.github/` \<a id="46-github"\>\</a\>

GitHub に関連する設定ファイルを格納します。

```plaintext
.github/
├── ISSUE_TEMPLATE/       # Issue 作成テンプレート (.yml)
├── pull_request_template.md # Pull Request 作成テンプレート
└── workflows/            # GitHub Actions CI/CD ワークフロー定義 (.yml)
```

  * `workflows/` ディレクトリには、Lint チェック、スキーマ検証、カスタム検証、サイトビルド、デプロイなどの自動化処理を定義した YAML ファイルが配置されます。

### 4.7. `scripts/` \<a id="47-scripts"\>\</a\>

カスタム検証スクリプトや、その他の開発・運用補助スクリプトを格納します。

```plaintext
scripts/
├── validate_schema.{py|js}         # 例: JSON Schema 検証スクリプト (A3)
├── validate_cairns_rules.{py|js}   # 例: Cairns 固有ルール検証スクリプト (A6, B3, B4)
└── generate_rag_index.{py|js}      # 例: RAG Index 生成スクリプト (B2)
```

  * これらのスクリプトは、標準ツールではカバーできない Cairns 固有の検証ロジック ([`devtools-list.md`](devtools-list.md) 参照) や運用タスクを実行するために使用され、主に CI/CD パイプライン (`.github/workflows/`) から呼び出されます。
  * スクリプト言語 (Python or Node.js) は、プロジェクトの技術スタックや保守性を考慮し、統一することが強く推奨されます ([`devtools-list.md`](devtools-list.md) A3, A6 参照)。
  * 将来的にスクリプトが増加・複雑化した場合は、機能に応じたサブディレクトリ構成（例: `scripts/validation/`, `scripts/generation/`）も検討可能です。
  * **開発者向け注意:** これらのカスタムスクリプトは CI で自動実行されますが、開発時にはローカル環境でこれらを実行し、問題を早期に発見することが推奨されます ([`devtools-list.md`](devtools-list.md) A7 参照)。

## 5\. 命名規則との関連 (Relation to Naming Conventions)

フォルダ名およびファイル名は、[`naming-conventions.md`](naming-conventions.md) （作成予定）で定義される規約に従う必要があります。特に以下の点が重要です。

  * **フォルダ/ファイル名:** 原則として小文字、単語間はハイフン (`-`) 区切りを推奨します。
  * **ドキュメントIDとファイル名の一致:** `docs/` 配下の Markdown ファイル名は、そのファイルの Front Matter で定義された `id` と拡張子 (`.md`) を除いて完全に一致させる**必要があります**。これは CI (`.github/workflows/`) で検証されます。
      * 例: Front Matter `id: l2-design-principles` → ファイル名 `l2-design-principles.md`

## 6\. 将来の拡張性 (Future Extensibility)

このフォルダ構成は、将来的なプロジェクトの拡張に対応できるように設計されています。

  * **新しい技術スタック:** `docs/L4-domain/` 配下に新しいサブディレクトリを追加することで容易に対応できます。
  * **新しいドキュメントタイプ:** [`document-map.md`](document-map.md) やスキーマ (`schema/` 内の `doc_type` enum) を更新し、対応するレイヤーのディレクトリに新しいドキュメントを追加します。
  * **関連リソースの追加:** 新しいタイプの関連リソース（例: 設定ファイル例、テストデータ）が必要になった場合、既存のディレクトリ（`snippets/`, `media/`）を拡張するか、必要に応じて新たなトップレベルディレクトリ（例: `examples/`）の導入を検討します。
  * **多言語対応 (i18n):** 将来的に多言語対応を導入する場合 ([`document-map.md`](document-map.md) `l0-localization-policy.md` 参照)、選択した SSG (例: Docusaurus, [`devtools-list.md`](devtools-list.md) B1 参照) の機能に応じてディレクトリ構造が拡張される可能性があります (例: `docs/i18n/<lang>/...` やファイル名サフィックス `*.ja.md`)。具体的な構造は、採用ツールの仕様に基づいて決定されます。

## 7\. 改訂履歴 (Revision History)

| バージョン | 日付                | 変更内容                             | 変更者  |
| :------- | :------------------ | :----------------------------------- | :----- |
| 1.0.0    | 2025-04-29          | 初版作成                              | Cizimy |
|          |                     |                                      |        |