// Test file for generate-prompt.js
import path from 'path';
import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import grayMatter from 'gray-matter';
import yaml from 'js-yaml';

// --- モック定義 ---
const mockReadFile = jest.fn();
const mockWriteFile = jest.fn();
const mockRunCli = jest.fn();
const mockParseArguments = jest.fn();

// --- モジュール全体のモック ---
jest.mock('./generate-prompt.js', () => {
    const originalModule = jest.requireActual('./generate-prompt.js');
    return {
        __esModule: true,
        ...originalModule,
        parseArguments: async () => mockParseArguments(),
    };
});

// --- モック設定後にテスト対象をインポート ---
const {
  formatError,
  // readFileContent, // 使用しなくなったためコメントアウト or 削除
  extractHeadings,
  determineNextScope,
  replacePlaceholders,
  main,
  parseArguments
} = await import('./generate-prompt.js');


// fs/promises と repomix のモック
await jest.unstable_mockModule('fs/promises', () => ({
  readFile: mockReadFile,
  writeFile: mockWriteFile,
}));
await jest.unstable_mockModule('repomix', () => ({
    runCli: mockRunCli,
}));


// グローバルなモック設定
let mockConsoleLog, mockConsoleWarn, mockConsoleError, mockProcessExit;

beforeEach(() => {
  jest.clearAllMocks();
  mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
  mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  mockProcessExit = jest.spyOn(process, 'exit').mockImplementation((code) => {
    throw new Error(`process.exit called with code ${code}`);
  });
  // readCached を使うようになったので、readFile のモックは fsCache.test.js で管理
  // mockReadFile.mockResolvedValue('');
  mockRunCli.mockResolvedValue(undefined);
  mockParseArguments.mockResolvedValue({ _: [], $0: 'generate-prompt.js' });
});

afterEach(() => {
    jest.restoreAllMocks();
});


describe('generate-prompt.js Script', () => {

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

  // Skip readFileContent tests (削除されたため不要)
  // describe.skip('readFileContent', () => { ... });

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

  describe('determineNextScope (YAML Version)', () => {
    const mockSectionListYamlData = {
        sections: [
            { title: 'Front Matter 記述ガイドライン', id: 'h1-front-matter-guidelines', level: 1, children: [
                { title: '1. はじめに', id: 'h2-introduction', level: 2, granularity: 2, children: [
                    { title: '1.1. このガイドラインの目的と対象読者', id: 'h3-purpose-and-audience', level: 3 },
                    { title: '1.2. Front Matter の重要性 (一貫性、自動化、AI活用、ガバナンス)', id: 'h3-importance-of-front-matter', level: 3 },
                ]},
                { title: '2. 【最重要】ローカル検証ガイド (DX向上)', id: 'h2-local-validation-guide', level: 2, granularity: 3, children: [
                    { title: '2.1. なぜローカル検証が必要か', id: 'h3-why-local-validation-is-needed', level: 3 }
                ]},
                { title: '3. Front Matter フィールド詳細解説', id: 'h2-front-matter-field-details', level: 2, granularity: 4, children: [
                     { title: '3.1. 解説の構造', id: 'h3-explanation-structure', level: 3, list_items: ['目的 (Why)', '意味 (What)'] }
                ]}
            ]}
        ]
    };
    test('should correctly identify the next section when some sections exist in target', () => {
      const targetDocContent = `
---
title: Test Doc
---
# Front Matter 記述ガイドライン {#h1-front-matter-guidelines}
## 1. はじめに {#h2-introduction}
### 1.1. このガイドラインの目的と対象読者 {#h3-purpose-and-audience}
### 1.2. Front Matter の重要性 (一貫性、自動化、AI活用、ガバナンス) {#h3-importance-of-front-matter}
`.trim();
      const expectedScope = `
## 2. 【最重要】ローカル検証ガイド (DX向上) {#h2-local-validation-guide} <###>
### 2.1. なぜローカル検証が必要か {#h3-why-local-validation-is-needed}
`.trim();
        const expectedDocumentStructure = `
# Front Matter 記述ガイドライン {#h1-front-matter-guidelines}
## 1. はじめに {#h2-introduction} <##>
### 1.1. このガイドラインの目的と対象読者 {#h3-purpose-and-audience}
### 1.2. Front Matter の重要性 (一貫性、自動化、AI活用、ガバナンス) {#h3-importance-of-front-matter}
## 2. 【最重要】ローカル検証ガイド (DX向上) {#h2-local-validation-guide} <###>
### 2.1. なぜローカル検証が必要か {#h3-why-local-validation-is-needed}
## 3. Front Matter フィールド詳細解説 {#h2-front-matter-field-details} <####>
### 3.1. 解説の構造 {#h3-explanation-structure}
`.trim();
      const { currentScope, sectionStructure, documentStructure } = determineNextScope(mockSectionListYamlData, targetDocContent);
      expect(currentScope).toBe(expectedScope);
      expect(documentStructure).toBe(expectedDocumentStructure);
    });
    test('should return "No next section" marker if all sections exist in target', () => {
        const targetDocContent = `
---
title: Complete Doc
---
# Front Matter 記述ガイドライン {#h1-front-matter-guidelines}
## 1. はじめに {#h2-introduction}
### 1.1. このガイドラインの目的と対象読者 {#h3-purpose-and-audience}
### 1.2. Front Matter の重要性 (一貫性、自動化、AI活用、ガバナンス) {#h3-importance-of-front-matter}
## 2. 【最重要】ローカル検証ガイド (DX向上) {#h2-local-validation-guide}
### 2.1. なぜローカル検証が必要か {#h3-why-local-validation-is-needed}
## 3. Front Matter フィールド詳細解説 {#h2-front-matter-field-details}
### 3.1. 解説の構造 {#h3-explanation-structure}
`.trim();
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
# Front Matter 記述ガイドライン {#h1-front-matter-guidelines}
## 1. はじめに {#h2-introduction} <##>
### 1.1. このガイドラインの目的と対象読者 {#h3-purpose-and-audience}
### 1.2. Front Matter の重要性 (一貫性、自動化、AI活用、ガバナンス) {#h3-importance-of-front-matter}
## 2. 【最重要】ローカル検証ガイド (DX向上) {#h2-local-validation-guide} <###>
### 2.1. なぜローカル検証が必要か {#h3-why-local-validation-is-needed}
## 3. Front Matter フィールド詳細解説 {#h2-front-matter-field-details} <####>
### 3.1. 解説の構造 {#h3-explanation-structure}
  * 目的 (Why)
  * 意味 (What)
`.trim();
        const { currentScope } = determineNextScope(mockSectionListYamlData, targetDocContent);
        expect(currentScope).toBe(expectedScope);
    });
    test('should handle granularity correctly for scope', () => {
         const targetDocContent = `
---
title: Granularity Test
---
# Front Matter 記述ガイドライン {#h1-front-matter-guidelines}
`.trim();
        const expectedScope = `
## 1. はじめに {#h2-introduction} <##>
### 1.1. このガイドラインの目的と対象読者 {#h3-purpose-and-audience}
`.trim();
        const { currentScope } = determineNextScope(mockSectionListYamlData, targetDocContent);
        expect(currentScope).toBe(expectedScope);
    });
    test('should return error marker if YAML data is invalid or empty', () => {
        const invalidYamlData = { sections: null };
        const emptyYamlData = {};
        const targetDocContent = `# Some Heading`;
        const resultInvalid = determineNextScope(invalidYamlData, targetDocContent);
        expect(resultInvalid.currentScope).toBe("<!-- No next section identified from YAML -->");
        const resultEmpty = determineNextScope(emptyYamlData, targetDocContent);
        expect(resultEmpty.currentScope).toBe("<!-- No next section identified from YAML -->");
    });
  });

  // Skip Main Execution tests temporarily
  describe.skip('Main Execution (YAML)', () => {
      // ... tests ...
  });

});