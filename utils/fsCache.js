import { readFile } from 'fs/promises';
import path from 'path';

const cache = new Map();

/**
 * Reads file content from cache if available, otherwise reads from disk and caches it.
 * Resolves the absolute path before using it as a cache key.
 * @param {string} filePath - The path to the file.
 * @returns {Promise<string>} The content of the file.
 * @throws {Error} If the file cannot be read (and not found).
 */
export async function readCached(filePath) {
  const absolutePath = path.resolve(filePath); // Ensure absolute path for consistent caching
  if (cache.has(absolutePath)) {
    // console.log(`CACHE HIT: ${absolutePath}`); // Uncomment for debugging cache hits
    return cache.get(absolutePath);
  }
  // console.log(`CACHE MISS: Reading ${absolutePath}`); // Uncomment for debugging cache misses
  const data = await readFile(absolutePath, 'utf8');
  cache.set(absolutePath, data);
  return data;
}

/**
 * Clears the entire file cache. Useful for testing or specific scenarios.
 */
export function clearCache() {
    cache.clear();
    // console.log('CACHE CLEARED'); // Uncomment for debugging cache clears
}