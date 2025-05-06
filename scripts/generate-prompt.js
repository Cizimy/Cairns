#!/usr/bin/env node

import { readFile, writeFile as originalWriteFile } from 'fs/promises'; // Rename writeFile to avoid conflict
import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { remark } from 'remark';
import remarkParse from 'remark-parse';
import { visit } from 'unist-util-visit';
import { toString } from 'mdast-util-to-string'; // Keep for potential fallback or other uses
import { VFile } from 'vfile';
import grayMatter from 'gray-matter';
import { runCli as originalRunCli } from 'repomix'; // Rename runCli
import { fileURLToPath } from 'url';
import yaml from 'js-yaml'; // Import js-yaml
import { Buffer } from 'buffer'; // Import Buffer for byte operations
import { readCached as originalReadCached } from '../utils/fsCache.js'; // Rename readCached
import debug from 'debug'; // Import debug

// デバッガーインスタンスを作成
const log = debug('generate-prompt');
const logScope = debug('generate-prompt:scope');
const logRepomix = debug('generate-prompt:repomix');
const logMain = debug('generate-prompt:main');
const logError = debug('generate-prompt:error'); // エラー詳細用

// 正規表現をモジュールスコープに移動
const HEADING_ID_REGEX = /\s*\{\s*#[^}]+\s*\}\s*$/;

/**
 * エラーメッセージをフォーマットするヘルパー関数 (分割代入を使用)
 */
export function formatError(message, error) {
  let formattedMessage = `Error: ${message}`;
  if (error) {
    // 分割代入でプロパティを取得し、デフォルト値を設定
    const { stderr = '', stdout = '', message: errorMessage = '', stack = '' } = error;
    // 詳細情報の優先順位: stderr > stdout > errorMessage > String(error)
    const errorDetails = stderr || stdout || errorMessage || String(error);
    formattedMessage += `\nDetails: ${errorDetails}`;
    // stack が存在する場合のみ追加
    if (stack) {
        formattedMessage += `\nStack: ${stack}`;
    }
  }
  return formattedMessage;
}

// readFileContent 関数は削除 (readCached を使用するため)

/**
 * Markdownコンテンツから見出しのリストを抽出する (比較用情報を含む)
 */
export function extractHeadings(content, sourceName = 'unknown') {
    log('Extracting headings from source: %s', sourceName);
    if (!content) {
        log('Content is empty or null, returning empty array.');
        return [];
    }
    try {
        const tree = remark().use(remarkParse).parse(content);
        const headings = [];
        visit(tree, 'heading', (node) => {
            let titleFromAst = '';
            // headingノードの子要素を走査し、text, inlineCode, html の値のみを結合
            visit(node, ['text', 'inlineCode', 'html'], (childNode) => {
                titleFromAst += childNode.value;
            });

            let titleWithoutId = titleFromAst;
            // モジュールスコープの正規表現定数を使用
            const idMatch = titleWithoutId.match(HEADING_ID_REGEX);
            if (idMatch && idMatch.index !== undefined) { // index が存在することを確認
                // substring を使用してID部分を除去
                titleWithoutId = titleWithoutId.substring(0, idMatch.index);
            }
            const normalizedTitle = titleWithoutId.replace(/\s+/g, ' ').trim();
            log('Extracted heading: level=%d, title="%s"', node.depth, normalizedTitle);
            // 抽出した見出しを配列に追加 (YAML側と同じ正規化を追加)
            headings.push({ level: node.depth, title: normalizedTitle });
        }); // visit コールバック終了
        log('Finished extracting headings. Count: %d', headings.length);
        return headings;
    } catch (error) {
        // ここはユーザーに見せるべきエラーの可能性があるので console.error のまま
        console.error(formatError(`Failed to extract headings from ${sourceName}`, error));
        logError('Error during heading extraction from %s: %O', sourceName, error); // debugログにも詳細を残す
        return []; // エラー時は空配列を返す
    }
} // extractHeadings 関数の終了

/**
 * YAMLデータから指定されたセクションとその子要素をMarkdown形式で再構築するヘルパー関数
 * @param {object} section - 再構築するセクションオブジェクト
 * @param {number} remainingDepth - 再構築する残りの深さ
 * @param {boolean} [singleBranch=false] - trueの場合、各階層で最初の子要素のみを辿る
 * @returns {string} 再構築されたMarkdown文字列
 */
function reconstructMarkdownFromYaml(section, remainingDepth, singleBranch = false) {
    // remainingDepth が 0 以下、または section が null なら再構築しない
    if (!section || remainingDepth <= 0) {
        return '';
    }
    // level と title が存在するかチェック
    if (typeof section.level !== 'number' || typeof section.title !== 'string') {
        logError('Invalid section structure in reconstructMarkdownFromYaml: %o', section);
        return ''; // 不正な構造の場合は空文字列を返す
    }
    let markdown = `${'#'.repeat(section.level)} ${section.title}`;
    if (section.id) {
        markdown += ` {#${section.id}}`;
    }
    // granularity タグ自体は currentScope に含める (必要に応じて後で削除)
    if (section.granularity) {
         markdown += ` <${'#'.repeat(section.granularity)}>`;
    }
    markdown += '\n';

    if (section.list_items && section.list_items.length > 0) {
        section.list_items.forEach(item => {
            markdown += `  * ${item}\n`; // Fixed 2-space indent
        });
    }

    // 子要素の再構築は remainingDepth が 1 より大きい場合のみ行う
    if (remainingDepth > 1 && section.children && section.children.length > 0) {
        // singleBranch=true のときは **最初の子だけ** たどる
        const iterable = singleBranch ? [section.children[0]] : section.children;
        for (const child of iterable) {
            // 再帰呼び出し時に remainingDepth をデクリメント
            // singleBranch フラグはそのまま子に引き継ぐ
            markdown += reconstructMarkdownFromYaml(child, remainingDepth - 1, singleBranch);
            if (singleBranch) break; // 幅を 1 に固定 (最初の要素のみ処理したら抜ける)
        }
    }
    return markdown;
}

/**
 * YAMLデータから指定されたセクションとその子要素をYAML構造のJSオブジェクトとして再構築するヘルパー関数
 * @param {object} section - 再構築するセクションオブジェクト
 * @param {number} remainingDepth - 再構築する残りの深さ
 * @param {boolean} [singleBranch=false] - trueの場合、各階層で最初の子要素のみを辿る
 * @returns {object|null} 再構築されたセクション構造を表すJSオブジェクト、または無効な場合はnull
 */
function reconstructYamlStructure(section, remainingDepth, singleBranch = false) {
    if (!section || remainingDepth <= 0) {
        return null;
    }
     // level と title が存在するかチェック
     if (typeof section.level !== 'number' || typeof section.title !== 'string') {
        logError('Invalid section structure in reconstructYamlStructure: %o', section);
        return null; // 不正な構造の場合は null を返す
    }

    const node = {
        level: section.level,
        title: section.title,
    };
    if (section.id) node.id = section.id;
    // granularity は YAML 構造には含めない
    if (section.list_items && section.list_items.length > 0) {
        node.list_items = section.list_items;
    }

    if (remainingDepth > 1 && section.children && section.children.length > 0) {
        const children = [];
        const iterable = singleBranch ? [section.children[0]] : section.children;
        for (const child of iterable) {
            // 再帰呼び出し時に remainingDepth をデクリメント
            // singleBranch フラグはそのまま子に引き継ぐ
            const childNode = reconstructYamlStructure(child, remainingDepth - 1, singleBranch);
            if (childNode) { // null でない場合のみ追加
                children.push(childNode);
            }
            if (singleBranch) break; // 幅を 1 に固定 (最初の要素のみ処理したら抜ける)
        }
        if (children.length > 0) {
            node.children = children;
        }
    }
    return node;
}


// --- DEBUG HELPER --- 削除
// function logWithBytes(label, str) { ... }
// --- END DEBUG HELPER ---

/**
 * YAMLデータとtargetDocContentを比較し、次に執筆すべき範囲などを決定する (YAML版)
 */
export function determineNextScope(sectionListYamlData, targetDocContent) {
    logScope('Determining next scope...');
    const targetBodyContent = grayMatter(targetDocContent || '').content;
    const targetDocHeadings = extractHeadings(targetBodyContent, 'targetDoc'); // extractHeadings 内でログ出力される

    logScope('Target document headings extracted. Count: %d', targetDocHeadings.length);
    const targetHeadingsSet = new Set(targetDocHeadings.map(h => `${h.level}-${h.title}`));
    logScope('Target headings set created. Size: %d. First 5 keys: %o', targetHeadingsSet.size, [...targetHeadingsSet].slice(0, 5));


    let nextSectionData = null;
    let parentH1Data = null; // H1レベルの親を保持
    let parentH2Data = null; // H2レベルの親を保持

    // 再帰的にセクションを探索する関数
    function findNextSectionRecursive(
        sections,
        currentParentH1 = null,
        currentParentH2 = null,
        allowedDepth = Infinity   // 残り許容深さ
    ) {
        logScope('Recursive search: allowedDepth=%d, currentParentH1=%s, currentParentH2=%s',
                 allowedDepth, currentParentH1?.title, currentParentH2?.title);
        if (nextSectionData) {
            logScope('Next section already found, skipping further search.');
            return;
        }
        if (allowedDepth <= 0) {
            logScope('Reached allowed depth limit, stopping search in this branch.');
            return; // 深さ制限ガード
        }

        for (const section of sections) {
            // 不正なセクション構造をチェック
            if (!section || typeof section.level !== 'number' || typeof section.title !== 'string') {
                logScope('Skipping invalid section structure: %o', section);
                continue; // 不正な構造のセクションはスキップ
            }

            logScope('Checking section: level=%d, title="%s"', section.level, section.title);

            /* ① YAML ⇔ Target Doc 見出し比較 */
            const normalizedYamlTitle = section.title.replace(/\s+/g, ' ').trim();
            const comparableText = `${section.level}-${normalizedYamlTitle}`;
            const existsInTarget = targetHeadingsSet.has(comparableText);
            logScope('Comparable key: "%s", Exists in target? %s', comparableText, existsInTarget);


            /* ② 親がすでに存在し、granularity が指定されている場合は枝完了 */
            if (existsInTarget && section.granularity !== undefined) {
                logScope('Section exists and has granularity (%d), skipping children.', section.granularity);
                continue; // 子は探索しない
            }

            /* ③ 未執筆のセクションを発見 */
            if (!existsInTarget) {
                logScope('Found next section: level=%d, title="%s"', section.level, section.title);
                nextSectionData = section;
                // 親データの設定はここで確定
                parentH1Data = section.level === 1 ? section : currentParentH1;
                parentH2Data = section.level === 2 ? section : currentParentH2;
                logScope('Set parent data: H1=%s, H2=%s', parentH1Data?.title, parentH2Data?.title);
                return; // 発見したら即座に探索終了
            }

            /* ④ 子探索 */
            const nextParentH1 = section.level === 1 ? section : currentParentH1;
            const nextParentH2 = section.level === 2 ? section : currentParentH2;

            if (section.children && section.children.length > 0) {
                // 子側の残り許容深さを計算 (nullish coalescing を使用)
                const childAllowedDepth = section.granularity ?? (allowedDepth - 1);
                logScope('Section has children. Calculated childAllowedDepth: %d', childAllowedDepth);

                // 子探索可否を “子側” の残り許容深さで判定
                if (childAllowedDepth > 1) {
                    logScope('Descending into children...');
                    findNextSectionRecursive(
                        section.children,
                        nextParentH1,
                        nextParentH2,
                        childAllowedDepth
                    );
                    if (nextSectionData) {
                        logScope('Next section found in children, returning.');
                        return; // 子要素で見つかったら抜ける
                    }
                    logScope('Finished searching children of "%s".', section.title);
                } else {
                    logScope('Skipping children search due to childAllowedDepth <= 1.');
                }
            } else {
                 logScope('Section has no children.');
            }
        }
    }

    if (sectionListYamlData && sectionListYamlData.sections) {
        logScope('Starting recursive search from root sections.');
        findNextSectionRecursive(sectionListYamlData.sections, null, null, Infinity);
    }

    if (!nextSectionData) {
        // ここはユーザーへの警告なので console.warn のまま
        console.warn('No next section found in YAML data. Assuming completion or error.');
        logScope('No next section identified after full search.'); // debugログにも残す
        return {
            currentScope: "<!-- No next section identified from YAML -->",
            sectionStructure: "<!-- Could not determine section structure from YAML -->",
            documentStructure: "<!-- Could not determine document structure from YAML -->",
            sectionListRaw: yaml.dump(sectionListYamlData)
        };
    }

    logScope('Next section determined: %s', nextSectionData.title);
    // --- granularity と currentScope のロジック修正 ---
    // granularity に基づいて再構築する深さを決定
    const remainingDepthForScope = (nextSectionData.granularity && nextSectionData.granularity > 0)
        ? nextSectionData.granularity
        : 6; // デフォルトの残り深さ
    logScope('Calculating remaining depth for currentScope: %d', remainingDepthForScope);

    // reconstructMarkdownFromYaml を呼び出し、結果を Markdown 文字列に変換
    const currentScope = reconstructMarkdownFromYaml(
        nextSectionData,
        remainingDepthForScope,
        /* singleBranch = */ Boolean(nextSectionData.granularity) // granularity があれば true
    ).trim();
    logScope('Reconstructed currentScope (first 100 chars): %s', currentScope.substring(0, 100));


    // sectionStructure: 親(H2)とその子要素全体を再構築。H2親がなければH1親(or自身)を使う
    // こちらは granularity によらず常に全階層 (深さ6) を表示 (singleBranch=false)
    const sectionToReconstructForStructure = parentH2Data || parentH1Data || nextSectionData;
    logScope('Determined section for sectionStructure: %s', sectionToReconstructForStructure.title);
    const sectionStructure = reconstructMarkdownFromYaml(sectionToReconstructForStructure, 6, false).trim();
    logScope('Reconstructed sectionStructure (first 100 chars): %s', sectionStructure.substring(0, 100));


    // documentStructure: H1, H2, H3レベルの構造を再構築 (Markdown版)
    let documentStructure = '';
    function buildDocStructureRecursive(sections) {
        if (!sections) return;
        for (const section of sections) {
             // 不正なセクション構造をチェック (ここでも)
            if (!section || typeof section.level !== 'number' || typeof section.title !== 'string') {
                logScope('Skipping invalid section structure in buildDocStructureRecursive: %o', section);
                continue;
            }
            if (section.level <= 3) { // H3まで含める
                documentStructure += `${'#'.repeat(section.level)} ${section.title}`;
                if (section.id) documentStructure += ` {#${section.id}}`;
                // granularity は documentStructure には不要なので除去
                // granularity タグを追加
                if (section.granularity) {
                    documentStructure += ` <${'#'.repeat(section.granularity)}>`;
                }
                documentStructure += '\n';
                // H1, H2の場合のみ子要素を再帰的に探索
                if (section.level < 3 && section.children && section.children.length > 0) {
                    buildDocStructureRecursive(section.children);
                }
            }
        }
    }

    if (sectionListYamlData && sectionListYamlData.sections) {
        logScope('Building document structure (H1-H3)...');
        buildDocStructureRecursive(sectionListYamlData.sections);
    }
    documentStructure = documentStructure.trim(); // 末尾の改行を削除
    logScope('Reconstructed documentStructure (first 100 chars): %s', documentStructure.substring(0, 100));


    return {
        currentScope, // Markdown 文字列
        sectionStructure, // Markdown 文字列
        documentStructure, // Markdown 文字列
        sectionListRaw: yaml.dump(sectionListYamlData) // これは元々 YAML 文字列
    };
}


/** テンプレート内のプレースホルダー置換 */
export function replacePlaceholders(templateContent, data) {
    log('Replacing placeholders in template...');
    let result = templateContent;
    result = result.replace(/\{\{\s*TARGET_DOC_PATH\s*\}\}/g, () => data.targetDocPath || '');
    result = result.replace(/\{\{\s*SUB_TASK\s*\}\}/g, () => data.subTask || '');
    result = result.replace(/\{\{\s*MICRO_TASK\s*\}\}/g, () => data.microTask || '');
    result = result.replace(/\{\{\s*PLOT_YAML\s*\}\}/g, () => data.plot ?? '');
    result = result.replace(/\{\{\s*DRAFT_MD\s*\}\}/g, () => data.draft ?? '');
    result = result.replace(/\{\{\s*REVIEW_MD\s*\}\}/g, () => data.review ?? '');
    result = result.replace(/\{\{\s*REPOMIX_OUTPUT\s*\}\}/g, () => data.repomix ?? '<!-- repomix-output.md not found or empty -->');
    result = result.replace(/\{\{\s*TARGET_DOC_FULL\s*\}\}/g, () => data.targetDoc || '');
    // currentScope, sectionStructure, documentStructure は Markdown 文字列として渡される
    result = result.replace(/\{\{\s*CURRENT_SCOPE\s*\}\}/g, () => data.currentScope || '');
    result = result.replace(/\{\{\s*SECTION_STRUCTURE\s*\}\}/g, () => data.sectionStructure || '');
    result = result.replace(/\{\{\s*DOC_STRUCTURE\s*\}\}/g, () => data.documentStructure || '');
    log('Placeholders replaced.');
    return result;
}

/**
 * コマンドライン引数を解析する関数
 */
export async function parseArguments() {
    logMain('Parsing command line arguments...');
    const args = await yargs(hideBin(process.argv))
        .usage('Usage: $0 --target-doc <path> --prompt-type <type> --output <path>')
        .option('target-doc', { alias: 't', description: '執筆対象のドキュメントファイルパス', type: 'string', demandOption: true })
        .option('prompt-type', { alias: 'p', description: '生成するプロンプトの種類', type: 'string', choices: ['writer', 'plot-reviewer', 'draft-reviewer', 'rewriter'], demandOption: true })
        .option('output', { alias: 'o', description: '生成されたプロンプトの出力先ファイルパス', type: 'string', demandOption: true })
        .help().alias('help', 'h').strict().argv;
    logMain('Arguments parsed: %o', args);
    return args;
}


/**
 * メイン処理 (依存性注入オブジェクトを受け取るように変更)
 * @param {object} [deps] - 依存性注入オブジェクト
 * @param {Function} [deps.argParser=parseArguments] - yargs ラッパー
 * @param {Function} [deps.readCachedFn=originalReadCached] - ファイル読み込みキャッシュ関数
 * @param {Function} [deps.writeFileFn=originalWriteFile] - ファイル書き込み関数
 * @param {Function} [deps.determineNextScopeFn=determineNextScope] - 次のスコープ決定関数
 * @param {Function} [deps.runCliFn=originalRunCli] - repomix CLI 実行関数
 */
export async function main({
  argParser = parseArguments,
  readCachedFn = originalReadCached, // ★★★ DI: readCachedFn
  writeFileFn = originalWriteFile,   // ★★★ DI: writeFileFn
  determineNextScopeFn = determineNextScope, // ★★★ DI: determineNextScopeFn
  runCliFn = originalRunCli,         // ★★★ DI: runCliFn
} = {}) {
  logMain('Starting main execution with injected dependencies...');
  let argv;
  try {
      argv = await argParser(); // 注入された argParser を使用
  } catch (error) {
      // ユーザー向けのエラーなので console.error のまま
      console.error(formatError('Argument parsing failed', error));
      logError('Argument parsing failed: %O', error); // debugログにも詳細を残す
      process.exit(1);
  }

  try {
    // ★★★ DI: runCliFn を直接呼び出し ★★★
    console.log(`🔄 Running repomix via library using root config to update repomix-output.md...`);
    logRepomix('Executing repomix CLI via injected runCliFn...');
    try {
        await runCliFn(['.'], process.cwd(), { quiet: false }); // 注入された runCliFn を使用
        console.log(`✅ repomix command finished running via library.`);
        console.log(`   Output should be saved based on root repomix.config.json settings.`);
        logRepomix('repomix CLI execution successful.');
    } catch (error) {
        console.error(formatError('Failed to execute repomix via library', error));
        console.warn('Continuing prompt generation despite repomix execution error.');
        logError('repomix CLI execution failed: %O', error);
    }
    // ▲▲▲ DI: runCliFn ▲▲▲

    const templateFileName = `${argv.promptType}-prompt-template.md`;
    const templateFilePath = path.join('temp-documentation-support', templateFileName);
    const subTaskPath = path.join('temp-documentation-support', 'sub-task.md');
    const microTaskPath = path.join('temp-documentation-support', 'micro-task.md');
    const sectionListYamlPath = path.join('temp-documentation-support', 'section-list.yaml');
    const repomixOutputPath = 'repomix-output.md'; // Optional file

    // 条件付きで読み込むファイルのパス
    const plotPath = argv.promptType === 'plot-reviewer' ? path.join('temp-documentation-support', 'plot.yaml') : null;
    const draftPath = (argv.promptType === 'draft-reviewer' || argv.promptType === 'rewriter') ? path.join('temp-documentation-support', 'draft.md') : null;
    const reviewPath = argv.promptType === 'rewriter' ? path.join('temp-documentation-support', 'review.md') : null;

    logMain('Reading required files in parallel using injected readCachedFn...');
    // ★★★ DI: readCachedFn を使用 ★★★
    const [
        templateContent,
        subTaskContent,
        microTaskContent,
        targetDocContent,
        sectionListYamlContentResult, // 結果を変数に格納
        repomixContent, // Optional
        plotContent,    // Conditional
        draftContent,   // Conditional
        reviewContent   // Conditional
    ] = await Promise.all([
        readCachedFn(templateFilePath),
        readCachedFn(subTaskPath),
        readCachedFn(microTaskPath),
        readCachedFn(argv.targetDoc),
        readCachedFn(sectionListYamlPath).catch(err => { // ★★★ 修正: ENOENT をキャッチして null を返す ★★★
            if (err.code === 'ENOENT') {
                logError('Required file %s not found during Promise.all: %O', sectionListYamlPath, err);
                return null; // ファイルが見つからない場合は null を返す
            }
            throw err; // その他のエラーは再スロー
        }),
        readCachedFn(repomixOutputPath).catch(err => {
            if (err.code === 'ENOENT') {
                console.warn(`Optional file not found: ${repomixOutputPath}. Skipping.`);
                logMain('Optional file %s not found, resolving null.', repomixOutputPath);
                return null;
            }
            logError('Error reading optional file %s: %O', repomixOutputPath, err);
            throw err;
        }),
        plotPath ? readCachedFn(plotPath) : Promise.resolve(null),
        draftPath ? readCachedFn(draftPath) : Promise.resolve(null),
        reviewPath ? readCachedFn(reviewPath) : Promise.resolve(null)
    ]);
    // ▲▲▲ DI: readCachedFn ▲▲▲
    logMain('All required files read.');

    // ★★★ 修正: sectionListYamlContentResult の存在チェック ★★★
    if (!sectionListYamlContentResult) {
        console.error(`Error: Required file ${sectionListYamlPath} not found or could not be read.`);
        logError('Required file %s was not loaded successfully.', sectionListYamlPath);
        process.exit(1);
    }
    // ▲▲▲ 修正 ▲▲▲

    // sectionListYamlContent のパース (エラーハンドリング強化)
    let sectionListYamlData = null;
    // if (sectionListYamlContent) { // チェック済みなので不要
    logMain('Parsing section list YAML...');
    try {
        sectionListYamlData = yaml.load(sectionListYamlContentResult); // ★★★ 修正: 結果変数を使用 ★★★
        if (!sectionListYamlData || typeof sectionListYamlData !== 'object' || !Array.isArray(sectionListYamlData.sections)) {
            throw new Error('Invalid YAML structure: Root should be an object with a "sections" array.');
        }
        logMain('Section list YAML parsed successfully.');
    } catch (e) {
        console.error(formatError(`Failed to parse ${sectionListYamlPath}`, e));
        logError('Failed to parse YAML file %s: %O', sectionListYamlPath, e);
        process.exit(1);
    }
    // } else { ... } // チェック済みなので不要

    // ★★★ DI: determineNextScopeFn を使用 ★★★
    const { currentScope, sectionStructure, documentStructure, sectionListRaw } = determineNextScopeFn(sectionListYamlData, targetDocContent);
    // ▲▲▲ DI: determineNextScopeFn ▲▲▲

    if (currentScope === "<!-- No next section identified from YAML -->") {
        console.log("Skipping prompt generation because no next section was identified from YAML.");
        logMain('No next section identified, skipping prompt generation.');
        return;
    }

    logMain('Generating prompt content...');
    const generatedPrompt = replacePlaceholders(templateContent, {
      targetDocPath: argv.targetDoc, subTask: subTaskContent, microTask: microTaskContent, repomix: repomixContent,
      plot: plotContent, draft: draftContent, review: reviewContent, targetDoc: targetDocContent,
      currentScope: currentScope, // Markdown string
      sectionStructure: sectionStructure, // Markdown string
      documentStructure: documentStructure, // Markdown string
      // sectionListRaw: sectionListRaw, // This is already a YAML string
    });
    logMain('Prompt content generated.');

    const outputFilePath = path.resolve(argv.output);
    logMain('Writing generated prompt to: %s using injected writeFileFn...', outputFilePath);
    // ★★★ DI: writeFileFn を使用 ★★★
    await writeFileFn(outputFilePath, generatedPrompt, 'utf-8');
    // ▲▲▲ DI: writeFileFn ▲▲▲
    console.log(`✅ Prompt successfully generated and saved to: ${outputFilePath}`);
    logMain('Main execution completed successfully.');

  } catch (error) {
    // Promise.all やその他の非同期処理からのエラーをキャッチ
    console.error(formatError('Failed to generate prompt', error));
    logError('Unhandled error during main execution: %O', error);
    process.exit(1);
  }
}

// Check if the script is being run directly using import.meta.url
const isMainScript = process.argv[1] === fileURLToPath(import.meta.url);
logMain('Is main script? %s', isMainScript);

if (isMainScript) {
  main(); // ★★★ 変更なし: デフォルトの依存関係で実行される ★★★
}