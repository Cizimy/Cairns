# Cairns ドキュメント体系 マップ v1.0 (改訂案) {#h1-cairns-document-map}

バージョン: 1.0 (改訂案)  
最終更新日: 2025-04-28 (改訂提案日)  
目的: このドキュメントは、Project Philosophy Library (Cairns) を構成するドキュメントの全体像、各ドキュメントの目的、構造、および運用ルールを示す情報アーキテクチャ (IA) マップです。人間とAI開発エージェント双方にとって、Cairns内の知識を効率的に発見・理解・活用するための指針となります。  
**基本方針:**

* **6層構造:** 抽象度の高い普遍的な原則から、具体的な実装ガイドラインまでを階層化。  
* **単一ファイル・二層構造:** 各ドキュメントは「YAML Front Matter (構造化/AI向け) + Markdown本文 (非構造化/人間向け)」で構成。  
* **スキーマ駆動:** YAML Front Matterは提供されたJSON Schema (cairns-front-matter.schema.json v2.0 およびその改訂版) に準拠。  
* **CIによる品質維持:** スキーマ準拠、ID一意性・整合性、参照整合性、時間整合性、言語整合性などをCIで自動検証。  
* **冗長歓迎・重複禁止:** 本文は学習コスト低減のため詳細に記述可能。重複内容はrelationshipsやreferencesで相互リンクし、正規化。

## L0: Library Overview (Cairns全体の概要・定義・ガバナンス) {#h2-l0-library-overview}

**役割:** Cairns全体の入り口。目的、構造、用語、運用ルール、貢献方法などを定義。

* l0-cairns-overview.md:  
  ### 目的 {#h3-l0-cairns-overview-purpose}
  Cairns全体の目的、対象読者、6レイヤー構造の説明、各ドキュメントの読み進め方、Cairnsの価値（AI/人間双方にとって）などを記述。  
  ### スキーマと構造 {#h3-l0-cairns-overview-schema-structure}
  * 単一ファイル・二層構造（YAML Front Matter + Markdown本文）を説明。  
  #### ID命名規約 {#h4-l0-cairns-overview-id-naming-convention}
    * パターン: ^[a-z0-9\-\.]+$ (必須)。  
    * 推奨形式: layer-slug (例: l2-design-principles, l4-coding-guidelines-js)。  
    * ファイル名 (拡張子除く) とFront-Matter id は**一致させることを必須**とする (CIで検証)。  
    * IDはCairns全体で**一意**であること (CIで検証)。  
  #### core_principlesの扱い {#h4-l0-cairns-overview-core-principles-handling}
    * 原則として全てのCairnsドキュメントで**必須** (minItems: 1)。空配列は不可。  
    * ただし、L5 (Ops & Runtime) など特定のレイヤーやドキュメントタイプにおいては、原則定義が馴染まない場合があるため、JSON Schemaの layer_defaults 定義により minItems: 0 を許容する場合がある（詳細はSchema定義を参照）。  
    * L2原則集: 関連する複数のコア原則を定義。  
    * L3以降 (原則として必須の場合): ドキュメント全体を代表する**一つの原則**を形式的に定義。その原則オブジェクトには必須フィールド (principle_id, title, status, summary, detail_ref) を含める。Principle ID例: l3-dev-workflow-main。  
  #### detail_ref命名ガイド {#h4-l0-cairns-overview-detail-ref-naming-guide}
    * Markdown本文内アンカー (#で始まる) または別ファイルへの相対パス (./, ../)。  
    * 本文全体を指す場合: #doc-body を推奨アンカーとする。  
    * 各コア原則の詳細説明: #<principle_id>-details (例: #srp-details) を推奨アンカーとする。  
    * 参照先の存在はCIで検証。  
  ### 主要メタデータ解説 {#h3-l0-cairns-overview-metadata-explanation}
  * id, title, layer, version, status, authors, owner, last_updated, created_at, expires_at, review_cycle_days 等の基本的な管理情報。  
  * doc_type: ドキュメントの種類を示す識別子 (例: guideline, reference, playbook, adr_template, policy, report)。検索性向上や自動処理に利用 (Schemaで定義)。  
  * abstract, summary, detail_ref: 3段階要約によるAI/人間向け情報の提供。  
  * applicable_contexts: 適用技術スタック、プロジェクトフェーズ等を定義。  
  * target_audience, maturity, risk_level, visibility: ドキュメントの特性を定義。学習パス生成への活用構想も記述。  
  * relationships: ドキュメント間の関連性 (refines, depends_on, relates_to, example_of 等）を定義。rel_type の積極的な付与と視覚化ツール (例: Docusaurus Graph View) 活用を推奨。参照先の存在はCIで検証。  
  * deprecation_info: 非推奨ドキュメント/原則の後継を示す。参照先の存在はCIで検証。  
  * license, checksum, signed_by: APPROVED/FIXEDステータスで必須。運用は l0-governance.md 参照。  
  * keywords, taxonomies: 検索性向上のためのタグ。  
  * media, templates, exceptions, prerequisite_documents, references, a11y, llm_usage_hints, localized_overrides: 補助的メタデータ。  
  ### 品質維持プロセス {#h3-l0-cairns-overview-quality-assurance-process}
  #### CI/CDによる自動検証 {#h4-l0-cairns-overview-ci-cd-validation}
    * **CI/CDによる自動検証:** スキーマ準拠チェックに加え、以下の外部検証が必須であることを明記。詳細は l3-ci-workflow-guidelines.md 参照。  
      * **参照整合性:** detail_ref, snippet_refs, media.path, exceptions.policy_ref, relationships (from/to), references.doc_id, deprecation_info の参照先 (ファイルパス/アンカー/Doc ID/Principle ID) が存在するか。  
      * **ID一意性:** id (ドキュメントID)、principle_id (ドキュメント内) がCairns全体でユニークか。  
      * **ID-ファイル名整合性:** Front Matter id とファイル名 (拡張子除く) が一致するか。  
      * **時間整合性:** created_at <= last_updated <= expires_at が満たされているか。  
      * **有効期限チェック:** review_cycle_days が設定されている場合、expires_at が last_updated + review_cycle_days より未来かチェックし、必要に応じて更新を促す (警告)。  
      * **言語整合性:** language/preferred_langs と localized_overrides のキー (BCP-47) が整合しているか。  
  * レビュープロセス、バージョン管理、更新頻度 (review_cycle_days, expires_at) について。ガバナンス詳細は l0-governance.md 参照。  
  ### 関連リソース管理 {#h3-l0-cairns-overview-related-resource-management}
  * **スニペット:** snippets/<doc-id>/<principle-id>.code.md 形式で配置し、snippet_refs[] で必ず参照する規約を明記。存在確認はCI。  
  * **メディア:** 推奨ディレクトリ構造 (media/diagrams/, media/ui/等) と media[].type の例示。存在確認はCI。  
  * **冗長本文:** 長大なコードセクション等はビルド時拡張機能 (例: Marked.js) で折りたたみ表示する等の推奨プラクティスを記述。  
  ### RAGフレンドリIndex {#h3-l0-cairns-overview-rag-friendly-index}
  CIによる index.ndjson 自動生成ルール（対象フィールド、フォーマット）を定義。  
  ### 拡張性 {#h3-l0-cairns-overview-extensibility}
  L4ガイドラインなどが将来的に拡張可能であること。  
  ### 貢献方法 {#h3-l0-cairns-overview-contribution}
  Cairnsへの修正提案や新規作成のプロセス概要。詳細は l0-contribution-guide.md 参照。  
  ### 関連ポリシーへのリンク {#h3-l0-cairns-overview-related-policy-links}
  l0-glossary.md, l0-roadmap.md, l0-governance.md, l0-contribution-guide.md, l0-localization-policy.md へリンク。  
* l0-glossary.md:  
  * **目的:** Cairns内で頻繁に使用される重要な専門用語、プロジェクト固有の用語、略語などを一元的に定義。認識齟齬を防ぐ。  
* l0-roadmap.md (**新規**):  
  * **目的:** Cairns自体の開発計画、将来的な拡充方針、バージョンアップ計画などを記述。Cairnsの進化の方向性を示す。  
* l0-governance.md (**新規**):  
  * **目的:** Cairnsドキュメントのライフサイクル管理、ステータス遷移の承認プロセス、リリース判定基準、checksum生成・検証方法、signed_by付与のための署名フロー（役割、ツール、手順）を明文化。  
* l0-contribution-guide.md (**新規**):  
  * **目的:** Cairnsへの具体的な貢献方法（Issue起票、Pull Request作成手順、レビュープロセス、コーディング規約（もしあれば）、コミュニケーションチャネル）を詳細に記述。参加コストを下げる。  
* l0-localization-policy.md (**新規**):  
  * **目的:** 多言語対応の方針を定義。翻訳対象の選定基準、翻訳プロセス（機械翻訳＋レビュー等）、品質保証（QA）手順、共通訳語リスト（Glossary連携）、BCP-47キー管理、localized_overrides 更新ルールなどを定める。  

## 運用ベストプラクティス {#h2-operational-best-practices}
**(本セクションはマップ自体の運用指針であり、特定のファイルではない)**

* **LLMによる類似度チェックの導入検討:** CIプロセス等でドキュメント間の類似度を計算し、閾値を超えた場合に警告を出すことで、意図しない重複の発見を支援する（実験的）。  
* **3段階サマリの適切な記述:** abstract (〜120字)、summary (〜300字)、本文 (detail_refで参照) の各フィールドを、その目的に合わせて適切に記述・維持する。  
* l0-glossary.md **の逆引きIndex整備:** 用語集に、各用語が主に関連するCairnsドキュメントのIDリストを追記し、用語からの情報アクセス性を向上させる。  
* **ファイル改名時の** git mv **利用:** ドキュメントファイルをリネームまたは移動する際は、Gitの履歴追跡を維持するために git mv コマンドを使用する。  
* **PR前の草稿プロセス活用:** 新規作成や大幅な改訂を行う場合、いきなりPull Requestを作成するのではなく、NotionやGitHub Issueなどで草稿を作成し、早期にフィードバックを得るプロセスを推奨する。

## L1: Foundation/Philosophy (不変の価値観・基本理念) {#h2-l1-foundation-philosophy}

**役割:** 技術選択や設計判断の基盤となる、プロジェクトや組織の根本的な考え方や価値観を定義。

* l1-software-development-philosophy.md:  
  * **目的:** ソフトウェア開発の根本的な考え方、重視する価値観（例: 品質の捉え方、変化への対応、技術的卓越性の追求、シンプルさ、学習文化）を定義。  
* l1-ethics-and-values.md (オプション):  
  * **目的:** ソフトウェア開発における倫理規範、チームメンバーとして期待される行動規範、ダイバーシティ＆インクルージョンなど、より広範な価値観を定義する場合。  
* l1-legal-and-compliance.md (**新規**):  
  * **目的:** ソフトウェア開発およびプロジェクト遂行に関わる法的要求事項、業界標準、社内規程、倫理規範等の遵守に関する基本原則を定義。開発者が常に意識すべきコンプライアンス基盤を示す。

## L2: General Engineering Principles (普遍的な技術原則 - Why/What) {#h2-l2-general-engineering-principles}

**役割:** 技術非依存の**概念**と**動機付け (Why/What)** に焦点を当てる。各ファイルは関連する複数のコア原則を core_principles として定義。

* l2-design-principles.md:  
  * **目的:** ソフトウェア設計（クラス/モジュールレベル中心）における普遍的な原則（例: SOLID、KISS、DRY、YAGNI、関心の分離、凝集度と結合度）の概念とその重要性を解説。  
* l2-coding-principles.md:  
  * **目的:** コード記述における普遍的な原則（例: 可読性、保守性、シンプルさ、命名、コメント、エラーハンドリング基本思想、テスト容易性）の概念とその重要性を解説。  
* l2-testing-principles.md:  
  * **目的:** ソフトウェアテストにおける普遍的な原則（例: テスト目的、自動化価値、テストピラミッド、FIRST原則、AAAパターン概念、テスト容易性設計）の概念とその重要性を解説。  
* l2-data-management-principles.md:  
  * **目的:** データ管理における普遍的な原則（例: データ整合性、可用性vs一貫性、モデリング基本思想、セキュリティ考慮）の概念とその重要性を解説。  
* l2-security-principles.md:  
  * **目的:** セキュア開発における普遍的な原則（例: セキュアバイデザイン、最小権限、多層防御、入力値検証、依存関係管理）の概念とその重要性を解説。  
* l2-performance-principles.md:  
  * **目的:** パフォーマンス設計における普遍的な原則（例: 目標設定、計測と特定、最適化アプローチ、スケーラビリティ思考）の概念とその重要性を解説。  
* l2-api-design-principles.md (**新規**):  
  * **目的:** API設計（RESTful, GraphQL等）に関する技術非依存の原則（例: インターフェース設計思想、契約重視、バージョニング戦略）の概念とその重要性を解説。  
* l2-doc-principles.md (**新規**):  
  * **目的:** 効果的な技術ドキュメンテーション作成に関する原則（例: 対象読者意識、明確性、簡潔性、正確性、保守容易性、Why/What/Howの分離）の概念とその重要性を解説。  
* l2-architecture-principles.md (オプション):  
  * **目的:** より高レベルなアーキテクチャ（例: モノリス vs マイクロサービス、イベント駆動）に関する**システムレベルの**原則の概念とその重要性を扱う場合。l2-design-principles.md とのスコープの違いを明確にする。

## L3: Process & Collaboration (開発プロセス・チーム連携・CI/CD) {#h2-l3-process-collaboration}

**役割:** **チームとしての**開発・協業**手順**、**意思決定**プロセス、**自動化**ワークフローに焦点を当てる。ドキュメント全体を代表する1つの原則をcore_principlesに定義する運用（原則として）。

* l3-development-workflow.md:  
  * **目的:** チケット管理、バージョン管理（ブランチ戦略）、コードレビュープロセス、リリースプロセスなど、標準的な開発フローを定義。CI/CDによる品質チェックプロセスへの言及を含む（詳細はl3-ci-workflow-guidelines.md）。  
* l3-team-collaboration-guidelines.md:  
  * **目的:** コミュニケーション手段、ドキュメンテーション文化、情報共有、チーム内での円滑な協業のためのガイドライン。  
* l3-ai-developer-guidelines.md:  
  * **目的:** AI開発エージェントの効果的な活用法、プロンプトエンジニアリング、AI生成コードのレビューポイント、注意すべきアンチパターンなどを定義。  
* l3-technology-selection-principles.md:  
  * **目的:** 新技術導入時の評価基準、承認プロセス、技術スタック管理方針、技術的負債への向き合い方を定義。  
* l3-decision-records-guidelines.md (**新規**):  
  * **目的:** 設計や技術選択に関する意思決定プロセスとその記録方法（例: Architecture Decision Records - ADR）のガイドラインとテンプレートを提供。チーム横断での意思決定の追跡性を向上。  
* l3-ci-workflow-guidelines.md (**新規**):  
  * **目的:** CairnsリポジトリにおけるCI/CDパイプラインの具体的なステップ、使用ツール、検証項目（スキーマ、参照整合性、ID一意性・整合性、時間整合性、言語整合性、有効期限チェック、RAG Index生成等）とその責務を定義。GitHub Actionsサンプル等を含む。  
* l3-requirements-specification-principles.md (オプション):  
  * **目的:** 要件定義や仕様化プロセスにおける基本的な考え方（例: ユーザーストーリー、非機能要件定義、要求変更管理）を定義する場合。

## L4: Domain-Specific Guidelines (特定技術・領域ガイドライン - How) {#h2-l4-domain-specific-guidelines}

**役割:** 各技術スタックや領域に特化した具体的な規約、標準、パターン、推奨プラクティス、実装方法 (How) を記述。コード例 (snippet_refs活用) を豊富に含める。ドキュメント全体を代表する1つの原則をcore_principlesに定義する運用（原則として）。applicable_contexts や target_audience の活用が特に重要。技術スタックごとにサブディレクトリで管理。

* js-stack/ (JavaScript/TypeScript スタック)  
  * l4-coding-guidelines-js.md: JS/TSの具体的なコーディング規約、リンター/フォーマッター設定、言語機能利用指針、コード例。  
  * l4-design-patterns-js.md: JS/TSにおけるDI、エラー処理、イベント処理等の具体的な実装パターン、推奨ライブラリ利用法、コード例。  
  * l4-testing-guidelines-js.md: JS/TSにおけるテスト実装方法（Jest等）、モック戦略、各種テスト具体的手法、コード例。  
  * l4-frontend-architecture-guidelines-js.md (オプション): 特定JSフレームワーク（React, Vue等）利用時のコンポーネント設計、状態管理、API連携等の指針。  
  * l4-backend-api-guidelines-js.md (オプション): Node.js等でのAPI設計標準（RESTful, GraphQL）、認証・認可実装パターン、ORM利用ガイドラインなど。  
* vba-stack/ (VBA スタック)  
  * l4-coding-guidelines-vba.md: VBAの具体的なコーディング規約、命名規則、エラーハンドリング構文、Officeオブジェクトモデル注意点、コード例。  
  * l4-design-patterns-vba.md: VBAにおけるDI（手動）、クラス設計、イベント処理、長時間処理対策等の具体的な実装パターン、コード例。  
  * l4-testing-guidelines-vba.md: VBAにおけるテスト容易性設計、テストプロシージャ書き方、Debug.Assert活用、モッククラス作成例など。  
  * l4-frontend-design-vba.md: VBA/Accessフォームに特化した画面一覧、遷移図、UI/UX原則、ドキュメント標準。  
* common/ (技術スタック横断)  
  * l4-ux-accessibility.md (**新規・統合版**):  
    * **目的:** 技術スタックに依存しない共通のUXデザイン原則とアクセシビリティ（WCAG準拠）の具体的な実装指針、チェックリスト、ツール利用法などを統合的に提供。(a11y**フィールド活用例**)  
  * l4-persol-theme-guideline.md: 特定のUIテーマ（PERSOLテーマ）に基づく具体的なデザインガイドライン（カラー、タイポグラフィ、アイコン等）。l4-ux-accessibility.md の原則を特定のテーマで具現化する例として位置づけ。(内容レビュー・再構成。media**フィールド活用例**)  
* data/ (データ管理特化 - オプション)  
  * l4-database-design-guidelines-sql.md: （もし必要なら）特定のRDBMS（例: PostgreSQL, SQL Server）におけるテーブル/カラム設計標準、命名規則、インデックス戦略、クエリ最適化のヒントなど。

## L5: Ops & Runtime (運用・実行環境) {#h2-l5-ops-runtime}

**役割:** アプリケーションの運用、インフラ、実行環境に関する原則や戦略を定義。core_principles は必須ではない（Schemaの layer_defaults で minItems: 0 を設定）。

* l5-infrastructure-principles.md:  
  * **目的:** インフラ構成（クラウド利用方針、IaC採用）、ネットワーク設計、環境分離（開発、ステージング、本番）に関する基本方針を定義。  
* l5-deployment-strategy.md:  
  * **目的:** CI/CDパイプラインの設計思想、デプロイ戦略（Blue-Green, Canary等）、ロールバック手順に関する方針を定義。  
* l5-observability-guidelines.md:  
  * **目的:** アプリケーションやインフラの**観測可能性 (Observability)** を確保するための原則と戦略を定義。Logging, Metrics, Tracing (LMT) の収集・分析方法、SLI/SLO設定の考え方など。  
* l5-ops-playbook.md (**統合・改名**):  
  * **目的:** Site Reliability Engineering (SRE) の観点から、具体的なインシデント対応手順 (Runbook/Playbook)、エスカレーションプロセス、オンコール体制、ポストモーテム（事後検証）、および障害検知・報告・復旧プロセスなどを**統合的に**定義する。  
* l5-regulatory-ops.md (**新規**):  
  * **目的:** 特定の規制要件（例: Pマーク、業界特有のレギュレーション、障害者雇用関連法規等）に対応するための具体的な運用手順、チェックリスト、監査証跡の取得・管理方法などを定義。l1-legal-and-compliance.md で示された原則を運用レベルで具体化する。