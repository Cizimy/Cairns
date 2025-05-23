## Cairns プロジェクト ブランチ戦略 v1.1 {#h2-cairns-project-branch-strategy}

**役割:** プロジェクトの設計/実装担当

**タスク:** Task ID 1.2 **ツール選定・リポジトリ準備** における サブタスク **1.2.2: リポジトリの基本的な設定を行う。** の成果物

**目的:**
Cairnsプロジェクトの特性と要件（ドキュメント中心、スキーマ駆動、CI/CDによる品質維持、人間とAIの利用、段階的開発、協業）を踏まえ、安定性、並行作業性、品質保証、レビュープロセスを担保するブランチ戦略を定義する。

**分析 (要約):**
Cairnsプロジェクトでは、検証済みの安定したドキュメント提供、CI/CDによる厳格な品質チェック、複数担当者による効率的な協業、ドキュメントライフサイクル管理、段階的な機能拡張を支援するブランチ戦略が求められます。

**ブランチ戦略:**

本プロジェクトでは、プロジェクトの初期段階から運用可能なシンプルさと安全性を両立し、将来的な拡張性も考慮した GitHub Flow をベースとした戦略を採用します。

## 1. 基本ブランチ構成: {#h2-basic-branch-structure}

### `main` ブランチ: {#h3-main-branch}

*   **役割:** リポジトリのデフォルトブランチ。**常に最新の「承認済み (`APPROVED` / `FIXED`)」かつ安定したドキュメントセット** を表します。SSGによる**本番環境へのデプロイ**や、**RAG Index 生成のソース**となります。
*   **保護ルール (必須設定):**
    *   直接 push 禁止。
    *   Pull Request (PR) 経由でのマージのみ許可。
    *   PR には、指定されたレビュアーによる **最低1つ以上の承認 (Approve)** を必須とします。
    *   CI/CDパイプラインによる**必須検証項目 (Lint, Schema検証、IDチェック等、`Action plan`のフェーズに応じて強化) がすべて成功**していることをマージの条件とします。

### フィーチャーブランチ (`feature/*`, `fix/*`, `docs/*` 等): {#h3-feature-branches}

*   **役割:** 新規ドキュメントの作成 (`feature`)、既存ドキュメントの修正 (`fix`)、その他リポジトリ関連の変更 (`docs`, `chore`等) など、**すべての開発・修正作業**はこのブランチで行います。
*   **命名規則 (推奨):** `[type]/[issue-number]-[short-description]` (例: `feature/15-add-l0-governance`)
*   **ライフサイクル:**
    1.  常に最新の `main` ブランチから分岐して作成します。
    2.  作業完了後、`main` ブランチに対して Pull Request を作成します。
    3.  PR がマージされた後、不要になったフィーチャーブランチは**原則として削除**します。

## 2. ワークフロー: {#h2-workflow}

1.  **作業開始:** 担当者は `main` からフィーチャーブランチを作成します。
2.  **ドキュメント作成/修正:** フィーチャーブランチ上で作業します。作業中は `status` を `DRAFT` や `WIP` に設定します。
3.  **ローカル検証 (強く推奨):** CI と同等の検証 (Lint, Schema 等) をローカルで実行できる環境 (例: npm スクリプト, pre-commit フック) を整備し、活用します。これにより PR 前の品質向上と手戻り削減が期待されます (具体的なツールや利用方法は `l0-contribution-guide.md` で案内予定)。
4.  **コミット & プッシュ:** 作業内容をコミットし、リモートにプッシュします。
5.  **Pull Request 作成:** `main` に対して PR を作成します。この際、担当者は `status` を `DRAFT`/`WIP` から `REVIEW` に変更することを推奨します (**具体的なルールは `l0-contribution-guide.md` で定義**)。
6.  **CI/CD 実行:** PR 作成/更新をトリガーとして CI パイプラインが自動実行され、結果が PR に表示されます。
7.  **レビュー:** レビュアーが PR 内容、CI 結果を確認し、承認または修正要求を行います。
8.  **ステータス更新と必須項目付与 (重要):**
    *   **ステータス更新:** PR をマージする権限を持つ担当者は、マージ操作と同時に、または直前のコミットで `status` を `APPROVED` または `FIXED` に更新します (**具体的な手順は `l0-governance.md` で定義**)。
    *   **必須項目 (`license`, `checksum`, `signed_by`):** `APPROVED`/`FIXED` ステータスに必要なこれらの項目は、`main` へのマージプロセスの一環として付与・検証される必要があります。理想的には CI/CD による自動化を目指しますが、初期段階では手動での付与や検証が必要になる可能性があります。**具体的な付与・検証のタイミング、方法、使用ツールについては、`l0-governance.md` および関連する CI/CD 実装、ツール選定で詳細を定義します。**
9.  **マージ:** CI が成功し、承認が得られ、ステータスと必須項目が適切に設定されたことを確認した後、PR を `main` にマージします。
10. **デプロイ/Index生成 (将来):** `main` ブランチへのマージをトリガーとして、SSG の本番環境への自動デプロイや RAG Index の自動更新が行われます (`Action plan` フェーズ2以降)。

## 3. リリース管理: {#h2-release-management}

*   **バージョンタグ:** Cairns ドキュメントセット全体としてのバージョン管理は、**Git のタグ** を用いて行います。`main` ブランチ上で主要な機能追加や変更がマージされ、リリース可能な状態になったと判断されたコミットに対して、レビュアーまたはリリース担当者が SemVer (`v1.0.0`, `v1.1.0` 等) に準拠したバージョンタグを付与します。これにより、特定のリリース時点の状態を容易に参照・再現できます。

## 4. 整合性・妥当性: {#h2-consistency-validity}

*   本戦略は、`Document map`, `JSON Schema`, `Action plan` の要件（CI/CD、レビュー、ライフサイクル管理、バージョン管理、貢献プロセス、品質維持）との整合性を確保しています。
*   ステータス管理と必須項目付与プロセスに関する責任とタイミングを明確化（関連ドキュメントでの定義を前提とする）ことで、運用の確実性を向上させます。

## 5. 将来的な拡張: {#h2-future-extensions}

プロジェクトの成熟度やニーズに応じて、以下の拡張を検討します。

### `develop` ブランチ導入: {#h3-develop-branch-introduction}

*   **検討トリガー (例):** 貢献者数が大幅に増加した場合、複数の大規模な改修を並行して進め、`main` マージ前に統合テストを行う必要性が高まった場合、安定したステージング環境 (プレビュー環境) が常時必要になった場合など。
*   **導入効果:** `main` ブランチの安定性をさらに高め、リリース前の最終確認プロセスを強化できます。

### ホットフィックスブランチ (`hotfix/*`): {#h3-hotfix-branches}

*   **運用フロー (基本):** `main` ブランチで公開中のドキュメントに緊急性の高い修正が必要になった場合、`main` から直接 `hotfix/*` ブランチを作成 → 修正 → `main` にマージし、パッチバージョンのタグ (例: `v1.0.1`) を付与します。(`develop` ブランチ導入後は `develop` にもマージします)。

## 結論: {#h2-conclusion}

本ブランチ戦略 (v1.1) は、Cairnsプロジェクトの初期段階から運用可能な、堅牢性と柔軟性を備えたものです。この戦略に基づき、リポジトリ設定および関連ドキュメントの作成を進めます。