import { jest, describe, test, expect } from '@jest/globals';
import { extractHeadings } from './generate-prompt.js'; // テスト対象をインポート

describe('extractHeadings Benchmark', () => {
  test('should handle markdown with a large number of headings (snapshot test)', () => {
    const headingCount = 1000;
    let largeMarkdown = '';
    for (let i = 1; i <= headingCount; i++) {
      const level = (i % 6) + 1; // Cycle through levels 1-6
      largeMarkdown += `${'#'.repeat(level)} Heading ${i} {#id-${i}}\nSome text under heading ${i}.\n`;
    }

    // console.time('extractHeadingsLarge'); // 計測開始 (デバッグ用)
    const headings = extractHeadings(largeMarkdown);
    // console.timeEnd('extractHeadingsLarge'); // 計測終了 (デバッグ用)

    // 結果の件数を確認
    expect(headings).toHaveLength(headingCount);

    // 結果の内容をスナップショットで確認 (実行時間ではなく、出力の一貫性を担保)
    // スナップショットには最初の5件と最後の5件のみを含める（ファイルサイズを抑えるため）
    const snapshotData = {
        firstFive: headings.slice(0, 5),
        lastFive: headings.slice(-5),
        totalCount: headings.length,
    };
    expect(snapshotData).toMatchSnapshot();
  });
});