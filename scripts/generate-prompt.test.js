// Test file for generate-prompt.js
import path from 'path'; // path モジュールをインポート
import { jest, describe, test, expect, beforeEach } from '@jest/globals'; // Jest グローバルをインポート
import { remark } from 'remark'; // remark をインポートして AST を確認
import remarkParse from 'remark-parse'; // remarkParse もインポート

// --- モック定義 (unstable_mockModule を使用) ---
const mockReadFile = jest.fn();
const mockWriteFile = jest.fn();

// fs/promises をモック (テスト実行前に設定)
await jest.unstable_mockModule('fs/promises', () => ({
  readFile: mockReadFile,
  writeFile: mockWriteFile,
}));

// モック設定後にテスト対象をインポート
const {
  formatError,
  readFileContent,
  extractHeadings,
  parseSectionListStructure, // インポート対象に追加
  // determineNextScope, // 後でテスト
  // replacePlaceholders, // 後でテスト
  // main // 後でテスト (統合テスト用)
} = await import('./generate-prompt.js'); // テスト対象をインポート

// グローバルなモック設定
let mockConsoleLog, mockConsoleWarn, mockConsoleError, mockProcessExit;

beforeEach(() => {
  // 各テストの前にモックをリセット
  jest.resetAllMocks();

  // console をモック
  mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
  mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});


  // process.exit をモック
  mockProcessExit = jest.spyOn(process, 'exit').mockImplementation((code) => {
    throw new Error(`process.exit called with code ${code}`);
  });
});

describe('generate-prompt.js Script', () => {

  // --- ユニットテスト ---
  describe('formatError', () => {
    test('should format message only', () => {
      expect(formatError('Simple error')).toBe('Error: Simple error');
    });

    test('should format message with error stack', () => {
      const error = new Error('Detailed error');
      error.stack = 'Error: Detailed error\n    at someFunction (file.js:10:5)';
      expect(formatError('Operation failed', error))
        .toBe('Error: Operation failed\nDetails: Error: Detailed error\n    at someFunction (file.js:10:5)');
    });

    test('should format message with error message if stack is missing', () => {
      const error = new Error('Error without stack');
      delete error.stack;
      expect(formatError('Something went wrong', error))
        .toBe('Error: Something went wrong\nDetails: Error without stack');
    });
  });

  describe('readFileContent', () => {
    const mockFilePath = 'path/to/mock/file.txt';
    const mockAbsoluteFilePath = path.resolve(mockFilePath);
    const mockFileContent = 'This is mock content.';
    const mockDescription = 'Mock File';

    test('should read file content successfully', async () => {
      mockReadFile.mockResolvedValue(mockFileContent);
      const content = await readFileContent(mockFilePath, mockDescription);
      expect(content).toBe(mockFileContent);
      expect(mockReadFile).toHaveBeenCalledWith(mockAbsoluteFilePath, 'utf-8');
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining(`Reading ${mockDescription}: ${mockAbsoluteFilePath}`));
    });

    test('should throw error if file not found and optional is false', async () => {
      const error = new Error(`ENOENT: no such file or directory, open '${mockAbsoluteFilePath}'`);
      error.code = 'ENOENT';
      mockReadFile.mockRejectedValue(error);
      await expect(readFileContent(mockFilePath, mockDescription, false))
        .rejects.toThrow(`File not found for ${mockDescription}: ${mockAbsoluteFilePath}`);
      expect(mockConsoleWarn).not.toHaveBeenCalled();
    });

    test('should return null and warn if file not found and optional is true', async () => {
      const error = new Error(`ENOENT: no such file or directory, open '${mockAbsoluteFilePath}'`);
      error.code = 'ENOENT';
      mockReadFile.mockRejectedValue(error);
      const content = await readFileContent(mockFilePath, mockDescription, true);
      expect(content).toBeNull();
      expect(mockConsoleWarn).toHaveBeenCalledWith(expect.stringContaining(`Optional file not found for ${mockDescription}: ${mockAbsoluteFilePath}. Skipping.`));
    });

    test('should throw error for other read errors', async () => {
      const error = new Error('Permission denied');
      mockReadFile.mockRejectedValue(error);
      await expect(readFileContent(mockFilePath, mockDescription))
        .rejects.toThrow(`Failed to read ${mockDescription} at ${mockAbsoluteFilePath}: Permission denied`);
    });
  });

  describe('extractHeadings', () => {
    // extractHeadings は粒度マーカーを削除しない（parseSectionListStructure が担当）
    test('should extract headings with different levels including markers', () => {
      const markdown = '# H1 {#}\n## H2 {##}\n### H3 \n Text \n## Another H2';
      const expected = [
        { depth: 1, text: 'H1 {#}' },
        { depth: 2, text: 'H2 {##}' },
        { depth: 3, text: 'H3' },
        { depth: 2, text: 'Another H2' },
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

    test('should trim whitespace from heading text', () => {
      const markdown = '#  H1 with spaces {#}  \n##\tH2 with tab\t';
      const expected = [
        { depth: 1, text: 'H1 with spaces {#}' }, // Marker remains part of text here
        { depth: 2, text: 'H2 with tab' },
      ];
      expect(extractHeadings(markdown)).toEqual(expected);
    });

     test('should handle markdown parsing errors gracefully and NOT warn', () => {
      const invalidMarkdown = '# Valid Heading {#}\n```\nOops';
      expect(extractHeadings(invalidMarkdown)).toEqual([{ depth: 1, text: 'Valid Heading {#}' }]);
      expect(mockConsoleWarn).not.toHaveBeenCalledWith(expect.stringContaining('Failed to parse markdown content'));
    });
  });

  describe('parseSectionListStructure', () => {

    test('should parse basic structure with start and end lines (no markers)', () => {
      const content = `# Section 1\nSome text\n## Section 1.1\nMore text\n# Section 2`;
      const expected = [
        { depth: 1, text: 'Section 1', granularity: null, startLine: 1, endLine: 2 },
        { depth: 2, text: 'Section 1.1', granularity: null, startLine: 3, endLine: 4 },
        { depth: 1, text: 'Section 2', granularity: null, startLine: 5, endLine: 5 },
      ];
      expect(parseSectionListStructure(content)).toEqual(expected);
    });

    // Updated test for the new format
    test('should parse granularity markers correctly', () => {
      const content = `# Section 1 {#}\n## Section 1.1\n# Section 2 {##}`;
      const expected = [
        { depth: 1, text: 'Section 1', granularity: '#', startLine: 1, endLine: 1 },
        { depth: 2, text: 'Section 1.1', granularity: null, startLine: 2, endLine: 2 },
        { depth: 1, text: 'Section 2', granularity: '##', startLine: 3, endLine: 3 },
      ];
      expect(parseSectionListStructure(content)).toEqual(expected);
    });

    // Updated test: Checks if markers not on the heading line are ignored
    test('should ignore markers not immediately on the heading line', () => {
      const content = `# Section 1\n{#}\n## Section 1.1\n{###}`; // Markers on separate lines
      const expected = [
        { depth: 1, text: 'Section 1', granularity: null, startLine: 1, endLine: 1 },
        // The marker on line 2 is just content now
        { depth: 2, text: 'Section 1.1', granularity: null, startLine: 3, endLine: 3 },
         // The marker on line 4 is just content now
      ];
       // Need to adjust expectations based on how remark parses this.
       // It's likely the markers on separate lines won't be associated with headings.
       // Let's refine the expectation based on likely parser behavior.
       // The parser likely sees '# Section 1' then a paragraph '{#}' etc.
       // So parseSectionListStructure should only find the headings.
       const refinedExpected = [
         { depth: 1, text: 'Section 1', granularity: null, startLine: 1, endLine: 2 }, // Ends before the marker paragraph
         { depth: 2, text: 'Section 1.1', granularity: null, startLine: 3, endLine: 4 }, // Ends before the marker paragraph
       ];
      expect(parseSectionListStructure(content)).toEqual(refinedExpected);
    });

    test('should handle empty input', () => {
      expect(parseSectionListStructure('')).toEqual([]);
    });

    test('should handle input with no headings', () => {
      const content = 'Just some text.\nAnother line.';
      expect(parseSectionListStructure(content)).toEqual([]);
    });

     test('should calculate endLine correctly for the last section', () => {
      const content = `# Section 1 {#}\nText\n## Section 1.1\nFinal line`;
      const expected = [
        { depth: 1, text: 'Section 1', granularity: '#', startLine: 1, endLine: 2 },
        { depth: 2, text: 'Section 1.1', granularity: null, startLine: 3, endLine: 4 },
      ];
      expect(parseSectionListStructure(content)).toEqual(expected);
    });

    // Updated test for multiple markers
     test('should handle multiple granularity markers', () => {
        const content = `# S1 {#}\n## S1.1 {##}\n### S1.1.1 {###}`;
        const expected = [
            { depth: 1, text: 'S1', granularity: '#', startLine: 1, endLine: 1 },
            { depth: 2, text: 'S1.1', granularity: '##', startLine: 2, endLine: 2 },
            { depth: 3, text: 'S1.1.1', granularity: '###', startLine: 3, endLine: 3 },
        ];
        expect(parseSectionListStructure(content)).toEqual(expected);
     });

    // Updated test: Checks if malformed markers are ignored and treated as text
     test('should ignore markers with incorrect format', () => {
        const content = `# Section 1 {#\n## Section 2 {##`; // Malformed markers
        const expected = [
            // The parser should treat the malformed markers as part of the text
            { depth: 1, text: 'Section 1 {#', granularity: null, startLine: 1, endLine: 1 },
            { depth: 2, text: 'Section 2 {##', granularity: null, startLine: 2, endLine: 2 },
        ];
        expect(parseSectionListStructure(content)).toEqual(expected);
     });

     test('should handle markers with extra spaces', () => {
        const content = `# Section 1 { # } \n## Section 2 { ##}`; // Extra spaces
        const expected = [
            { depth: 1, text: 'Section 1', granularity: '#', startLine: 1, endLine: 1 },
            { depth: 2, text: 'Section 2', granularity: '##', startLine: 2, endLine: 2 },
        ];
        expect(parseSectionListStructure(content)).toEqual(expected);
     });

     test('should handle heading text ending with braces naturally', () => {
        const content = `# Function { like this }\n## Another {case}`; // Natural braces, not markers
        const expected = [
            { depth: 1, text: 'Function { like this }', granularity: null, startLine: 1, endLine: 1 },
            { depth: 2, text: 'Another {case}', granularity: null, startLine: 2, endLine: 2 },
        ];
        expect(parseSectionListStructure(content)).toEqual(expected);
     });


  });

  // describe('determineNextScope', () => {
  //   // TODO: determineNextScope 関数のテストケース (needs update for new format)
  // });
  // describe('replacePlaceholders', () => {
  //   // TODO: replacePlaceholders 関数のテストケース (should be unaffected if scope/structure are cleaned)
  // });


  // --- 統合テスト (main 関数またはスクリプト全体) ---
  // describe('Main Execution (Integration)', () => {
     // 統合テストは main 関数を export してから実装
     // または別ファイルに分けることも検討
  // });

});