---
id: l0-naming-conventions
title: "Cairns 命名規則定義"
layer: L0
version: "1.0.0" # Version remains 1.0.0 as significant structural change is integrated within DRAFT phase
status: DRAFT # Status remains DRAFT until formally approved
authors: ["Cizimy", "Gemini"] # Added Gemini as contributor for the heading ID section
owner: "34811615+Cizimy@users.noreply.github.com"
last_updated: "2025-05-05T08:03:16+09:00" # Updated time reflecting the integration
created_at: "2025-04-29T19:07:07+09:00" # Original creation time
review_cycle_days: 180
# expires_at: ... # To be set based on review_cycle_days or specific policy
abstract: "Cairns プロジェクトにおけるフォルダ、ファイル、ID、見出しアンカー等の命名に関する規約を定義します。"
summary: "このドキュメントは、Cairns リポジトリ内の一貫性、発見性、自動処理の容易性を確保するための命名規則を定義します。フォルダ、ファイル、ドキュメントID (`id`)、原則ID (`principle_id`)、Markdown見出しID（アンカー）等の命名基準、推奨形式、必須ルール、および CI による検証項目について解説します。"
detail_ref: "#doc-body"
doc_type: guideline
keywords: ["naming convention", "id", "filename", "folder", "directory", "principle id", "anchor", "heading id", "markdown", "cairns", "L0", "guideline"]
core_principles:
  - principle_id: consistent-naming
    title: "Consistent Naming"
    status: DRAFT
    summary: "Establish and adhere to clear, consistent naming conventions across all repository artifacts (folders, files, IDs, anchors, heading IDs) to enhance clarity, discoverability, maintainability, and automation."
    detail_ref: "#doc-body"
relationships:
  - from: "l0-naming-conventions"
    to: "l0-folder-structure"
    rel_type: "relates_to"
    description: "Naming conventions apply to the artifacts defined in the Folder Structure document."
  - from: "l0-naming-conventions"
    to: "l0-document-map"
    rel_type: "refines"
    description: "Provides specific naming rules for IDs, file structures, and anchors outlined in the Document Map."
  - from: "l0-naming-conventions"
    to: "l0-cairns-overview"
    rel_type: "refines"
    description: "Details the naming conventions summarized in the Cairns Overview."
  - from: "l0-naming-conventions"
    to: "l3-ci-workflow-guidelines" # Assumed document ID for CI guidelines
    rel_type: "relates_to"
    description: "Defines rules that are expected to be validated by the CI workflow."
---

# Cairns 命名規則定義 <a id="doc-body"></a>

## 1. はじめに (Introduction) {#h2-introduction}

このドキュメントは、Cairns プロジェクトのリポジトリ内で使用されるフォルダ、ファイル、Front Matter フィールド (特に **ドキュメントID (`id`)** や **原則ID (`principle_id`)**)、および **Markdown 見出しID (アンカー)** の命名に関する規約を定義します。

明確で一貫性のある命名規則は、以下の目的のために不可欠です。

* **一貫性と可読性:** リポジトリ全体の構造と内容の理解を容易にします。
* **発見性:** 開発者や AI が目的の情報を効率的に検索・発見できるようにします。
* **保守性:** ファイルや ID の変更、リファクタリングを容易にします。
* **自動化:** CI/CD パイプライン、検証スクリプト、静的サイトジェネレーターなどのツールが、命名規則に基づいてリソースを確実に特定し、処理できるようにします。
* **衝突回避:** ファイル名や ID の意図しない重複を防ぎます。

このドキュメントは、Cairns プロジェクトに参加するすべての開発者、コントリビューター、および関連ツール (AI エージェント含む) が従うべきルールを定めます。

## 2. 基本原則 (Guiding Principles) {#h2-guiding-principles}

Cairns の命名規則は、以下の基本原則に基づいています。

* **明確性 (Clarity):** 名前からその対象の内容や目的が推測できるようにします。略語の使用は、[用語集 (`l0-glossary.md`)](../docs/L0-library-overview/l0-glossary.md) で定義されているなど、一般的に理解可能なものに限定します。
* **一貫性 (Consistency):** リポジトリ全体で同じ命名スタイルとパターンを適用します。
* **簡潔性 (Conciseness):** 不必要に冗長な名前は避けつつ、明確性を損なわない範囲で簡潔にします。
* **URL/ファイルシステム互換性 (Compatibility):** Web 上での利用や、様々な OS のファイルシステムで問題が発生しにくい文字のみを使用します。
* **自動化親和性 (Automation-Friendly):** スクリプト等で処理しやすい、予測可能で機械判読可能な形式を採用します。
* **衝突回避 (Collision Avoidance):** 特に ID については、指定されたスコープ内での一意性を保証します。

## 3. 対象範囲 (Scope) {#h2-scope}

この命名規則は、以下のリポジトリ内アーティファクトに適用されます。

* フォルダ (ディレクトリ) 名
* ファイル名 (Markdown ドキュメント、スキーマ、スニペット、メディア、スクリプト、設定ファイル等)
* Front Matter フィールドの値 (特に `id`, `core_principles[].principle_id` および参照系フィールド)
* Markdown 本文内の**見出しに手動で付与する ID (アンカー)**
* その他、特定の意味を持つ手動設定アンカー (例: `#doc-body`)

## 4. 全体的なルール (General Rules) {#h2-general-rules}

特に指定がない限り、すべての命名において以下のルールが適用されます。

* **ケース (Case):** **ケバブケース (`kebab-case`) を【MUST】**とします。単語間はハイフン (`-`) で区切ります。
    * Good: `l2-design-principles`, `my-script.js`, `api-design-guidelines`, `h2-introduction`
    * Bad: `l2_design_principles`, `MyScript.js`, `APIDesignGuidelines`, `h2_Introduction`
* **文字種 (Character Set):** **小文字英数字 (`a-z`, `0-9`) とハイフン (`-`) のみを【MUST】**とします。
    * **例外:** ファイル拡張子の前のドット (`.`)、設定ファイル名の先頭のドット (`.`) は許可されます。アンダースコア (`_`) は原則使用しません（一部のファイルタイプで慣習となっている場合は許容される場合がありますが、基本はハイフンを使用します）。
* **禁止文字 (Forbidden Characters):** スペース、大文字、**ドット (`.`)** (ファイル拡張子前を除く)、およびその他の特殊文字 (`!`, `@`, `#`, `$`, `%`, `^`, `&`, `*`, `(`, `)`, `+`, `=`, `{`, `}`, `[`, `]`, `|`, `\`, `:`, `;`, `"`, `'`, `<`, `>`, `,`, `?`, `/` 等) は【MUST NOT】使用します。
* **言語 (Language):** フォルダ名、ファイル名、ID、アンカーの英語部分は、原則として**英語を【MUST】**とします。プロジェクト共通言語が別途定義されている場合はそれに従います。

## 5. フォルダ/ディレクトリ命名規則 (Folder/Directory Naming) {#h2-folder-directory-naming}

* **ルートディレクトリ:** `docs`, `schema`, `snippets`, `media`, `_dev_docs`, `.github`, `scripts` 等、主要なディレクトリ名は上記の全体ルールに従います。[フォルダ/ファイル構成定義 (`l0-folder-structure.md`)](folder-structure.md) を参照してください。
* **`docs/` 配下:**
    * レイヤーディレクトリ: `L[0-5]-<layer-name>` 形式を【MUST】とします (例: `L0-library-overview`, `L2-principles`)。
    * `L4-domain/` 配下の技術スタックディレクトリ: 全体ルールに従ったケバブケースを【MUST】とします (例: `js-stack`, `python-stack`, `common`)。
* **`snippets/` 配下:**
    * サブディレクトリ名は、参照元ドキュメントの `id` と一致させることを【MUST】とします (例: `l2-design-principles/`)。
* **`media/` 配下:**
    * サブディレクトリ名は、メディアの種類を表すケバブケースを【SHOULD】使用します (例: `diagrams/`, `images/`)。

## 6. ファイル命名規則 (File Naming) {#h2-file-naming}

* **Markdown ドキュメント (`*.md`):**
    * ファイル名 (拡張子 `.md` を除く) は、そのファイルの **Front Matter ドキュメントID (`id` フィールド) と完全に一致させることを【MUST】**とします。 (CI検証対象)
    * 推奨形式: `layer-slug` (例: `l0-cairns-overview.md`, `l2-design-principles.md`, `l4-coding-guidelines-js.md`)。詳細は Front Matter `id` の項を参照してください。
    * Good: `l2-design-principles.md` (Front Matter `id: l2-design-principles`)
    * Bad: `L2-Design-Principles.md`, `design_principles.md`, `l2-design-principles_v2.md`
* **JSON Schema ファイル (`*.schema.json`):**
    * 全体ルールに従ったケバブケースを【MUST】とします (例: `cairns-front-matter.schema.json`, `common-defs.schema.json`)。
* **コードスニペット ファイル (`*.code.md`):**
    * ファイル名は `<principle-id>.code.md` の形式を【MUST】とします。
    * 配置場所は `snippets/<doc-id>/` ディレクトリ配下とすることを【MUST】とします。
    * **完全パス形式:** `snippets/<doc-id>/<principle-id>.code.md`
    * `principle-id` がドキュメント全体を表す場合 (例: L3以降の単一原則ドキュメントで推奨される `<doc-id>-main` 形式の場合) は、そのIDを使用します。
    * **言語の明示:** スニペットのプログラミング言語は、Markdown ファイル内のコードブロック構文 (例: ` ```python ... ``` `) を使用して明示することを【MUST】とします。
    * Good: `snippets/l2-design-principles/srp-good.code.md`
    * Good: `snippets/l3-dev-workflow/l3-dev-workflow-main.code.md`
    * Bad: `snippets/srp-good.code.ts`, `snippets/l2-design-principles/srp_good.code.md`
    * **整合性:** この命名規則は、`schema/patterns.schema.json` 内の `$defs.snippetPath` パターン (`^\.\/snippets\/.+\.code\.md$`) および `_dev_docs/document-map.md` の記述と**整合性が取れています**。
* **メディアファイル (画像、図等):**
    * 全体ルールに従ったケバブケースを【MUST】とします。
    * ファイル名から内容が推測できる、意味のある名前を付けることを【SHOULD】推奨します。必要に応じてドキュメントIDや原則IDをプレフィックスとして含めることも有効です。
    * Good: `l2-architecture-principles-event-driven-flow.png`, `logo-color.svg`
    * Bad: `image1.png`, `図1.jpg`
* **スクリプトファイル (`*.js`):**
    * **Node.js スクリプト言語統一の方針に基づき、ファイル名はケバブケース (`kebab-case`) を【MUST】**とします。
    * Good: `scripts/validate-schema.js`, `scripts/generate-rag-index.js`
    * Bad: `scripts/validate_schema.js`, `scripts/validateSchema.js`
    * (将来的に他の言語のスクリプトを追加する場合は、本ドキュメントを改訂し、その言語の命名規則を定義してください。)
* **GitHub関連ファイル:**
    * GitHub の標準的な命名規則に従ってください (例: `.github/ISSUE_TEMPLATE/bug_report.yml`)。
* **設定ファイル:**
    * 各ツール (Linter, Git, Node.js 等) の標準的な命名規則に従ってください (例: `.gitignore`, `.yamllint`, `package.json`)。

## 7. Front Matter フィールド命名規則 (Front Matter Field Naming) {#h2-front-matter-field-naming}

* **`id` (ドキュメントID):**
    * このドキュメントの一意な識別子です。
    * **ファイル名 (拡張子除く) と完全に一致させることを【MUST】**とします。(CI検証対象)
    * **Cairns リポジトリ全体で一意であることを【MUST】**とします。(CI検証対象)
    * **文字種:** **小文字英数字 (`a-z`, `0-9`) とハイフン (`-`) のみを使用【MUST】**とします。ドット (`.`) は使用できません。
    * **パターン:** `^[a-z0-9\-]+$` (**注意:** このパターンは、現在のスキーマ `patterns.schema.json#pattern-docId` (`^[a-z0-9\-\.]+$`) よりも厳格です。CI検証ではこちらの厳格な規約を優先します。)
    * **推奨形式:** `layer-slug` の形式を【SHOULD】推奨します。`layer` は `l0` から `l5`、`slug` はドキュメントの内容を表す短いケバブケースの文字列です。
        * 例: `l0-cairns-overview`, `l2-design-principles`, `l4-coding-guidelines-js`
    * Good: `l1-ethics-and-values`, `l4-testing-guidelines-python`
    * Bad: `L1_EthicsAndValues`, `testing-python` (Layer欠落), `l4.testing.guidelines.python` (ドット使用不可)
* **`core_principles[].principle_id` (原則ID):**
    * ドキュメント内で定義される各コア原則の一意な識別子です。
    * **同一ドキュメント内で一意であることを【MUST】**とします。(スキーマ制約)
    * **推奨形式:**
        * L2原則集など、複数の原則を定義する場合: 原則の内容を表す簡潔なケバブケースIDを【SHOULD】推奨します (例: `srp`, `dry`, `kiss`, `solid`)。
        * L3以降など、ドキュメント全体が一つの原則を表す形式の場合: `<doc-id>-main` の形式を【SHOULD】推奨します (例: `l3-dev-workflow-main`, `l4-coding-guidelines-js-main`)。
        * **注記:** 上記の形式はあくまで推奨です。ドキュメントが複数の主要原則を含むなど、正当な理由がある場合は、明確で一貫性があれば他の形式も許容されます。重要なのはドキュメント内での一意性です。
    * パターン: `^[a-z0-9-]+$` (`patterns.schema.json#pattern-principleId`)。
    * Good (L2): `solid`, `separation-of-concerns`
    * Good (L3+): `l3-team-collaboration-guidelines-main`
    * Bad: `SOLID`, `mainPrinciple`, `l3_dev_workflow_main`
* **参照系フィールド (Path/ID 形式):**
    * 以下のフィールドでパスや ID を参照する場合、指定された形式に従う必要があります。
        * `relationships[].from`, `relationships[].to`: ドキュメントID (`id`) または `ドキュメントID#原則ID` 形式。
        * `deprecation_info.replaced_by_doc`: ドキュメントID (`id`) 形式。
        * `deprecation_info.replaced_by_principle`: `ドキュメントID#原則ID` 形式。
        * `references[].doc_id`: ドキュメントID (`id`) 形式。
        * `detail_ref`, `localized_overrides.*.detail_ref`: アンカー (`#anchor-name`) または相対パス (`./path/to/file` or `../path/to/file`) 形式。アンカーは本ドキュメントの[セクション8](#h2-markdown-heading-id-anchor-naming)または[セクション8.5](#h3-relation-to-existing-anchors-reserved-ids)で定義される形式に従います。
        * `exceptions.policy_ref`: アンカーまたは相対パス形式。
        * `llm_usage_hints.prompt_template`: アンカーまたは相対パス形式。
        * `snippet_refs[]`: スニペットファイルへの相対パス形式 (`./snippets/<doc-id>/<principle-id>.code.md`)。
    * **参照先の存在:** CI で検証されるべき項目です。詳細は[11. CIによる検証](#h2-ci-validation)を参照してください。

## 8. Markdown 見出しID（アンカー）命名規則 (Markdown Heading ID (Anchor) Naming) {#h2-markdown-heading-id-anchor-naming}

このセクションでは、Markdown の見出し (`#`, `##`, `###` など) に手動で付与する ID (アンカー) に関する命名規則を定義します。

### 8.1 はじめに (目的と背景) {#h3-introduction-purpose-background}

Markdown パーサーによる見出しIDの自動生成は、以下のような課題があります。

* **不安定性:** 見出しテキストの変更によりIDが変わり、リンク切れの原因となります。
* **実装依存:** パーサーによって生成されるIDの形式（特に日本語を含む場合）が異なります（例: URLエンコード）。
* **可読性:** 自動生成されたID（特にURLエンコードされたもの）は読みにくく、保守性に劣ります。

これらの課題を解決し、安定的で一貫性のあるドキュメント内ナビゲーションを実現するため、一般的な見出し (`#`, `##`, `###` 等) には **手動による見出しIDの付与を必須**とし、そのための明確な命名規則を定めます。

### 8.2 基本原則 {#h3-basic-principles}

この見出しID命名規則は、本ドキュメントの[セクション2](#h2-guiding-principles)で定義された基本原則 (明確性、一貫性、簡潔性、互換性、自動化親和性、衝突回避) に従います。

### 8.3 命名規則 {#h3-naming-rules}

#### 8.3.1 ID形式 【MUST】 {#h4-id-format-must}

見出しIDは以下の形式を【MUST】とします。

````

<level>-<topic-slug>

````

* **`<level>`:** 見出しのレベルを示すプレフィックス。【MUST】 `h1`, `h2`, `h3` を使用します（必要に応じて `h4`～`h6` も使用可能ですが、文書構造は深くしすぎないことが推奨されます）。
* **`<topic-slug>`:** 見出しの内容を**英語**で表現する、ケバブケース (`kebab-case`) の文字列。【MUST】

**例:**

* `# はじめに` → `{ #h1-introduction }`
* `## 背景` → `{ #h2-background }`
* `### 詳細な手順` → `{ #h3-detailed-steps }`
* `## API 設計原則` → `{ #h2-api-design-principles }`

#### 8.3.2 使用文字・ケース 【MUST】 {#h4-character-set-case-must}

[セクション4](#h2-general-rules)で定義された全体ルールに従い、**小文字英数字 (`a-z`, `0-9`) とハイフン (`-`) のみ**を使用し、**ケバブケース (`kebab-case`)** を【MUST】とします。

#### 8.3.3 一意性 【MUST】 {#h4-uniqueness-must}

* 見出しIDは、**同一Markdownドキュメント内で一意**でなければなりません。(CI検証対象)
* 異なるセクションで同じような見出しが出現し、推奨形式 (`<level>-<topic-slug>`) でIDが重複してしまう可能性がある場合は、以下のいずれかの方法で一意性を確保してください。
    1.  **見出し自体の具体化:** 見出しテキストをより具体的に修正し、結果として生成される `<topic-slug>` が自然に異なるようにする。（推奨）
    2.  **Slugの調整:** `<topic-slug>` に、より上位のセクションを示す語を追加するなどして一意化する。
        * 例: セクションAの `### ツール設定` → `{ #h3-tool-configuration }`
        * 例: セクションBの `### ツール設定` → `{ #h3-section-b-tool-configuration }` （または見出しを「ツール設定 (セクションB)」などにする）

### 8.4 日本語見出しへの対応 【MUST】 {#h3-handling-japanese-headings-must}

日本語の見出しが大半を占める場合でも、IDには**英語の `<topic-slug>` を使用する**ことを原則とします【MUST】。これは、互換性、自動化親和性、および将来的な多言語展開の容易性を確保するためです。

以下に、日本語見出しから英語の `<topic-slug>` を生成するための推奨プロセスと補助的な考え方を示します。

#### 8.4.1 推奨プロセス {#h4-recommended-process}

1.  **内容理解:** 日本語の見出しが示す内容・トピックを正確に理解します。
2.  **英語キーワード抽出:** 内容を最も的確に表す、簡潔で分かりやすい**英語**のキーワードまたは短いフレーズを考えます。
3.  **ケバブケース変換:** 抽出した英語キーワード/フレーズを、小文字のケバブケースに変換します（スペースをハイフンに置き換え、特殊文字を除去）。

**例:**

* `## 導入前の注意点` → (内容: Points to note before introduction) → 英語: `pre-introduction-notes` → Slug: `pre-introduction-notes` → ID: `h2-pre-introduction-notes`
* `### データ整合性の確保` → (内容: Ensuring data consistency) → 英語: `ensure-data-consistency` → Slug: `ensure-data-consistency` → ID: `h3-ensure-data-consistency`

#### 8.4.2 補助ツールと注意点 (オプション) {#h4-auxiliary-tools-notes-optional}

英語 slug の生成を補助するために以下のツールを利用できますが、最終的な品質は人間が担保する必要があります。

* **機械翻訳:** DeepL や Google Translate などの機械翻訳ツールを使って、日本語見出しから英語 slug の候補を得ることができます【MAY】。
    * **注意:** 機械翻訳の結果は**必ず人間がレビューし**【MUST】、不自然な表現や長すぎる場合は修正してください。意図した内容を正確に反映しているか、簡潔かを確認します。
* **ローマ字変換:** 固有名詞（地名、人名など）や、適切な英訳が難しい専門用語に対して、限定的にローマ字（**ヘボン式推奨**）を使用することも許容されます【MAY】。
    * **注意:** ローマ字は一般的に英語 slug よりも可読性が劣るため、可能な限り**英語 slug を優先**してください【SHOULD】。ローマ字を使用する場合も、ケバブケースのルール ([セクション4](#h2-general-rules)参照) に従います。
    * 例: `# 霞が関` → `{ #h1-kasumigaseki }` (ローマ字使用)
    * 例: `# 新宿区の取り組み` → `{ #h1-shinjuku-ward-initiatives }` (英語 slug 優先)

**重要:** どのような方法で slug を生成するにしても、**一貫性**（同じ概念には同じ slug を使う）と**明確性**を保つことが最も重要です。不明な場合はチーム内で相談し、用語集 (`l0-glossary.md` など) との整合性を図ることも有効です。

### 8.5 既存アンカー形式との関係 (Reserved IDs / Relation to Existing Anchors) {#h3-relation-to-existing-anchors-reserved-ids}

本セクションで定義する一般的な見出しID (`<level>-<topic-slug>`) は、以下の**特定の目的のために定義されたアンカー形式とは区別**し、その指定された用途以外での使用を避けてください【SHOULD】。

* **`#doc-body`:** ドキュメント本文全体を参照するための推奨アンカー ([セクション7](#h2-front-matter-field-naming) `detail_ref` 参照)。通常、Markdown ファイルの冒頭に `<a id="doc-body"></a>` として記述します。
* **`#<principle_id>-details`:** 各コア原則の詳細説明セクションを参照するための推奨アンカー ([セクション7](#h2-front-matter-field-naming) `detail_ref` 参照)。原則定義の近くの見出しやアンカー (`<a id="...">`) で使用します。

これらの特定のアンカーは、Front Matter の `detail_ref` などから参照され、ドキュメント構造やツール連携において特別な意味を持つ場合があります。一般的な見出しには、本セクションで定義する `<level>-<topic-slug>` 形式を使用してください。

### 8.6 Markdownでの記述方法 【推奨】 {#h3-markdown-syntax-recommended}

Markdownで見出しに手動IDを付与するには、一般的に以下の方法があります。

1.  **GFM (GitHub Flavored Markdown) 形式:** 見出し行の末尾に `{ #id-string }` を記述します。
    ```markdown
    ## 背景 {#h2-background}
    ```
2.  **HTML直接記述:** HTMLの `<h1>`～`<h6>` タグを使用し、`id` 属性を指定します。
    ```html
    <h2 id="h2-background">背景</h2>
    ```

**推奨:** **GFM形式 `{ #id-string }`** は、多くのMarkdown処理系（GitHub, GitLab, Pandoc, 一部の静的サイトジェネレーター等）でサポートされており、互換性が高いため推奨します【SHOULD】。プロジェクトで使用するMarkdownパーサー/レンダラーがサポートする形式を確認し、統一してください。

### 8.7 具体例 {#h3-examples}

```markdown
# プロジェクト概要 {#h1-project-overview}

これはプロジェクトの概要です。

## 主な機能 {#h2-main-features}

主要な機能について説明します。

### 機能A: データ入力 {#h3-feature-a-data-entry}

データ入力機能の詳細です。

### 機能B: レポート生成 {#h3-feature-b-report-generation}

レポート生成機能の詳細です。

## 開発プロセス {#h2-development-process}

開発プロセスについて説明します。

### 要件定義 {#h3-requirements-definition}

要件定義フェーズについて。

### 設計 {#h3-design}

設計フェーズについて。

#### 基本設計 {#h4-basic-design}

基本設計の詳細。

## 参考文献 {#h2-references}

参考文献リスト。
````

### 8.8 考慮事項 {#h3-considerations}

  * **ツール依存性:** MarkdownでのID付与方法 (`{ #... }` vs HTML) は、使用するMarkdownパーサーや静的サイトジェネレーターのサポート状況に依存します。プロジェクト開始時、またはツール変更時に互換性を確認する必要があります。
  * **導入コスト:** 既存のドキュメントにこの規則を適用する場合、すべての見出しにIDを付与する作業コストが発生します。新規作成時から適用することが望ましいです。
  * **保守:** 見出しの内容が変更された場合でもIDは変更しないことが原則ですが、内容とIDが大きく乖離した場合は、IDの変更と参照箇所の修正を検討する必要があります（影響範囲を考慮）。

## 9. 命名規則の変更手順 (Changing Naming Conventions) {#h2-changing-naming-conventions}

命名規則自体を変更する場合や、既存のフォルダ/ファイル/ID 名を変更する場合は、以下の手順と注意点を考慮してください。

1.  **影響範囲の調査:** 変更対象の名前（フォルダ、ファイル、ID、アンカー）がリポジトリ内のどこから参照されているか（ドキュメント本文、Front Matter の参照系フィールド、CI スクリプト、外部システム等）を特定します。
2.  **変更の実施:**
      * ファイル/フォルダ名を変更する場合は、Git の履歴を維持するために `git mv <old-name> <new-name>` コマンドを使用することを【MUST】とします。
      * Front Matter ドキュメントID (`id`) を変更する場合は、対応するファイル名も同時に変更します。(MUST)
      * 特定したすべての参照箇所を、新しい名前に合わせて修正します。見出しIDを変更した場合、そのIDへのリンク箇所も修正が必要です。
3.  **検証:** 変更後にローカルおよび CI で各種検証 (Lint, スキーマ検証, 参照整合性チェック、ID/アンカー一意性・形式チェック等) を実行し、問題がないことを確認します。
4.  **合意形成:** 影響範囲が大きい、または基本的なルールに関わる変更の場合は、Pull Request 等を通じてチーム内で変更内容をレビューし、合意を得ることを【MUST】とします。

## 10. 具体例 (Examples) {#h2-examples}

| 対象                       | ルール/推奨                                       | Good Example                                         | Bad Example                                      |
| :------------------------- | :------------------------------------------------ | :--------------------------------------------------- | :----------------------------------------------- |
| **フォルダ** | ケバブケース                                      | `L2-principles`, `js-stack`, `diagrams`              | `L2_Principles`, `JSStack`, `Diagrams`           |
| **ファイル (`.md`)** | `id` と一致, `layer-slug` 推奨                    | `l2-design-principles.md`                            | `L2-design-principles.md`, `design_principles.md` |
| **ファイル (`.code.md`)** | `snippets/<doc-id>/<pid>.code.md`                 | `snippets/l2-design-principles/srp-good.code.md`   | `snippets/srp.code.ts`, `snippets/l2-dp/srp_good.code.md` |
| **ドキュメントID (`id`)** | ファイル名一致, 全体ユニーク, `layer-slug` 推奨, ドット不可 | `l3-dev-workflow`                                    | `L3DevWorkflow`, `dev-workflow` (Layer欠落), `l3.dev.workflow` |
| **原則ID (`pid`)** | ドキュメント内ユニーク, L3+は `<id>-main` 推奨      | `srp` (L2), `l3-dev-workflow-main` (L3)            | `SRP`, `mainPrinciple`, `l3_dev_workflow_main`   |
| **見出しID ([セクション8](#h2-markdown-heading-id-anchor-naming))** | `<level>-<topic-slug>`, ドキュメント内ユニーク      | `#h1-introduction`, `#h3-detailed-steps`             | `#Introduction`, `#h3_detailed_steps`            |
| **特定アンカー([セクション8.5](#h3-relation-to-existing-anchors-reserved-ids))** | `#doc-body`, `#<pid>-details` 推奨                | `#doc-body`, `#srp-details`                          | `#DocBody`, `#srp_details`                       |
| **スクリプト (`*.js`)** | ケバブケース【MUST】                              | `scripts/validate-schema.js`                         | `scripts/validate_schema.js`, `scripts/validateSchema.js` |

## 11. CIによる検証 (CI Validation) {#h2-ci-validation}

以下の命名規則および関連する整合性に関する項目は、CI パイプライン ([`l3-ci-workflow-guidelines.md`](../docs/L3-process/l3-ci-workflow-guidelines.md) 参照 - ※リンク先は仮) によって自動的に検証されることが期待されます。

  * **ファイル名とドキュメントID (`id`) の一致:** Markdown ドキュメント (`*.md`) のファイル名 (拡張子除く) と `id` が一致しているか。(MUST)
  * **ドキュメントID (`id`) の一意性:** リポジトリ全体で `id` が重複していないか。(MUST)
  * **ドキュメントID (`id`) の文字種/形式:** `id` がパターン `^[a-z0-9\-]+$` に従っているか。(MUST - ※CI実装時にスキーマよりこちらの規約を優先してチェック)
  * **コードスニペットパス形式:** `snippet_refs[]` で参照されるパスが規約 (`./snippets/<doc-id>/<principle-id>.code.md`) に従っているか。(MUST - CI実装による)
  * **Markdown 見出しID付与の網羅性:** (`#`, `##`, `###` レベルの見出しにIDが付与されているか。) (オプション - CI実装による)
  * **Markdown 見出しID形式:** 見出しIDがパターン `^h[1-6]-[a-z0-9\-]+$` に従っているか。(MUST - CI実装による)
  * **Markdown 見出しID一意性:** 同一ドキュメント内で見出しIDが重複していないか。(MUST - CI実装による)
  * **(前提) 参照先の存在:** 参照系フィールド (`relationships`, `references[].doc_id`, `snippet_refs[]`, `detail_ref` のパスやアンカー等) が指すファイル、ID、アンカーが実際に存在するか。これは命名規則そのものではありませんが、正しい命名に基づいた参照の前提となります。(MUST - CI実装による)

CI でエラーが検出された場合、Pull Request のマージがブロックされる可能性があります。開発者はローカル環境でも、可能であれば提供される検証スクリプト ([`scripts/`](../scripts/)) を実行し、問題を早期に修正することが推奨されます。

## 12. 改訂履歴 (Revision History) {#h2-revision-history}

| バージョン | 日付         | 変更内容                                                                                                                                                                                          | 変更者         |
| :--------- | :----------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------------- |
| 1.0.0      | 2025-04-29   | 初版作成                                                                                                                                                                                          | Cizimy         |