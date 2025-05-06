# リファクタリング計画書 v1.0

## 1. 目的

`generate-prompt.js` のパフォーマンスと保守性を、既存テストを維持しつつ段階的に向上させる。

## 2. 主要な改善点

*   ファイル読み込みの並列化とキャッシュ導入 (`Promise.all`, `Map`)
*   正規表現の事前コンパイルによる効率化
*   エラーハンドリングの簡素化 (分割代入)
*   ログ出力の `debug` ライブラリへの統一

## 3. 進め方

*   各ステップを独立したコミットとして管理 (Conventional Commits 形式)
*   各ステップ完了後に `npm test` を実行し、テストがすべてパスすることを確認
*   新規・変更箇所に対するユニットテストを追加し、カバレッジを維持・向上
*   最終的にドキュメントを更新し、Pull Request を作成

## 4. 視覚的な計画

### タイムライン (Gantt チャート)

```mermaid
gantt
    dateFormat  YYYY-MM-DD
    title       リファクタリング計画タイムライン (想定)
    excludes    weekends
    %% `axisFormat` defaults to `%Y-%m-%d`
    axisFormat %m/%d

    section Step 0: ベースライン
    ブランチ作成・テスト確認 :crit, a1, 2025-05-07, 1d

    section Step 1: I/O 並列化 & キャッシュ
    実装 (fsCache.js, Promise.all) :a2, after a1, 2d
    ユニットテスト追加 (fsCache)     :a3, after a2, 1d

    section Step 2: RegExp 最適化
    実装 (RegExp 定数化)        :a4, after a1, 1d
    ベンチマークテスト追加        :a5, after a4, 1d

    section Step 3: formatError リファクタ
    実装 (分割代入)           :a6, after a1, 1d
    ユニットテスト追加 (エラーケース) :a7, after a6, 1d

    section Step 4: debug ライブラリ導入
    実装 (debug 置換)         :a8, after a1, 2d
    ログ制御テスト追加          :a9, after a8, 1d

    section Step 5: テスト拡充
    カバレッジ向上             :a10, after a3, 1d
    カバレッジ向上             :a10, after a5, 1d
    カバレッジ向上             :a10, after a7, 1d
    カバレッジ向上             :a10, after a9, 1d

    section Step 6: ドキュメント & PR
    ドキュメント更新           :a11, after a10, 1d
    PR作成・レビュー          :crit, a12, after a11, 2d
    マージ・リリース           :crit, a13, after a12, 1d
```

### ステップ依存関係 (フローチャート)

```mermaid
graph TD
    subgraph "前提"
        A[現状コード] --> B(Step 0: ブランチ作成 & テスト緑確認);
    end

    subgraph "並列改修タスク"
        B --> C(Step 1: I/O 並列化 & キャッシュ);
        B --> D(Step 2: RegExp 最適化);
        B --> E(Step 3: formatError リファクタ);
        B --> F(Step 4: debug ライブラリ導入);
    end

    subgraph "テスト & ドキュメント"
        C --> G(Step 5: テスト拡充 - fsCache);
        D --> H(Step 5: テスト拡充 - RegExp);
        E --> I(Step 5: テスト拡充 - formatError);
        F --> J(Step 5: テスト拡充 - debug);
        G & H & I & J --> K(Step 6: ドキュメント更新);
    end

    subgraph "完了プロセス"
        K --> L(PR作成 & レビュー);
        L --> M(マージ & リリース);
    end

    style B fill:#f9f,stroke:#333,stroke-width:2px
    style L fill:#ccf,stroke:#333,stroke-width:2px
    style M fill:#cfc,stroke:#333,stroke-width:2px