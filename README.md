# Cairns (開発中 - WIP)

[![CI Status](<YOUR_CI_BADGE_URL>)](<YOUR_CI_LINK>) [![License](<YOUR_LICENSE_BADGE_URL>)](<YOUR_LICENSE_FILE>)
## 概要

このリポジトリは、**Cairns**プロジェクトのソースコードを管理します。Cairnsは、プロジェクトや組織における開発理念、原則、ガイドライン、プロセスなどを体系的に整理し、AIと人間の両方がアクセスしやすい知識基盤を構築することを目的としています。

**【注意】**
**本プロジェクトは開発中の初期段階です。** 多くのドキュメントや機能が未整備または未実装であり、内容が変更される可能性があります。

## 目的と特徴

ソフトウェア開発においては、思想、原則、プロセス、規約といった知識が重要ですが、これらは散在しがちで、共有や維持が困難な場合があります。Cairnsは、これらの知識を一元的に管理し、アクセスしやすくするための基盤を提供します。

1.  **体系的な知識整理 (6層構造):**
    * 普遍的な原則から具体的な実装ガイドラインまでを階層化 (L0〜L5) し、情報を構造的に整理します。これにより、関連する知識を発見しやすくなります。

2.  **構造化された情報提供 (スキーマ駆動):**
    * 各ドキュメントのメタデータ (YAML Front Matter) は [JSON Schema](schema/ppl-front-matter.schema.json) に準拠します。構造化された情報を提供することで、特にAIによる情報の解釈と活用を支援します。

3.  **品質維持の自動化 (CI):**
    * スキーマ準拠、ID整合性、参照整合性などをCI (継続的インテグレーション) によって自動検証し、知識基盤の信頼性を維持します。

4.  **AI連携の促進:**
    * 構造化データと詳細な本文、RAG (Retrieval-Augmented Generation) 用インデックス生成（予定）により、AIエージェントによる効率的な知識参照と活用を支援します。

5.  **人間向けの可読性:**
    * Markdownによる本文と、生成される [静的サイト](<YOUR_STATIC_SITE_URL>)（予定）を提供し、情報の閲覧性を高めます。
    ## はじめに (Getting Started)

Cairnsプロジェクトの詳細については、まず以下のドキュメントをご確認ください。

* **[Cairns 全体概要 (l0-ppl-overview.md)](docs/L0-library-overview/l0-ppl-overview.md):** プロジェクトの目的、構造、利用方法、基本方針などを解説しています。
* **[公開ドキュメントサイト](<YOUR_STATIC_SITE_URL>):** （準備中/公開後リンク設定）生成されたドキュメントはこちらから閲覧できます。
    ## リポジトリ構造 (Repository Structure)

* `docs/`: Cairns ドキュメント本体 (L0〜L5)。
    * `L0-library-overview/`: Cairns全体の定義、ガバナンス等。
    * `L1-foundation/`: 基本理念、価値観。
    * `L2-principles/`: 普遍的な技術原則。
    * `L3-process/`: 開発プロセス、チーム連携。
    * `L4-domain/`: 特定技術・領域ガイドライン。
    * `L5-ops/`: 運用・実行環境。
* `schema/`: ドキュメントFront Matterの [JSON Schema](schema/ppl-front-matter.schema.json) 定義ファイル。
* `snippets/`: ドキュメント内で参照されるコードスニペット。
* `scripts/`: プロンプト生成などの補助スクリプト。
* `_dev_docs/`: Cairnsプロジェクト自体の開発に関するドキュメント (Document map等)。
* `.github/`: GitHub Actionsワークフロー、Issue/PRテンプレート等（予定）。

## スクリプト (`scripts/`)

### `generate-prompt.js`

このスクリプトは、指定されたドキュメントとプロンプトタイプに基づいて、AI向けのプロンプトを生成します。

**Debug ログの有効化:**

スクリプトの詳細な動作を確認したい場合、環境変数 `DEBUG` を設定して実行します。

*   **すべての関連ログを表示:**
    ```bash
    DEBUG=generate-prompt* node scripts/generate-prompt.js [引数...]
    ```
*   **特定のスコープのログのみを表示 (例: スコープ決定ロジック):**
    ```bash
    DEBUG=generate-prompt:scope node scripts/generate-prompt.js [引数...]
    ```

詳細については、[パフォーマンス改善ドキュメント](docs/performance-improvements.md) を参照してください。

## 貢献方法 (Contributing)

Cairnsプロジェクトへのフィードバックや貢献は歓迎します。貢献方法、Issue起票、Pull Request作成手順については、以下のガイドラインを参照してください。

* **[貢献ガイドライン (l0-contribution-guide.md)](docs/L0-library-overview/l0-contribution-guide.md)** （作成中）
* Issue/PRテンプレートも準備中です。

## ライセンス (License)

このプロジェクトのライセンスは [<YOUR_LICENSE_FILE>](<YOUR_LICENSE_FILE>) を参照してください。（確定後更新、例: `LICENSE.md`）

## ステータスとロードマップ (Status & Roadmap)

* **ステータス:** 現在、Cairnsは **開発初期段階** です。多くのドキュメントや機能が未整備です。
* **ロードマップ:** Cairnsプロジェクトの開発計画や将来的な拡充方針については、以下を参照してください。
    * **[Cairns ロードマップ (l0-roadmap.md)](docs/L0-library-overview/l0-roadmap.md)** （作成中）

## 関連リンク (Related Links)

* **[用語集 (l0-glossary.md)](docs/L0-library-overview/l0-glossary.md)** （作成中）
* **[ガバナンス (l0-governance.md)](docs/L0-library-overview/l0-governance.md)** （作成中）

---

**注意:** 開発中のプロジェクトであり、仕様やドキュメント内容は変更される可能性があります。フィードバックは歓迎しますが、リソースの都合上、迅速な対応が難しい場合があります。