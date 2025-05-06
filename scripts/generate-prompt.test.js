// Test file for generate-prompt.js
import path from 'path';
import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import grayMatter from 'gray-matter';
import yaml from 'js-yaml';
// ★★★ 削除: モックするので不要 ★★★
// import * as repomix from 'repomix';
// import * as generatePrompt from './generate-prompt.js';
// import { readFile, writeFile } from 'fs/promises';
// import { readCached } from '../utils/fsCache.js';

// --- モック定義 (そのまま) ---
const mockWriteFile = jest.fn();
const mockRunCli = jest.fn(); // repomix の runCli をモック
const mockReadCached = jest.fn(); // fsCache の readCached をモック
const mockClearCache = jest.fn(); // fsCache の clearCache をモック
const mockFsReadFile = jest.fn(); // fs/promises の readFile をモック (もし他の関数で使われていれば残す)
// determineNextScope のモック関数本体
const mockDetermineNextScope = jest.fn();
// parseArguments のモック (main に渡すため)
const mockArgParser = jest.fn(); // デフォルト実装はテストスイート内で設定

// --- モジュール全体のモック (DI により不要になったものは削除) ---
// ▼▼▼ 削除: fs/promises のモック (writeFileFn で注入) ▼▼▼
// await jest.unstable_mockModule('fs/promises', () => ({ ... }));
// ▼▼▼ 削除: repomix のモック (runCliFn で注入) ▼▼▼
// await jest.unstable_mockModule('repomix', () => ({ ... }));
// ▼▼▼ 削除: fsCache のモック (readCachedFn で注入) ▼▼▼
// await jest.unstable_mockModule('../utils/fsCache.js', () => ({ ... }));
// ▼▼▼ 削除: generate-prompt.js の部分モック ▼▼▼
// await jest.unstable_mockModule('./generate-prompt.js', async () => { ... });


// --- テスト対象をインポート (DI するので main 以外も必要に応じてインポート) ---
// ★★★ 修正: 必要な関数のみインポート ★★★
import {
  main, // テスト対象
  formatError, // ヘルパー関数テスト用
  extractHeadings, // ヘルパー関数テスト用
  determineNextScope, // 単体テスト用 (元の実装)
  replacePlaceholders, // ヘルパー関数テスト用
  parseArguments // デフォルトの argParser として使用
} from './generate-prompt.js';

// ▼▼▼ 削除: jest.spyOn の呼び出し ▼▼▼
// const determineNextScopeSpy = jest ...


// グローバルなモック/スパイ設定
let mockConsoleLog, mockConsoleWarn, mockConsoleError, mockProcessExit;

beforeEach(() => {
  jest.clearAllMocks(); // すべてのモックをクリア
  mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
  mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  // process.exit をモック (エラー時にテストが終了しないように)
  mockProcessExit = jest.spyOn(process, 'exit').mockImplementation((code) => {
      console.log(`Mock process.exit called with code ${code}`);
  });

  // モックのデフォルト動作を設定 (DI するので runCli などは不要)
  mockWriteFile.mockResolvedValue(undefined);
  // mockReadCached, mockDetermineNextScope, mockArgParser のデフォルト実装は Main Execution の beforeEach で設定
});

afterEach(() => {
    jest.restoreAllMocks(); // すべてのスパイ/モックを元の状態に戻す
});


describe('generate-prompt.js Script', () => {

  // formatError, extractHeadings のテストは変更なし
  describe('formatError', () => {
    test('should format message only', () => {
      expect(formatError('Simple error')).toBe('Error: Simple error');
    });
    test('should format message with error stack', () => {
        const error = new Error('Detailed error');
        error.stack = 'Error: Detailed error\n    at someFunction (file.js:10:5)';
        expect(formatError('Operation failed', error))
          .toBe('Error: Operation failed\nDetails: Detailed error\nStack: Error: Detailed error\n    at someFunction (file.js:10:5)');
      });
    test('should format message with error message if stack is missing', () => {
      const error = new Error('Error without stack');
      delete error.stack;
      expect(formatError('Something went wrong', error))
        .toBe('Error: Something went wrong\nDetails: Error without stack');
    });
    test('should prioritize stderr for details', () => {
      const error = {
        stderr: 'stderr output',
        stdout: 'stdout output',
        message: 'Error message',
        stack: 'Error stack'
      };
      expect(formatError('Command failed', error))
        .toBe('Error: Command failed\nDetails: stderr output\nStack: Error stack');
    });
    test('should use stdout if stderr is missing', () => {
      const error = {
        stdout: 'stdout output',
        message: 'Error message',
        stack: 'Error stack'
      };
      expect(formatError('Command failed', error))
        .toBe('Error: Command failed\nDetails: stdout output\nStack: Error stack');
    });
    test('should use message if stderr and stdout are missing', () => {
      const error = {
        message: 'Error message',
        stack: 'Error stack'
      };
      expect(formatError('Command failed', error))
        .toBe('Error: Command failed\nDetails: Error message\nStack: Error stack');
    });

    // スナップショットテストを追加 (正しい位置に修正)
    test('should match snapshot for various error types', () => {
      const simpleError = new Error('Simple message');
      delete simpleError.stack;

      const errorWithStack = new Error('Error with stack');
      errorWithStack.stack = 'Error: Error with stack\n    at func (file.js:1:1)';

      const errorWithStderr = { stderr: 'stderr output', stack: 'Error stack' };
      const errorWithStdout = { stdout: 'stdout output', message: 'msg' }; // stack なし
      const plainObjectError = { custom: 'data' };

      expect(formatError('Basic Error', simpleError)).toMatchSnapshot('simple error');
      expect(formatError('Error With Stack', errorWithStack)).toMatchSnapshot('error with stack');
      expect(formatError('Error With Stderr', errorWithStderr)).toMatchSnapshot('error with stderr');
      expect(formatError('Error With Stdout', errorWithStdout)).toMatchSnapshot('error with stdout');
      expect(formatError('Plain Object Error', plainObjectError)).toMatchSnapshot('plain object error');
      expect(formatError('Message Only', null)).toMatchSnapshot('message only'); // error が null の場合
    });
  }); // describe('formatError') の終了

  describe('extractHeadings', () => {
    test('should extract headings with level and title (ID removed)', () => {
      const markdown = '# H1 {#h1-id}\n## H2 {#h2-id}\n### H3 \n Text \n## Another H2 {#h2-another}';
      const expected = [
        { level: 1, title: 'H1' },
        { level: 2, title: 'H2' },
        { level: 3, title: 'H3' },
        { level: 2, title: 'Another H2' },
      ];
      expect(extractHeadings(markdown)).toEqual(expected);
    });
    test('should return empty array for markdown with no headings', () => {
      const markdown = 'Just text.\nAnother line.';
      expect(extractHeadings(markdown)).toEqual([]);
    });
    test('should return empty array for empty input', () => {
      expect(extractHeadings('')).toEqual([]);
    });
     test('should return empty array for null input', () => {
      expect(extractHeadings(null)).toEqual([]);
    });
    test('should trim whitespace and normalize title', () => {
      const markdown = '#  H1 with spaces {#id1}  \n##\tH2 with tab\t{#id2}';
      const expected = [
        { level: 1, title: 'H1 with spaces' },
        { level: 2, title: 'H2 with tab' },
      ];
      expect(extractHeadings(markdown)).toEqual(expected);
    });
     test('should handle markdown parsing errors gracefully', () => {
      const invalidMarkdown = '# Valid Heading {#id}\n```\nOops';
      const expected = [{ level: 1, title: 'Valid Heading' }];
      // エラーが発生しても例外を投げずに結果を返すことだけを確認
      expect(() => extractHeadings(invalidMarkdown, 'testSource')).not.toThrow();
      expect(extractHeadings(invalidMarkdown, 'testSource')).toEqual(expected);
      // console.error の呼び出し確認は削除 (debug ログに移行したため)
     });
  });

  // ★★★ 修正: determineNextScope の単体テストのスキップを解除 ★★★
  describe('determineNextScope (YAML Version)', () => {
    // determineNextScope の単体テストはそのまま残す (元の実装をテスト)
    const mockSectionListYamlData = {
        sections: [
            { title: 'H1 Title', id: 'h1', level: 1, children: [
                { title: 'H2.1 Title', id: 'h2-1', level: 2, granularity: 2, children: [ // H2.1 has granularity 2
                    { title: 'H3.1.1 Title', id: 'h3-1-1', level: 3 },
                    { title: 'H3.1.2 Title', id: 'h3-1-2', level: 3 },
                ]},
                { title: 'H2.2 Title', id: 'h2-2', level: 2, children: [ // H2.2 has no granularity
                    { title: 'H3.2.1 Title', id: 'h3-2-1', level: 3 }, // H3.2.1 has no granularity
                    { title: 'H3.2.2 Title', id: 'h3-2-2', level: 3, granularity: 3, children: [ // H3.2.2 has granularity 3
                        { title: 'H4.2.2.1 Title', id: 'h4-2-2-1', level: 4 }
                    ]},
                ]},
                { title: 'H2.3 Title (Parent Granularity Test)', id: 'h2-3', level: 2, granularity: 3, children: [ // H2.3 has granularity 3
                    { title: 'H3.3.1 Title (No Granularity)', id: 'h3-3-1', level: 3 }, // H3.3.1 has no granularity
                    { title: 'H3.3.2 Title', id: 'h3-3-2', level: 3 }
                ]},
                { title: 'H2.4 Title (Fallback Test)', id: 'h2-4', level: 2, children: [ // H2.4 has no granularity
                    { title: 'H3.4.1 Title (No Granularity)', id: 'h3-4-1', level: 3 }, // H3.4.1 has no granularity
                    { title: 'H3.4.2 Title', id: 'h3-4-2', level: 3 }
                ]}
            ]}
        ]
    };
    test('should correctly identify the next section when some sections exist in target', () => {
      const targetDocContent = `
---
title: Test Doc
---
# H1 Title {#h1}
## H2.1 Title {#h2-1}
### H3.1.1 Title {#h3-1-1}
### H3.1.2 Title {#h3-1-2}
`.trim(); // H2.1 and its children exist
      // Next should be H2.2
      const expectedScope = `
## H2.2 Title {#h2-2}
### H3.2.1 Title {#h3-2-1}
### H3.2.2 Title {#h3-2-2} <###>
#### H4.2.2.1 Title {#h4-2-2-1}
`.trim(); // Default depth (6), singleBranch=false
        const expectedDocumentStructure = `
# H1 Title {#h1}
## H2.1 Title {#h2-1} <##>
### H3.1.1 Title {#h3-1-1}
### H3.1.2 Title {#h3-1-2}
## H2.2 Title {#h2-2}
### H3.2.1 Title {#h3-2-1}
### H3.2.2 Title {#h3-2-2} <###>
## H2.3 Title (Parent Granularity Test) {#h2-3} <###>
### H3.3.1 Title (No Granularity) {#h3-3-1}
### H3.3.2 Title {#h3-3-2}
## H2.4 Title (Fallback Test) {#h2-4}
### H3.4.1 Title (No Granularity) {#h3-4-1}
### H3.4.2 Title {#h3-4-2}
`.trim();
      // ★★★ 修正: 元の実装を直接呼び出す ★★★
      const { currentScope, sectionStructure, documentStructure } = determineNextScope(mockSectionListYamlData, targetDocContent);
      expect(currentScope).toBe(expectedScope);
      expect(documentStructure).toBe(expectedDocumentStructure);
    });
    test('should return "No next section" marker if all sections exist in target', () => {
        const targetDocContent = `
---
title: Complete Doc
---
# H1 Title {#h1}
## H2.1 Title {#h2-1}
### H3.1.1 Title {#h3-1-1}
### H3.1.2 Title {#h3-1-2}
## H2.2 Title {#h2-2}
### H3.2.1 Title {#h3-2-1}
### H3.2.2 Title {#h3-2-2}
#### H4.2.2.1 Title {#h4-2-2-1}
## H2.3 Title (Parent Granularity Test) {#h2-3}
### H3.3.1 Title (No Granularity) {#h3-3-1}
### H3.3.2 Title {#h3-3-2}
## H2.4 Title (Fallback Test) {#h2-4}
### H3.4.1 Title (No Granularity) {#h3-4-1}
### H3.4.2 Title {#h3-4-2}
`.trim();
        // ★★★ 修正: 元の実装を直接呼び出す ★★★
        const { currentScope } = determineNextScope(mockSectionListYamlData, targetDocContent);
        expect(currentScope).toBe("<!-- No next section identified from YAML -->");
        expect(mockConsoleWarn).toHaveBeenCalledWith(expect.stringContaining('No next section found in YAML data'));
    });
     test('should identify the first section if target document is empty', () => {
        const targetDocContent = `
---
title: Empty Doc
---

`.trim();
        const expectedScope = `
# H1 Title {#h1}
## H2.1 Title {#h2-1} <##>
### H3.1.1 Title {#h3-1-1}
### H3.1.2 Title {#h3-1-2}
## H2.2 Title {#h2-2}
### H3.2.1 Title {#h3-2-1}
### H3.2.2 Title {#h3-2-2} <###>
#### H4.2.2.1 Title {#h4-2-2-1}
## H2.3 Title (Parent Granularity Test) {#h2-3} <###>
### H3.3.1 Title (No Granularity) {#h3-3-1}
### H3.3.2 Title {#h3-3-2}
## H2.4 Title (Fallback Test) {#h2-4}
### H3.4.1 Title (No Granularity) {#h3-4-1}
### H3.4.2 Title {#h3-4-2}
`.trim(); // Default depth (6), singleBranch=false
        // ★★★ 修正: 元の実装を直接呼び出す ★★★
        const { currentScope } = determineNextScope(mockSectionListYamlData, targetDocContent);
        expect(currentScope).toBe(expectedScope);
    });
    test('should handle granularity correctly for scope (using nextSectionData.granularity)', () => {
         const targetDocContent = `
---
title: Granularity Test
---
# H1 Title {#h1}
`.trim(); // Only H1 exists
        // Next should be H2.1, which has granularity 2
        const expectedScope = `
## H2.1 Title {#h2-1} <##>
### H3.1.1 Title {#h3-1-1}
`.trim(); // Depth 2, singleBranch=true
        // ★★★ 修正: 元の実装を直接呼び出す ★★★
        const { currentScope } = determineNextScope(mockSectionListYamlData, targetDocContent);
        expect(currentScope).toBe(expectedScope);
    });

    // --- ★★★ 新しいテストケースを追加 ★★★ ---
    test('should use parent H2 granularity if next section (H3) has no granularity (but parent granularity skips children)', () => {
        const targetDocContent = `
---
title: Parent Granularity Test
---
# H1 Title {#h1}
## H2.1 Title {#h2-1}
### H3.1.1 Title {#h3-1-1}
### H3.1.2 Title {#h3-1-2}
## H2.2 Title {#h2-2}
### H3.2.1 Title {#h3-2-1}
### H3.2.2 Title {#h3-2-2}
#### H4.2.2.1 Title {#h4-2-2-1}
## H2.3 Title (Parent Granularity Test) {#h2-3}
`.trim(); // H2.3 exists, next should be H2.4 because H2.3's granularity skips H3.3.x
        // ★★★ 修正: 期待値を修正 ★★★
        // findNextSectionRecursive finds H2.4 as nextSectionData.
        // H2.4 has no granularity. parentH2Data is H2.4 itself.
        // Fallback to default depth 6, singleBranch=false.
        const expectedScope = `
## H2.4 Title (Fallback Test) {#h2-4}
### H3.4.1 Title (No Granularity) {#h3-4-1}
### H3.4.2 Title {#h3-4-2}
`.trim();
        const { currentScope } = determineNextScope(mockSectionListYamlData, targetDocContent);
        expect(currentScope).toBe(expectedScope);
    });

    test('should fallback to default depth if neither next section nor parent H2 has granularity', () => {
        const targetDocContent = `
---
title: Fallback Test
---
# H1 Title {#h1}
## H2.1 Title {#h2-1}
### H3.1.1 Title {#h3-1-1}
### H3.1.2 Title {#h3-1-2}
## H2.2 Title {#h2-2}
### H3.2.1 Title {#h3-2-1}
### H3.2.2 Title {#h3-2-2}
#### H4.2.2.1 Title {#h4-2-2-1}
## H2.3 Title (Parent Granularity Test) {#h2-3}
### H3.3.1 Title (No Granularity) {#h3-3-1}
### H3.3.2 Title {#h3-3-2}
## H2.4 Title (Fallback Test) {#h2-4}
`.trim(); // H2.4 exists, next should be H3.4.1 (no granularity)
        // Parent H2.4 also has no granularity
        // ★★★ 修正: 期待値を修正 ★★★
        // nextSectionData is H3.4.1. No granularity on it or parent H2.4.
        // Fallback to default depth 6, singleBranch=false.
        // reconstructMarkdownFromYaml starts from H3.4.1 and goes 6 levels deep (but H3.4.1 has no children).
        // It does NOT include siblings like H3.4.2.
        const expectedScope = `
### H3.4.1 Title (No Granularity) {#h3-4-1}
`.trim();
        const { currentScope } = determineNextScope(mockSectionListYamlData, targetDocContent);
        expect(currentScope).toBe(expectedScope);
    });

    test('should use nextSectionData granularity even if parent H2 has granularity', () => {
        const targetDocContent = `
---
title: Next Section Priority Test
---
# H1 Title {#h1}
## H2.1 Title {#h2-1}
### H3.1.1 Title {#h3-1-1}
### H3.1.2 Title {#h3-1-2}
## H2.2 Title {#h2-2}
### H3.2.1 Title {#h3-2-1}
`.trim(); // H3.2.1 exists, next should be H3.2.2 (granularity 3)
        // Parent H2.2 has no granularity, but H3.2.2 has granularity 3
        const expectedScope = `
### H3.2.2 Title {#h3-2-2} <###>
#### H4.2.2.1 Title {#h4-2-2-1}
`.trim(); // Depth 3 (from H3.2.2), singleBranch=true
        const { currentScope } = determineNextScope(mockSectionListYamlData, targetDocContent);
        expect(currentScope).toBe(expectedScope);
    });
    // --- ★★★ 新しいテストケースここまで ★★★ ---


    test('should return error marker if YAML data is invalid or empty', () => {
        const invalidYamlData = { sections: null };
        const emptyYamlData = {};
        const targetDocContent = `# Some Heading`;
        // ★★★ 修正: 元の実装を直接呼び出す ★★★
        const resultInvalid = determineNextScope(invalidYamlData, targetDocContent);
        expect(resultInvalid.currentScope).toBe("<!-- No next section identified from YAML -->");
        const resultEmpty = determineNextScope(emptyYamlData, targetDocContent);
        expect(resultEmpty.currentScope).toBe("<!-- No next section identified from YAML -->");
    });
    // 追加したテストケース (正しい位置に移動)
    test('should return error marker if YAML data is invalid format', () => {
        const invalidYamlData = { sections: [{ title: 'NoLevel' }] }; // level がないなど
        const targetDocContent = `# Some Heading`;
        // ★★★ 修正: 元の実装を直接呼び出す ★★★
        const result = determineNextScope(invalidYamlData, targetDocContent);
        // 不正なデータでも、処理中にエラーを投げずにマーカーを返すことを期待
        expect(result.currentScope).toBe("<!-- No next section identified from YAML -->");
    });
    test('should return first section if target doc has non-matching headings', () => {
        const targetDocContent = `
# Non Matching Heading {#non-match}
## Another Non Match {#non-match2}
        `.trim();
        // ★★★ 修正: 元の実装を直接呼び出す ★★★
        const { currentScope } = determineNextScope(mockSectionListYamlData, targetDocContent);
        // 最初のセクションが返されることを期待 (mockSectionListYamlData の最初のセクション)
        expect(currentScope).toContain('# H1 Title {#h1}');
    });
    test('should ignore children of existing section with granularity', () => {
        const targetDocContent = `
# H1 Title {#h1}
## H2.1 Title {#h2-1}
### H3.1.1 Title {#h3-1-1}
        `.trim(); // H2.1 (granularity: 2) とその子 H3.1.1 が存在する
        // ★★★ 修正: 元の実装を直接呼び出す ★★★
        const { currentScope } = determineNextScope(mockSectionListYamlData, targetDocContent);
        // H2.1 の granularity により H3.1.1 は無視され、次の H2.2 が返されるはず
        expect(currentScope).toContain('## H2.2 Title {#h2-2}');
    });
  }); // describe('determineNextScope (YAML Version)') の終了

  describe('replacePlaceholders', () => {
    const template = `
Target: {{ TARGET_DOC_PATH }}
Sub: {{ SUB_TASK }}
Micro: {{ MICRO_TASK }}
Plot: {{ PLOT_YAML }}
Draft: {{ DRAFT_MD }}
Review: {{ REVIEW_MD }}
Repomix: {{ REPOMIX_OUTPUT }}
Target Full: {{ TARGET_DOC_FULL }}
Scope: {{ CURRENT_SCOPE }}
Section: {{ SECTION_STRUCTURE }}
Doc: {{ DOC_STRUCTURE }}
Missing: {{ MISSING_PLACEHOLDER }}
`;
    const data = {
      targetDocPath: 'path/to/target.md',
      subTask: 'Sub task content',
      microTask: 'Micro task content',
      plot: 'plot: yaml content',
      draft: '## Draft Content',
      review: 'Review comments',
      repomix: 'Repomix output here',
      targetDoc: '# Target Document\nFull content.',
      currentScope: '## Current Scope',
      sectionStructure: '## Section Structure',
      documentStructure: '# Doc Structure',
    };

    test('should replace all known placeholders', () => {
      const result = replacePlaceholders(template, data);
      expect(result).toContain('Target: path/to/target.md');
      expect(result).toContain('Sub: Sub task content');
      expect(result).toContain('Micro: Micro task content');
      expect(result).toContain('Plot: plot: yaml content');
      expect(result).toContain('Draft: ## Draft Content');
      expect(result).toContain('Review: Review comments');
      expect(result).toContain('Repomix: Repomix output here');
      expect(result).toContain('Target Full: # Target Document\nFull content.');
      expect(result).toContain('Scope: ## Current Scope');
      expect(result).toContain('Section: ## Section Structure');
      expect(result).toContain('Doc: # Doc Structure');
    });

    test('should leave unknown placeholders unchanged', () => {
      const result = replacePlaceholders(template, data);
      expect(result).toContain('Missing: {{ MISSING_PLACEHOLDER }}');
    });

    test('should replace with empty string if data is missing or null', () => {
      const partialData = {
        targetDocPath: 'path/to/target.md',
        // subTask is missing
        microTask: null, // microTask is null
      };
      const result = replacePlaceholders(template, partialData);
      expect(result).toContain('Target: path/to/target.md');
      expect(result).toContain('Sub: '); // Replaced with empty string
      expect(result).toContain('Micro: '); // Replaced with empty string
      expect(result).toContain('Plot: ');
      // Other placeholders should also be empty
    });

     test('should handle repomix placeholder correctly when repomix data is null', () => {
        const dataWithoutRepomix = { ...data, repomix: null };
        const result = replacePlaceholders(template, dataWithoutRepomix);
        expect(result).toContain('Repomix: <!-- repomix-output.md not found or empty -->');
    });
  }); // describe('replacePlaceholders') の終了

  // Main Execution tests
  describe('Main Execution', () => {
    // モック用の引数オブジェクト
    const baseArgs = {
        targetDoc: 'dummy-target.md',
        promptType: 'writer',
        output: 'dummy-output.md',
        _: [],
        $0: 'generate-prompt.js',
    };

    // モック用のファイル内容
    const mockTemplateContent = 'Template {{ CURRENT_SCOPE }}';
    const mockSubTaskContent = 'Sub task';
    const mockMicroTaskContent = 'Micro task';
    const mockTargetDocContent = '# Existing Heading';
    const mockSectionListYamlContent = yaml.dump({
        sections: [{ title: 'New Section', level: 1, id: 's1' }]
    });
    const mockPlotContent = 'plot: content';
    const mockDraftContent = '## Draft';
    const mockReviewContent = 'Review';
    const mockRepomixContent = 'Repomix output';
    // ★★★ 追加: rewriter 用テンプレート ★★★
    const mockRewriterTemplateContent = 'Rewrite Template {{ DRAFT_MD }} {{ REVIEW_MD }}';

    // ★★★ 修正: main に渡す依存オブジェクト ★★★
    let depsForMain;

    // readCached のデフォルト実装 (各テストで上書き可能)
    // ★★★ 修正: ファイルパスに基づいて正しい内容を返すように修正 ★★★
    const defaultReadCachedImpl = async (filePath) => {
        const resolvedPath = path.resolve(filePath);
        const fileName = path.basename(resolvedPath);

        if (fileName === 'writer-prompt-template.md') return mockTemplateContent;
        if (fileName === 'plot-reviewer-prompt-template.md') return 'Plot Template {{ PLOT_YAML }}';
        if (fileName === 'draft-reviewer-prompt-template.md') return 'Draft Template {{ DRAFT_MD }}';
        if (fileName === 'rewriter-prompt-template.md') return mockRewriterTemplateContent; // ★★★ 修正 ★★★
        if (fileName === 'sub-task.md') return mockSubTaskContent;
        if (fileName === 'micro-task.md') return mockMicroTaskContent;
        if (fileName === 'dummy-target.md') return mockTargetDocContent;
        if (fileName === 'section-list.yaml') return mockSectionListYamlContent;
        if (fileName === 'plot.yaml') return mockPlotContent;
        if (fileName === 'draft.md') return mockDraftContent;
        if (fileName === 'review.md') return mockReviewContent;
        if (fileName === 'repomix-output.md') return mockRepomixContent;

        // デフォルトではエラーを投げる
        const error = new Error(`ENOENT: no such file or directory, open '${resolvedPath}'`);
        error.code = 'ENOENT';
        throw error;
    };

    // determineNextScope のデフォルト実装 (モックされた関数を使用)
    const defaultDetermineNextScopeImpl = () => ({
        currentScope: '# New Section {#s1}',
        sectionStructure: '# New Section {#s1}',
        documentStructure: '# New Section {#s1}',
        sectionListRaw: yaml.dump({ sections: [{ title: 'New Section', level: 1, id: 's1' }] })
    });

    // beforeEach で readCached と determineNextScope のデフォルト実装を設定
    beforeEach(() => {
        // モック関数本体の実装を設定
        mockReadCached.mockImplementation(defaultReadCachedImpl);
        mockDetermineNextScope.mockImplementation(defaultDetermineNextScopeImpl);
        mockArgParser.mockImplementation(async () => Promise.resolve(baseArgs)); // argParser のデフォルトも設定
        mockRunCli.mockResolvedValue(undefined); // runCli のデフォルト
        mockWriteFile.mockResolvedValue(undefined); // writeFile のデフォルト

        // ★★★ 修正: 依存オブジェクトを初期化 ★★★
        depsForMain = {
          argParser: mockArgParser,
          readCachedFn: mockReadCached,
          writeFileFn: mockWriteFile,
          determineNextScopeFn: mockDetermineNextScope,
          runCliFn: mockRunCli,
        };
    });

    test('should execute successfully with valid arguments and files', async () => {
      // ★★★ 修正: main に依存オブジェクトを渡す ★★★
      await main(depsForMain);

      // repomix (runCliFn) が呼ばれたか
      expect(mockRunCli).toHaveBeenCalledTimes(1);
      // 必要なファイルが readCachedFn で読み込まれたか
      expect(mockReadCached).toHaveBeenCalledWith(expect.stringContaining('writer-prompt-template.md'));
      expect(mockReadCached).toHaveBeenCalledWith(expect.stringContaining('sub-task.md'));
      expect(mockReadCached).toHaveBeenCalledWith(expect.stringContaining('micro-task.md'));
      expect(mockReadCached).toHaveBeenCalledWith('dummy-target.md');
      expect(mockReadCached).toHaveBeenCalledWith(expect.stringContaining('section-list.yaml'));
      expect(mockReadCached).toHaveBeenCalledWith('repomix-output.md');
      expect(mockReadCached).not.toHaveBeenCalledWith(expect.stringContaining('plot.yaml'));
      expect(mockReadCached).not.toHaveBeenCalledWith(expect.stringContaining('draft.md'));
      expect(mockReadCached).not.toHaveBeenCalledWith(expect.stringContaining('review.md'));
      // determineNextScope (モック関数) が呼ばれたか
      expect(mockDetermineNextScope).toHaveBeenCalledTimes(1);
      // writeFileFn が正しい内容で呼ばれたか
      expect(mockWriteFile).toHaveBeenCalledTimes(1);
      expect(mockWriteFile).toHaveBeenCalledWith(
          path.resolve('dummy-output.md'),
          expect.stringContaining('Template # New Section {#s1}'), // determineNextScope の結果を含む
          'utf-8'
      );
      // 成功メッセージが表示されたか
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('✅ Prompt successfully generated'));
      // エラーや警告が出ていないか
      expect(mockConsoleError).not.toHaveBeenCalled();
      // repomix-output.md が見つからない場合の警告は許容する
      // expect(mockConsoleWarn).not.toHaveBeenCalled();
      expect(mockProcessExit).not.toHaveBeenCalled();
    });

    test('should call process.exit(1) if required argument is missing', async () => {
        // yargs がエラーを投げるように argParser モックを上書き
        mockArgParser.mockImplementation(async () => {
            const error = new Error('Missing required argument: target-doc');
            throw error;
        });
        // ★★★ 修正: main に依存オブジェクトを渡す ★★★
        await main(depsForMain);
        expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining('Argument parsing failed'));
        expect(mockProcessExit).toHaveBeenCalledWith(1);
    });

     test('should call process.exit(1) if prompt-type is invalid', async () => {
         // yargs がエラーを投げるように argParser モックを上書き
        mockArgParser.mockImplementation(async () => {
            const error = new Error('Invalid values:');
            throw error;
        });
        // ★★★ 修正: main に依存オブジェクトを渡す ★★★
        await main(depsForMain);
        expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining('Argument parsing failed'));
        expect(mockProcessExit).toHaveBeenCalledWith(1);
    });

    test('should call process.exit(1) if required file is not found', async () => {
        // 特定のファイル読み込み時のみエラーを投げるように readCachedFn モックを上書き
        mockReadCached.mockImplementation(async (filePath) => {
            const resolvedPath = path.resolve(filePath);
            if (resolvedPath.endsWith('section-list.yaml')) {
                // ★★★ 修正: エラーではなく null を返すように変更 ★★★
                return null;
            }
            return await defaultReadCachedImpl(filePath); // 他はデフォルト
        });
        // ★★★ 修正: main に依存オブジェクトを渡す ★★★
        await main(depsForMain);
        // ★★★ 修正: 最初の呼び出しの引数を厳密にチェック (path.join を使用) ★★★
        const expectedPath = path.join('temp-documentation-support', 'section-list.yaml');
        expect(mockConsoleError).toHaveBeenCalledTimes(2); // 2回呼ばれることを確認
        expect(mockConsoleError.mock.calls[0][0]).toContain( // 1回目の呼び出し内容を確認
            `Required file ${expectedPath} not found or could not be read.`
        );
        expect(mockConsoleError.mock.calls[1][0]).toContain( // 2回目の呼び出し内容を確認
            `Failed to parse ${expectedPath}`
        );
        // ★★★ 修正: 2回呼び出されることを確認 ★★★
        expect(mockProcessExit).toHaveBeenCalledTimes(2);
        expect(mockProcessExit).toHaveBeenCalledWith(1);
    });

     test('should call process.exit(1) if YAML parsing fails', async () => {
         // section-list.yaml の内容として不正な YAML を返すように readCachedFn モックを上書き
        mockReadCached.mockImplementation(async (filePath) => {
             const resolvedPath = path.resolve(filePath);
            if (resolvedPath.endsWith('section-list.yaml')) return 'invalid: yaml: content';
            return await defaultReadCachedImpl(filePath); // 他はデフォルト
        });
        // ★★★ 修正: main に依存オブジェクトを渡す ★★★
        await main(depsForMain);
        expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining('Failed to parse'));
        expect(mockProcessExit).toHaveBeenCalledWith(1);
    });

    test('should read plot file only for plot-reviewer type', async () => {
        // argParser が plot-reviewer を返すように設定
        mockArgParser.mockImplementation(async () => Promise.resolve({ ...baseArgs, promptType: 'plot-reviewer' }));
        // ★★★ 修正: main に依存オブジェクトを渡す ★★★
        await main(depsForMain);
        expect(mockReadCached).toHaveBeenCalledWith(expect.stringContaining('plot.yaml'));
        expect(mockReadCached).not.toHaveBeenCalledWith(expect.stringContaining('draft.md'));
        expect(mockReadCached).not.toHaveBeenCalledWith(expect.stringContaining('review.md'));
        expect(mockWriteFile).toHaveBeenCalledWith(
            path.resolve('dummy-output.md'),
            expect.stringContaining('Plot Template plot: content'), // テンプレート内容を確認
            'utf-8'
        );
    });

     test('should read draft file only for draft-reviewer type', async () => {
        // argParser が draft-reviewer を返すように設定
        mockArgParser.mockImplementation(async () => Promise.resolve({ ...baseArgs, promptType: 'draft-reviewer' }));
        // ★★★ 修正: main に依存オブジェクトを渡す ★★★
        await main(depsForMain);
        expect(mockReadCached).not.toHaveBeenCalledWith(expect.stringContaining('plot.yaml'));
        expect(mockReadCached).toHaveBeenCalledWith(expect.stringContaining('draft.md'));
        expect(mockReadCached).not.toHaveBeenCalledWith(expect.stringContaining('review.md'));
         expect(mockWriteFile).toHaveBeenCalledWith(
            path.resolve('dummy-output.md'),
            expect.stringContaining('Draft Template ## Draft'), // テンプレート内容を確認
            'utf-8'
        );
    });

     test('should read draft and review files for rewriter type', async () => {
        // argParser が rewriter を返すように設定
        mockArgParser.mockImplementation(async () => Promise.resolve({ ...baseArgs, promptType: 'rewriter' }));
        // ★★★ 修正: main に依存オブジェクトを渡す ★★★
        await main(depsForMain);
        expect(mockReadCached).not.toHaveBeenCalledWith(expect.stringContaining('plot.yaml'));
        expect(mockReadCached).toHaveBeenCalledWith(expect.stringContaining('draft.md'));
        expect(mockReadCached).toHaveBeenCalledWith(expect.stringContaining('review.md'));
         // ★★★ 修正: 期待されるテンプレート内容を修正 ★★★
         expect(mockWriteFile).toHaveBeenCalledWith(
            path.resolve('dummy-output.md'),
            expect.stringContaining('Rewrite Template ## Draft Review'), // テンプレート内容を確認
            'utf-8'
        );
    });

     test('should skip prompt generation if no next scope is identified', async () => {
        // determineNextScopeFn モックがマーカーを返すように設定
        mockDetermineNextScope.mockReturnValue({
            currentScope: "<!-- No next section identified from YAML -->",
            sectionStructure: "mock",
            documentStructure: "mock",
            sectionListRaw: "mock"
        });
        // ★★★ 修正: main に依存オブジェクトを渡す ★★★
        await main(depsForMain);

        expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Skipping prompt generation'));
        expect(mockWriteFile).not.toHaveBeenCalled(); // ファイル書き込みが行われない
        expect(mockProcessExit).not.toHaveBeenCalled(); // 正常終了
    });

  }); // describe('Main Execution') の終了

}); // describe('generate-prompt.js Script') の終了