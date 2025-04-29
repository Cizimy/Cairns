---
id: l0-naming-conventions
title: "Cairns 命名規則定義"
layer: L0
version: "1.0.0" # Remains 1.0.0 as it's the final revision within the DRAFT phase based on review
status: DRAFT # Status remains DRAFT until formally approved
authors: ["Cizimy"]
owner: "34811615+Cizimy@users.noreply.github.com"
last_updated: "2025-04-29T19:27:45+09:00" # Updated time reflecting the final revision
created_at: "2025-04-29T19:07:07+09:00" # Original creation time
review_cycle_days: 180
# expires_at: ... # To be set based on review_cycle_days or specific policy
abstract: "Cairns プロジェクトにおけるフォルダ、ファイル、ID等の命名に関する規約を定義します。"
summary: "このドキュメントは、Cairns リポジトリ内の一貫性、発見性、自動処理の容易性を確保するための命名規則を定義します。フォルダ、ファイル、ドキュメントID (`id`)、原則ID (`principle_id`)、アンカー等の命名基準、推奨形式、必須ルール、および CI による検証項目について解説します。"
detail_ref: "#doc-body"
doc_type: guideline
keywords: ["naming convention", "id", "filename", "folder", "directory", "principle id", "anchor", "cairns", "L0", "guideline"]
core_principles:
  - principle_id: consistent-naming
    title: "Consistent Naming"
    status: DRAFT
    summary: "Establish and adhere to clear, consistent naming conventions across all repository artifacts (folders, files, IDs, anchors) to enhance clarity, discoverability, maintainability, and automation."
    detail_ref: "#doc-body"
relationships:
  - from: "l0-naming-conventions"
    to: "l0-folder-structure"
    rel_type: "relates_to"
    description: "Naming conventions apply to the artifacts defined in the Folder Structure document."
  - from: "l0-naming-conventions"
    to: "l0-document-map"
    rel_type: "refines"
    description: "Provides specific naming rules for IDs and file structures outlined in the Document Map."
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

## 1. はじめに (Introduction)

このドキュメントは、Cairns プロジェクトのリポジトリ内で使用されるフォルダ、ファイル、Front Matter フィールド (特に **ドキュメントID (`id`)** や **原則ID (`principle_id`)**)、および Markdown アンカーの命名に関する規約を定義します。

明確で一貫性のある命名規則は、以下の目的のために不可欠です。

* **一貫性と可読性:** リポジトリ全体の構造と内容の理解を容易にします。
* **発見性:** 開発者や AI が目的の情報を効率的に検索・発見できるようにします。
* **保守性:** ファイルや ID の変更、リファクタリングを容易にします。
* **自動化:** CI/CD パイプライン、検証スクリプト、静的サイトジェネレーターなどのツールが、命名規則に基づいてリソースを確実に特定し、処理できるようにします。
* **衝突回避:** ファイル名や ID の意図しない重複を防ぎます。

このドキュメントは、Cairns プロジェクトに参加するすべての開発者、コントリビューター、および関連ツール (AI エージェント含む) が従うべきルールを定めます。

## 2. 基本原則 (Guiding Principles)

Cairns の命名規則は、以下の基本原則に基づいています。

* **明確性 (Clarity):** 名前からその対象の内容や目的が推測できるようにします。略語の使用は、[用語集 (`l0-glossary.md`)](docs/L0-library-overview/l0-glossary.md) で定義されているなど、一般的に理解可能なものに限定します。
* **一貫性 (Consistency):** リポジトリ全体で同じ命名スタイルとパターンを適用します。
* **簡潔性 (Conciseness):** 不必要に冗長な名前は避けつつ、明確性を損なわない範囲で簡潔にします。
* **URL/ファイルシステム互換性 (Compatibility):** Web 上での利用や、様々な OS のファイルシステムで問題が発生しにくい文字のみを使用します。
* **自動化親和性 (Automation-Friendly):** スクリプト等で処理しやすい、予測可能で機械判読可能な形式を採用します。

## 3. 対象範囲 (Scope)

この命名規則は、以下のリポジトリ内アーティファクトに適用されます。

* フォルダ (ディレクトリ) 名
* ファイル名 (Markdown ドキュメント、スキーマ、スニペット、メディア、スクリプト、設定ファイル等)
* Front Matter フィールドの値 (特に `id`, `core_principles[].principle_id` および参照系フィールド)
* Markdown 本文内のアンカー (見出し ID)

## 4. 全体的なルール (General Rules)

特に指定がない限り、すべての命名において以下のルールが適用されます。

* **ケース (Case):** **ケバブケース (`kebab-case`) を【MUST】**とします。単語間はハイフン (`-`) で区切ります。
    * Good: `l2-design-principles`, `my-script.js`, `api-design-guidelines`
    * Bad: `l2_design_principles`, `MyScript.js`, `APIDesignGuidelines`
* **文字種 (Character Set):** **小文字英数字 (`a-z`, `0-9`) とハイフン (`-`) のみを【MUST】**とします。
    * **例外:** ファイル拡張子の前のドット (`.`)、設定ファイル名の先頭のドット (`.`) は許可されます。アンダースコア (`_`) は原則使用しません（一部のファイルタイプで慣習となっている場合は許容される場合がありますが、基本はハイフンを使用します）。
* **禁止文字 (Forbidden Characters):** スペース、大文字、**ドット (`.`)** (ファイル拡張子前を除く)、およびその他の特殊文字 (`!`, `@`, `#`, `$`, `%`, `^`, `&`, `*`, `(`, `)`, `+`, `=`, `{`, `}`, `[`, `]`, `|`, `\`, `:`, `;`, `"`, `'`, `<`, `>`, `,`, `?`, `/` 等) は【MUST NOT】使用します。
* **言語 (Language):** フォルダ名、ファイル名、ID 等は、原則として**英語を【MUST】**とします。プロジェクト共通言語が別途定義されている場合はそれに従います。

## 5. フォルダ/ディレクトリ命名規則 (Folder/Directory Naming)

* **ルートディレクトリ:** `docs`, `schema`, `snippets`, `media`, `_dev_docs`, `.github`, `scripts` 等、主要なディレクトリ名は上記の全体ルールに従います。[フォルダ/ファイル構成定義 (`l0-folder-structure.md`)](l0-folder-structure.md) を参照してください。
* **`docs/` 配下:**
    * レイヤーディレクトリ: `L[0-5]-<layer-name>` 形式を【MUST】とします (例: `L0-library-overview`, `L2-principles`)。
    * `L4-domain/` 配下の技術スタックディレクトリ: 全体ルールに従ったケバブケースを【MUST】とします (例: `js-stack`, `python-stack`, `common`)。
* **`snippets/` 配下:**
    * サブディレクトリ名は、参照元ドキュメントの `id` と一致させることを【MUST】とします (例: `l2-design-principles/`)。
* **`media/` 配下:**
    * サブディレクトリ名は、メディアの種類を表すケバブケースを【SHOULD】使用します (例: `diagrams/`, `images/`)。

## 6. ファイル命名規則 (File Naming)

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
    * **整合性:** この命名規則は、`schema/patterns.schema.json` 内の `$defs.snippetPath` パターン (`^\\.\\/snippets\\/.+\\.code\\.md$`) および `_dev_docs/document-map.md` の記述と**整合性が取れています**。
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

## 7. Front Matter フィールド命名規則 (Front Matter Field Naming)

* **`id` (ドキュメントID):**
    * このドキュメントの一意な識別子です。
    * **ファイル名 (拡張子除く) と完全に一致させることを【MUST】**とします。(CI検証対象)
    * **Cairns リポジトリ全体で一意であることを【MUST】**とします。(CI検証対象)
    * **文字種:** **小文字英数字 (`a-z`, `0-9`) とハイフン (`-`) のみを使用【MUST】**とします。ドット (`.`) は使用できません。
    * **パターン:** `^[a-z0-9\\-]+$` (**注意:** このパターンは、現在のスキーマ `patterns.schema.json#pattern-docId` (`^[a-z0-9\\-\\.]+$`) よりも厳格です。スキーマ側のパターンも将来的に `^[a-z0-9\\-]+$` に修正することを推奨します。)
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
        * `detail_ref`, `localized_overrides.*.detail_ref`: アンカー (`#anchor-name`) または相対パス (`./path/to/file` or `../path/to/file`) 形式。
        * `exceptions.policy_ref`: アンカーまたは相対パス形式。
        * `llm_usage_hints.prompt_template`: アンカーまたは相対パス形式。
        * `snippet_refs[]`: スニペットファイルへの相対パス形式 (`./snippets/<doc-id>/<principle-id>.code.md`)。
    * **参照先の存在:** CI で検証されるべき項目です。詳細は[11. CIによる検証](#11-ci-validation)を参照してください。

## 8. Markdown 本文アンカー命名規則 (Markdown Anchor Naming)

* **`detail_ref` から参照される主要アンカー:**
    * ドキュメント本文全体を示す場合: `#doc-body` を【SHOULD】推奨します。Markdown 冒頭に `<a id="doc-body"></a>` のように記述します。
    * 各コア原則の詳細説明セクションを示す場合: `#<principle_id>-details` の形式を【SHOULD】推奨します。該当セクションの見出し付近に `<a id="srp-details"></a>` のように記述するか、Markdown の見出し自動生成 ID がこの形式になるように見出しを記述します。
* **一般的な見出しID:**
    * Markdown パーサーによって自動生成される ID を利用することが多いですが、手動でアンカーを設定する場合や、自動生成 ID を意識して見出しを付ける場合は、全体ルールに従ったケバブケースを【SHOULD】推奨します。

## 9. 命名規則の変更手順 (Changing Naming Conventions)

命名規則自体を変更する場合や、既存のフォルダ/ファイル/ID 名を変更する場合は、以下の手順と注意点を考慮してください。

1.  **影響範囲の調査:** 変更対象の名前（フォルダ、ファイル、ID）がリポジトリ内のどこから参照されているか（ドキュメント本文、Front Matter の参照系フィールド、CI スクリプト、外部システム等）を特定します。
2.  **変更の実施:**
    * ファイル/フォルダ名を変更する場合は、Git の履歴を維持するために `git mv <old-name> <new-name>` コマンドを使用することを【MUST】とします。
    * Front Matter ドキュメントID (`id`) を変更する場合は、対応するファイル名も同時に変更します。(MUST)
    * 特定したすべての参照箇所を、新しい名前に合わせて修正します。
3.  **検証:** 変更後にローカルおよび CI で各種検証 (Lint, スキーマ検証, 参照整合性チェック等) を実行し、問題がないことを確認します。
4.  **合意形成:** 影響範囲が大きい、または基本的なルールに関わる変更の場合は、Pull Request 等を通じてチーム内で変更内容をレビューし、合意を得ることを【MUST】とします。

## 10. 具体例 (Examples)

| 対象                   | ルール/推奨                                      | Good Example                                            | Bad Example                                         |
| :--------------------- | :----------------------------------------------- | :------------------------------------------------------ | :-------------------------------------------------- |
| **フォルダ** | ケバブケース                                     | `L2-principles`, `js-stack`, `diagrams`                 | `L2_Principles`, `JSStack`, `Diagrams`              |
| **ファイル (`.md`)** | `id` と一致, `layer-slug` 推奨                   | `l2-design-principles.md`                               | `L2-design-principles.md`, `design_principles.md`   |
| **ファイル (`.code.md`)**| `snippets/<doc-id>/<pid>.code.md`              | `snippets/l2-design-principles/srp-good.code.md`      | `snippets/srp.code.ts`, `snippets/l2-dp/srp_good.code.md` |
| **ドキュメントID (`id`)** | ファイル名一致, 全体ユニーク, `layer-slug` 推奨, ドット不可 | `l3-dev-workflow`                                       | `L3DevWorkflow`, `dev-workflow` (Layer欠落), `l3.dev.workflow` |
| **原則ID (`pid`)** | ドキュメント内ユニーク, L3+は `<id>-main` 推奨 | `srp` (L2), `l3-dev-workflow-main` (L3)                 | `SRP`, `mainPrinciple`, `l3_dev_workflow_main`      |
| **アンカー** | ケバブケース, `#doc-body`, `#<pid>-details` 推奨    | `#doc-body`, `#srp-details`, `#error-handling`            | `#DocBody`, `#srp_details`, `#Error Handling`       |
| **スクリプト (`*.js`)** | ケバブケース【MUST】                             | `scripts/validate-schema.js`                            | `scripts/validate_schema.js`, `scripts/validateSchema.js` |

## 11. CIによる検証 (CI Validation) <a id="11-ci-validation"></a>

以下の命名規則に関する項目は、CI パイプライン ([`l3-ci-workflow-guidelines.md`](#) 参照 - ※リンク先は仮) によって自動的に検証されることが期待されます。

* **ファイル名とドキュメントID (`id`) の一致:** Markdown ドキュメント (`*.md`) のファイル名 (拡張子除く) と `id` が一致しているか。(MUST)
* **ドキュメントID (`id`) の一意性:** リポジトリ全体で `id` が重複していないか。(MUST)
* **ドキュメントID (`id`) の文字種:** `id` がパターン `^[a-z0-9\\-]+$` に従っているか。(MUST - ※CI実装時にスキーマよりこちらの規約を優先してチェック)
* **コードスニペットパス形式:** `snippet_refs[]` で参照されるパスが規約 (`./snippets/<doc-id>/<principle-id>.code.md`) に従っているか。(MUST - CI実装による)
* **(前提) 参照先の存在:** 参照系フィールド (`relationships`, `references[].doc_id`, `snippet_refs[]`, `detail_ref` のパス等) が指すファイルや ID が実際に存在するか。これは命名規則そのものではありませんが、正しい命名に基づいた参照の前提となります。(MUST - CI実装による)

CI でエラーが検出された場合、Pull Request のマージがブロックされる可能性があります。開発者はローカル環境でも、可能であれば提供される検証スクリプト ([`scripts/`](scripts/)) を実行し、問題を早期に修正することが推奨されます。

## 12. 改訂履歴 (Revision History)

| バージョン | 日付       | 変更内容                                                                                                                                                              | 変更者 |
| :------- | :--------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----- |
| 1.0.0    | 2025-04-29 | 初版作成                                                                                                                                                                | Cizimy |
| (1.0.0 Rev1)| 2025-04-29 | 監査/改善担当からのレビューフィードバック(1回目)を反映。コードスニペット拡張子を `.code.md` に統一、具体例修正、スクリプト命名規則明確化、CI検証項目修正等。                 | Cizimy |
| (1.0.0 Rev2)| 2025-04-29 | 監査/改善担当からのレビューフィードバック(2回目)およびNode.js言語統一決定を反映。スクリプトファイル命名をケバブケースに統一、ドキュメントIDパターンからドットを除外し規約を明確化。 | Cizimy |