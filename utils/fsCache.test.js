import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import path from 'path';

// fs/promises をモック化
const mockReadFile = jest.fn();
await jest.unstable_mockModule('fs/promises', () => ({
  readFile: mockReadFile,
  // 他の fs/promises 関数が必要な場合はここに追加
}));

// モック設定後にテスト対象をインポート
const { readCached, clearCache } = await import('./fsCache.js');

describe('fsCache', () => {
  const testFilePath = 'test-file.txt';
  const testFileContent = 'This is test content.';
  const absoluteTestFilePath = path.resolve(testFilePath);

  beforeEach(() => {
    // 各テストの前にモックとキャッシュをクリア
    jest.clearAllMocks();
    clearCache();
    // readFile モックのデフォルト動作を設定
    mockReadFile.mockResolvedValue(testFileContent);
  });

  test('should read file from disk on first call', async () => {
    const content = await readCached(testFilePath);
    expect(content).toBe(testFileContent);
    expect(mockReadFile).toHaveBeenCalledTimes(1);
    // path.resolve が呼ばれた後に、絶対パスで readFile が呼ばれることを確認
    expect(mockReadFile).toHaveBeenCalledWith(absoluteTestFilePath, 'utf8');
  });

  test('should return cached content on subsequent calls for the same file', async () => {
    // 1回目の呼び出し（キャッシュされる）
    await readCached(testFilePath);
    expect(mockReadFile).toHaveBeenCalledTimes(1);
    mockReadFile.mockClear(); // 1回目の呼び出し後、モックの呼び出し履歴をクリア

    // 2回目の呼び出し（キャッシュから返されるはず）
    const content = await readCached(testFilePath);
    expect(content).toBe(testFileContent);
    // readFile が再度呼ばれていないことを確認
    expect(mockReadFile).not.toHaveBeenCalled();
  });

  test('should use absolute path as cache key', async () => {
    const relativePath = './test-file.txt'; // 相対パス
    const absolutePath = path.resolve(relativePath);

    // 1回目: 相対パスで読み込み
    await readCached(relativePath);
    expect(mockReadFile).toHaveBeenCalledTimes(1);
    expect(mockReadFile).toHaveBeenCalledWith(absolutePath, 'utf8'); // 絶対パスで呼ばれる
    mockReadFile.mockClear();

    // 2回目: 同じファイルを絶対パスで読み込み（キャッシュヒットするはず）
    const content = await readCached(absolutePath);
    expect(content).toBe(testFileContent);
    expect(mockReadFile).not.toHaveBeenCalled();
  });

   test('should read different files independently', async () => {
    const anotherFilePath = 'another-test-file.txt';
    const anotherFileContent = 'Different content.';
    const absoluteAnotherFilePath = path.resolve(anotherFilePath);

    mockReadFile.mockResolvedValueOnce(testFileContent) // 最初のファイルの内容
                 .mockResolvedValueOnce(anotherFileContent); // 2番目のファイルの内容

    // 1つ目のファイルを読み込み
    const content1 = await readCached(testFilePath);
    expect(content1).toBe(testFileContent);
    expect(mockReadFile).toHaveBeenCalledTimes(1);
    expect(mockReadFile).toHaveBeenCalledWith(absoluteTestFilePath, 'utf8');

    // 2つ目のファイルを読み込み
    const content2 = await readCached(anotherFilePath);
    expect(content2).toBe(anotherFileContent);
    expect(mockReadFile).toHaveBeenCalledTimes(2); // readFile が合計2回呼ばれる
    expect(mockReadFile).toHaveBeenCalledWith(absoluteAnotherFilePath, 'utf8');

    // 再度1つ目のファイルを読み込み（キャッシュから）
    const content1Again = await readCached(testFilePath);
    expect(content1Again).toBe(testFileContent);
    expect(mockReadFile).toHaveBeenCalledTimes(2); // readFile の呼び出し回数は増えない

    // 再度2つ目のファイルを読み込み（キャッシュから）
    const content2Again = await readCached(anotherFilePath);
    expect(content2Again).toBe(anotherFileContent);
    expect(mockReadFile).toHaveBeenCalledTimes(2); // readFile の呼び出し回数は増えない
  });

  test('should re-throw error if readFile fails (not ENOENT)', async () => {
    const error = new Error('Disk read error');
    mockReadFile.mockRejectedValue(error);

    await expect(readCached(testFilePath)).rejects.toThrow('Disk read error');
    expect(mockReadFile).toHaveBeenCalledTimes(1);
    expect(mockReadFile).toHaveBeenCalledWith(absoluteTestFilePath, 'utf8');
  });

  test('clearCache should empty the cache', async () => {
    // 1. ファイルを読み込んでキャッシュに入れる
    await readCached(testFilePath);
    expect(mockReadFile).toHaveBeenCalledTimes(1);
    mockReadFile.mockClear();

    // 2. キャッシュをクリアする
    clearCache();

    // 3. 再度ファイルを読み込む（キャッシュがないのでディスクから読むはず）
    const content = await readCached(testFilePath);
    expect(content).toBe(testFileContent);
    expect(mockReadFile).toHaveBeenCalledTimes(1); // 再度 readFile が呼ばれる
  });
});