## 📌 関連する Issue
---

## 📝 変更内容
* **(変更点1)**
* **(変更点2)**
* **Front Matter の変更点 (Cairnsドキュメントの場合):**
    * `id`: (変更なし / `new-doc-id`)
    * `version`: (変更なし / `1.0.0` -> `1.1.0`)
    * `status`: (変更なし / `DRAFT` -> `REVIEW`)
    * `last_updated`: (更新日時を記載 or 自動更新を期待)
    * `core_principles`: (変更なし / 新規追加 / 修正内容の概要)
    * `relationships`: (変更なし / 新規追加 / 修正内容の概要)
    * `abstract`/`summary`/`detail_ref`: (変更なし / 更新)
    * `checksum`/`signed_by`/`license`: (`APPROVED`/`FIXED` ステータス移行時に関連作業が必要な場合に言及。[`l0-governance.md`](./docs/L0-library-overview/l0-governance.md)参照)

---

## ✅ 事前確認チェックリスト
### 全ての変更に共通
- [ ] [`l0-contribution-guide.md`](./docs/L0-library-overview/l0-contribution-guide.md) のプロセスに従っている。
- [ ] 関連するIssueがリンクされている、またはこのPR単体で完結する内容である。
- [ ] コミットメッセージは規約 (例: Conventional Commits) に沿っている。
- [ ] (ローカルで実行可能なら) Lint (YAML, Markdown) をパスした。
- [ ] CIがパスすることを期待している (必要なテスト追加、設定変更等含む)。

### Cairnsドキュメント変更の場合
- [ ] Front Matter が [`cairns-front-matter.schema.json`](./schema/cairns-front-matter.schema.json) (または最新版) に準拠している。 (ローカルでの検証推奨: `ajv-cli` 等)
- [ ] ドキュメントID (`id`) とファイル名 (拡張子除く) が一致している。 ([`l0-cairns-overview.md`](./docs/L0-library-overview/l0-cairns-overview.md) ID-ファイル名整合性 参照)
- [ ] Front Matter の `version` が適切に更新されている (SemVer)。
- [ ] Front Matter の `last_updated` が更新されている (またはCI/マージ時に自動更新される)。
- [ ] Front Matter の `status` が適切に設定/更新されている ([`l0-governance.md`](./docs/L0-library-overview/l0-governance.md) 参照)。
- [ ] `abstract` (～120字), `summary` (～300字), `detail_ref` (本文への参照) が適切に記述・更新されている。
- [ ] `core_principles` が適切に定義/更新されている (L0-L4必須、L5不要、[`Document map`](./_dev_docs/cairns-document-map.md) 参照)。
    - [ ] 各 principle に `principle_id`, `title`, `status`, `summary`, `detail_ref` が含まれている (JSON Schema参照)。
    - [ ] `detail_ref` が本文中のアンカー (例: `#srp-details`) を正しく指している ([`l0-cairns-overview.md`](./docs/L0-library-overview/l0-cairns-overview.md) detail_ref 命名ガイド 参照)。
- [ ] `relationships` が適切に定義/更新されている ([`l0-cairns-overview.md`](./docs/L0-library-overview/l0-cairns-overview.md) relationships解説 参照)。
- [ ] `snippet_refs`, `media`, `templates`, `references`, `deprecation_info` 等で参照されるパス/IDが存在することを確認した (CIでのチェック対象 [`l0-cairns-overview.md`](./docs/L0-library-overview/l0-cairns-overview.md) 参照整合性)。
- [ ] 時間整合性 (`created_at <= last_updated <= expires_at`) を意識した (CIでのチェック対象 [`l0-cairns-overview.md`](./docs/L0-library-overview/l0-cairns-overview.md) 時間整合性)。
- [ ] 言語整合性 (`language`, `preferred_langs`, `localized_overrides` の BCP-47 キー) を意識した (CIでのチェック対象 [`l0-cairns-overview.md`](./docs/L0-library-overview/l0-cairns-overview.md) 言語整合性)。
- [ ] (もしあれば) 静的サイトのプレビューで表示崩れ等がないことを確認した (Task 2.6完了後)。

### スキーマ/CI/その他コード変更の場合
- [ ] 関連ドキュメント ([`l0-ci-workflow-guidelines.md`](./docs/L3-process/l3-ci-workflow-guidelines.md) 等) があれば更新した。
- [ ] 必要なテストコードを追加/更新した。
- [ ] 変更による影響範囲を理解し、必要に応じて関連ドキュメント等への影響も確認した。

---

## 💬 レビュアーへのコメント (任意)
---

## 🖼️ スクリーンショット (任意)