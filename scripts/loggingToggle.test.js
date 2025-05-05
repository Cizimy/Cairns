import { jest, describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import execa from 'execa'; // execa をインポート
import path from 'path';
import { writeFile, unlink, mkdir, rmdir } from 'fs/promises'; // ファイル操作用

// テスト用のダミーファイルパスと内容
const testDir = path.resolve('temp-test-logging');
const targetDocPath = path.join(testDir, 'target.md');
const templatePath = path.join(testDir, 'writer-prompt-template.md');
const subTaskPath = path.join(testDir, 'sub-task.md');
const microTaskPath = path.join(testDir, 'micro-task.md');
const sectionListPath = path.join(testDir, 'section-list.yaml');
const outputPath = path.join(testDir, 'output.md');

const dummyYaml = `
sections:
  - title: Section 1
    id: s1
    level: 1
`;

// テスト実行前に一時ディレクトリとダミーファイルを作成
beforeAll(async () => {
  try {
    await mkdir(testDir, { recursive: true });
    await Promise.all([
      writeFile(targetDocPath, '# Existing Heading', 'utf8'),
      writeFile(templatePath, 'Template {{ CURRENT_SCOPE }}', 'utf8'),
      writeFile(subTaskPath, 'Sub task content', 'utf8'),
      writeFile(microTaskPath, 'Micro task content', 'utf8'),
      writeFile(sectionListPath, dummyYaml, 'utf8'),
    ]);
  } catch (error) {
    console.error('Failed to create test files:', error);
    throw error; // セットアップ失敗時はテストを中断
  }
});

// テスト実行後に一時ディレクトリとファイルを削除
afterAll(async () => {
  try {
    // await unlink(outputPath); // output.md はテストケース内で生成・削除される場合がある
    // await unlink(targetDocPath);
    // await unlink(templatePath);
    // await unlink(subTaskPath);
    // await unlink(microTaskPath);
    // await unlink(sectionListPath);
    await rmdir(testDir, { recursive: true }); // ディレクトリごと削除
     console.log(`Cleaned up test directory: ${testDir}`);
  } catch (error) {
     // ENOENT (Not Found) は無視してよい場合がある
     if (error.code !== 'ENOENT') {
        console.error('Failed to clean up test files:', error);
     }
  }
});


describe('Logging Toggle via DEBUG environment variable', () => {
  const scriptPath = path.resolve('scripts/generate-prompt.js'); // スクリプトへの絶対パス

  test('should NOT output debug logs when DEBUG is not set', async () => {
    const args = [
      '--target-doc', targetDocPath,
      '--prompt-type', 'writer',
      '--output', outputPath,
    ];

    // DEBUG 環境変数を設定せずに実行
    const { stdout, stderr } = await execa('node', [scriptPath, ...args], { reject: false }); // reject: false でエラー時も結果を取得

    // ユーザー向けの標準出力（成功メッセージなど）は含まれる可能性がある
    expect(stdout).toContain('✅ Prompt successfully generated');
    // stderr にエラーが出力されていないこと
    expect(stderr).toBe('');
    // stdout/stderr に debug ライブラリ特有のタイムスタンプやスコープ名が含まれていないことを確認
    // (例: "generate-prompt:scope ...")
    expect(stdout).not.toMatch(/generate-prompt:/);
    expect(stderr).not.toMatch(/generate-prompt:/);
     // 念のため、特定のデバッグメッセージが含まれていないことも確認
     expect(stdout).not.toContain('Determining next scope...');
     expect(stdout).not.toContain('Reading required files in parallel...');
  });

  test('should output specific debug logs when DEBUG=generate-prompt:scope is set', async () => {
    const args = [
      '--target-doc', targetDocPath,
      '--prompt-type', 'writer',
      '--output', outputPath,
    ];

    // 特定のスコープを指定して実行
    const { stdout, stderr } = await execa('node', [scriptPath, ...args], {
      env: { DEBUG: 'generate-prompt:scope' },
      reject: false,
    });

    // stderr に generate-prompt:scope のログが出力されることを確認
    // debug ライブラリはデフォルトで stderr に出力する
    expect(stderr).toContain('generate-prompt:scope Determining next scope...');
    expect(stderr).toContain('generate-prompt:scope Target document headings extracted.');
    expect(stderr).toContain('generate-prompt:scope Found next section:'); // 部分一致

    // 他のスコープのログが出力されていないことを確認
    expect(stderr).not.toContain('generate-prompt:main');
    expect(stderr).not.toContain('generate-prompt:repomix');

    // stdout にはデバッグログが含まれないことを確認
    expect(stdout).not.toMatch(/generate-prompt:/);
    // ユーザー向けの成功メッセージは stdout に出力される
    expect(stdout).toContain('✅ Prompt successfully generated');
  });

   test('should output all debug logs when DEBUG=generate-prompt* is set', async () => {
    const args = [
      '--target-doc', targetDocPath,
      '--prompt-type', 'writer',
      '--output', outputPath,
    ];

    // ワイルドカードですべてのスコープを指定して実行
    const { stdout, stderr } = await execa('node', [scriptPath, ...args], {
      env: { DEBUG: 'generate-prompt*' },
      reject: false,
    });

     // stderr に複数のスコープのログが出力されることを確認
     expect(stderr).toContain('generate-prompt:main Starting main execution...');
     expect(stderr).toContain('generate-prompt:scope Determining next scope...');
     // repomix は実行されるが、今回は repomix-output.md がないので repomix ログは出ない想定
     // expect(stderr).toContain('generate-prompt:repomix Executing repomix CLI via library...');
     expect(stderr).toContain('generate-prompt Extracting headings from source: targetDoc');

     // stdout にはデバッグログが含まれないことを確認
     expect(stdout).not.toMatch(/generate-prompt:/);
     // ユーザー向けの成功メッセージは stdout に出力される
     expect(stdout).toContain('✅ Prompt successfully generated');
   });

   // Optional: Test case for when repomix fails (if needed)
   // test('should handle repomix errors and log appropriately', async () => { ... });
});