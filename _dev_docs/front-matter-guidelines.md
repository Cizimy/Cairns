# Front Matter 記述ガイドライン

## 1. はじめに

### 1.1. このガイドラインの目的と対象読者

#### 目的

このガイドラインは、Cairns プロジェクトにおける Markdown ドキュメントの品質、一貫性、および自動処理（検証、インデックス作成、ガバナンス等）を担保するために、ドキュメントのメタデータである **Front Matter** の記述方法を標準化することを目的とします。

主な目的は以下の通りです。

* 開発者やドキュメントコントリビューターが、Cairns プロジェクトの要件（JSON Schema 定義、カスタム検証ルール、命名規則、フォルダ構成など）に準拠し、正確かつ効果的に Front Matter を記述できるよう支援します。
* プロジェクト全体の目標である AI (RAG) 活用促進や開発者体験 (DX) 向上との整合性を確保し、将来のプロジェクト進化（LLM連携深化、ガバナンス強化）に対応できる記述基盤を確立します。
* [`template.md`](templates/template.md) や VSCode 拡張機能だけではカバーしきれない詳細なルール、ベストプラクティス、各フィールドの意図、そして **ローカルでのカスタム検証の重要性** について解説します。

#### 対象読者

このガイドラインは、以下の方々を対象としています。

* Cairns プロジェクトに関わるすべてのドキュメント作成者、編集者、レビュー担当者。
* プロジェクトの技術ツール（CI/CD、検証スクリプト、RAG Indexer、静的サイトジェネレーター等）の開発・保守担当者。
* プロジェクトのアーキテクチャ、情報管理、ガバナンスに関心を持つステークホルダー。

### 1.2. Front Matter の重要性 (一貫性、自動化、AI活用、ガバナンス)

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

### 1.3. 関連ドキュメントへのリンク

本ガイドラインを理解し、効果的に活用するために、以下の関連ドキュメントを参照することを強く推奨します。

* **JSON Schema:**
    * [`schema/cairns-front-matter.schema.json`](../../schema/cairns-front-matter.schema.json): Front Matter の正確な構造、型、必須項目、許容値などを定義する公式な定義。本ガイドラインの記述の根拠となります。
    * [`schema/patterns.schema.json`](../../schema/patterns.schema.json): ID やパスなどに使われる正規表現パターンを定義。特定のフィールドのフォーマットを確認する際に参照。
    * (その他: [`schema/common-defs.schema.json`](../../schema/common-defs.schema.json), [`schema/content-defs.schema.json`](../../schema/content-defs.schema.json), [`schema/metadata-defs.schema.json`](../../schema/metadata-defs.schema.json)): より詳細な共通定義や特定フィールド群の定義。

* **情報アーキテクチャと規約:**
    * [`_dev_docs/l0-cairns-overview.md`](../l0-cairns-overview.md): Cairns プロジェクト全体の目的、構造、基本方針を解説。本ガイドラインを読む上での前提知識として役立ちます。 *(追加)*
    * [`_dev_docs/document-map.md`](../document-map.md): Cairns プロジェクト全体のドキュメント体系 (L0-L5 レイヤー構造)、各ドキュメントの目的、CI で検証される項目などを定義。`layer` や `core_principles` の記述ルールなどを理解するために参照。
    * [`_dev_docs/naming-conventions.md`](../naming-conventions.md): フォルダ名、ファイル名、ドキュメント ID (`id`)、原則 ID (`principle_id`) などの命名規則を定義。特に **`id` とファイル名の一致ルール** は厳守事項です。
    * [`_dev_docs/folder-structure.md`](../folder-structure.md): リポジトリ全体のフォルダ構成を定義。特に `snippets/`, `media/` 配下へのリソース配置とパス構造のルールを参照。

* **テンプレートとツール:**
    * [`_dev_docs/templates/template.md`](../templates/template.md): 新規ドキュメント作成時に使用する基本テンプレート。主要なフィールドと簡単な説明が含まれます。
    * [`_dev_docs/devtools-list.md`](../devtools-list.md): プロジェクトで使用される Linter、Validator、CI ツールなどのリスト。特に、**ローカルでのカスタム検証スクリプトの必要性** とその背景 (VSCode 拡張機能の限界等) を理解するために参照。

* **プロジェクト管理と運用:**
    * `_dev_docs/l0-glossary.md` (**作成中：完成次第参照必須**): プロジェクト内で使用される共通の専門用語や略語の定義。
    * `_dev_docs/l0-contribution-guide.md` (**作成中：完成次第参照必須**): ドキュメントの作成・更新プロセス、レビュー手順など、貢献方法の詳細。
    * `_dev_docs/l0-governance.md` (**作成中：完成次第参照必須**): ドキュメントのライフサイクル管理、承認プロセス、`status` 変更に伴う要件 (`checksum`, `signed_by` 等) の詳細。
    * [`_dev_docs/action-plan.md`](../action-plan.md): プロジェクト全体の開発計画。AI連携 (RAG) やガバナンス強化など、将来的な方向性を理解する上で参考になります。

---

*(ここにセクション 2 以降の内容が続きます)*
