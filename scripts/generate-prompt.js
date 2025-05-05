#!/usr/bin/env node

import { readFile, writeFile } from 'fs/promises'; // Keep writeFile
import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { remark } from 'remark';
import remarkParse from 'remark-parse';
import { visit } from 'unist-util-visit';
import { toString } from 'mdast-util-to-string'; // Keep for potential fallback or other uses
import { VFile } from 'vfile';
import grayMatter from 'gray-matter';
import { runCli } from 'repomix';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml'; // Import js-yaml
import { Buffer } from 'buffer'; // Import Buffer for byte operations
import { readCached } from '../utils/fsCache.js'; // Import readCached

/**
 * エラーメッセージをフォーマットするヘルパー関数
 */
export function formatError(message, error) {
  let formattedMessage = `Error: ${message}`;
  if (error) {
    const errorDetails = error.stderr || error.stdout || error.message || String(error);
    formattedMessage += `\nDetails: ${errorDetails}`;
    if (error.stack) {
        formattedMessage += `\nStack: ${error.stack}`;
    }
  }
  return formattedMessage;
}

// readFileContent 関数は削除 (readCached を使用するため)

/**
 * Markdownコンテンツから見出しのリストを抽出する (比較用情報を含む)
 */
export function extractHeadings(content, sourceName = 'unknown') {
    if (!content) return [];
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
            // 正規表現を修正: 行末までを明示
            const idRegex = /\s*\{\s*#[^}]+\s*\}\s*$/;
            const idMatch = titleWithoutId.match(idRegex);
            if (idMatch && idMatch.index !== undefined) { // index が存在することを確認
                // substring を使用してID部分を除去
                titleWithoutId = titleWithoutId.substring(0, idMatch.index);
            }
            // 抽出した見出しを配列に追加 (YAML側と同じ正規化を追加)
            headings.push({ level: node.depth, title: titleWithoutId.replace(/\s+/g, ' ').trim() });
        }); // visit コールバック終了
        return headings;
    } catch (error) {
        console.error(formatError(`Failed to extract headings from ${sourceName}`, error));
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


// --- DEBUG HELPER ---
function logWithBytes(label, str) {
    if (typeof str !== 'string') {
        console.log(`DEBUG: ${label}: Not a string (${typeof str})`);
        return;
    }
    const buffer = Buffer.from(str, 'utf-8'); // UTF-8としてバイト列取得
    console.log(`DEBUG: ${label}: "${str}" (Bytes: ${buffer.toString('hex')})`);
}
// --- END DEBUG HELPER ---

/**
 * YAMLデータとtargetDocContentを比較し、次に執筆すべき範囲などを決定する (YAML版)
 */
export function determineNextScope(sectionListYamlData, targetDocContent) {
    const targetBodyContent = grayMatter(targetDocContent || '').content;
    const targetDocHeadings = extractHeadings(targetBodyContent, 'targetDoc'); // AST + 文字列操作でID除去されたタイトルを取得

    // --- DEBUG START ---
    console.log('\n--- Debugging determineNextScope ---');
    if (targetDocHeadings.length > 0) {
        const firstMdHeading = targetDocHeadings[0];
        logWithBytes('First MD Heading Title (Extracted)', firstMdHeading.title);
        const firstMdKey = `${firstMdHeading.level}-${firstMdHeading.title}`;
        logWithBytes('First MD Heading Key (Constructed)', firstMdKey);
    } else {
        console.log('DEBUG: No headings extracted from Markdown.');
    }
    const targetHeadingsSet = new Set(targetDocHeadings.map(h => `${h.level}-${h.title}`));
    console.log('DEBUG: targetHeadingsSet Keys (first 5):', [...targetHeadingsSet].slice(0, 5));
    console.log('--- End Debugging determineNextScope ---\n');
    // --- DEBUG END ---


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
        if (nextSectionData) return;
        if (allowedDepth <= 0) return; // 深さ制限ガード

        for (const section of sections) {
            // --- DEBUG START ---
            if (section.level === 1) { // 最初のセクションのみ詳細ログ
                console.log('\n--- Debugging First YAML Section Comparison ---');
                logWithBytes('YAML Original Title', section.title);
                const normalizedYamlTitleDebug = section.title.replace(/\s+/g, ' ').trim();
                logWithBytes('YAML Normalized Title', normalizedYamlTitleDebug);
                const comparableTextDebug = `${section.level}-${normalizedYamlTitleDebug}`;
                logWithBytes('YAML Comparable Key', comparableTextDebug);

                // Markdown側の最初のキーと比較
                if (targetDocHeadings.length > 0) {
                     const firstMdKeyDebug = `${targetDocHeadings[0].level}-${targetDocHeadings[0].title}`;
                     logWithBytes('Comparing with MD Key', firstMdKeyDebug);
                     console.log(`DEBUG: Keys Equal? ${comparableTextDebug === firstMdKeyDebug}`);
                }
                console.log('DEBUG: targetHeadingsSet.has(YAML Key)?', targetHeadingsSet.has(comparableTextDebug));
                console.log('--- End Debugging First YAML Section Comparison ---\n');
            }
            // --- DEBUG END ---

            /* ① YAML ⇔ Target Doc 見出し比較 */
            const normalizedYamlTitle = section.title.replace(/\s+/g, ' ').trim();
            const comparableText = `${section.level}-${normalizedYamlTitle}`;
            const existsInTarget = targetHeadingsSet.has(comparableText);

            // --- DEBUG START ---
            if (section.level === 1) { // 比較結果もログ
                console.log(`DEBUG: existsInTarget for level 1 section: ${existsInTarget}`);
            }
            // --- DEBUG END ---


            /* ② 親がすでに存在し、granularity が指定されている場合は枝完了 */
            if (existsInTarget && section.granularity !== undefined) {
                continue; // 子は探索しない
            }

            /* ③ 未執筆のセクションを発見 */
            if (!existsInTarget) {
                nextSectionData = section;
                // 親データの設定はここで確定
                parentH1Data = section.level === 1 ? section : currentParentH1;
                parentH2Data = section.level === 2 ? section : currentParentH2;
                return; // 発見したら即座に探索終了
            }

            /* ④ 子探索 */
            const nextParentH1 = section.level === 1 ? section : currentParentH1;
            const nextParentH2 = section.level === 2 ? section : currentParentH2;

            if (section.children && section.children.length > 0) {
                // 子側の残り許容深さを計算 (nullish coalescing を使用)
                const childAllowedDepth = section.granularity ?? (allowedDepth - 1);

                // 子探索可否を “子側” の残り許容深さで判定
                if (childAllowedDepth > 1) {
                    findNextSectionRecursive(
                        section.children,
                        nextParentH1,
                        nextParentH2,
                        childAllowedDepth
                    );
                    if (nextSectionData) return; // 子要素で見つかったら抜ける
                }
            }
        }
    }

    if (sectionListYamlData && sectionListYamlData.sections) {
        // 最初の呼び出しで allowedDepth に Infinity を渡す
        findNextSectionRecursive(sectionListYamlData.sections, null, null, Infinity);
    }

    if (!nextSectionData) {
        console.warn('No next section found in YAML data. Assuming completion or error.');
        return {
            currentScope: "<!-- No next section identified from YAML -->",
            sectionStructure: "<!-- Could not determine section structure from YAML -->",
            documentStructure: "<!-- Could not determine document structure from YAML -->",
            sectionListRaw: yaml.dump(sectionListYamlData)
        };
    }

    // --- granularity と currentScope のロジック修正 ---
    // granularity に基づいて再構築する深さを決定
    const remainingDepthForScope = (nextSectionData.granularity && nextSectionData.granularity > 0)
        ? nextSectionData.granularity
        : 6; // デフォルトの残り深さ

    // reconstructMarkdownFromYaml を呼び出し、結果を Markdown 文字列に変換
    const currentScope = reconstructMarkdownFromYaml(
        nextSectionData,
        remainingDepthForScope,
        /* singleBranch = */ Boolean(nextSectionData.granularity) // granularity があれば true
    ).trim();


    // sectionStructure: 親(H2)とその子要素全体を再構築。H2親がなければH1親(or自身)を使う
    // こちらは granularity によらず常に全階層 (深さ6) を表示 (singleBranch=false)
    const sectionToReconstructForStructure = parentH2Data || parentH1Data || nextSectionData;
    const sectionStructure = reconstructMarkdownFromYaml(sectionToReconstructForStructure, 6, false).trim();


    // documentStructure: H1, H2, H3レベルの構造を再構築 (Markdown版)
    let documentStructure = '';
    function buildDocStructureRecursive(sections) {
        if (!sections) return;
        for (const section of sections) {
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
        buildDocStructureRecursive(sectionListYamlData.sections);
    }
    documentStructure = documentStructure.trim(); // 末尾の改行を削除


    return {
        currentScope, // Markdown 文字列
        sectionStructure, // Markdown 文字列
        documentStructure, // Markdown 文字列
        sectionListRaw: yaml.dump(sectionListYamlData) // これは元々 YAML 文字列
    };
}


/** テンプレート内のプレースホルダー置換 */
export function replacePlaceholders(templateContent, data) {
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
    return result;
}

/** repomix 実行 */
async function runRepomix() {
  console.log(`🔄 Running repomix via library using root config to update repomix-output.md...`);
  try {
    await runCli(['.'], process.cwd(), { quiet: false });
    console.log(`✅ repomix command finished running via library.`);
    console.log(`   Output should be saved based on root repomix.config.json settings.`);
  } catch (error) {
    console.error(formatError('Failed to execute repomix via library', error));
    console.warn('Continuing prompt generation despite repomix execution error.');
  }
}

/**
 * コマンドライン引数を解析する関数
 */
export async function parseArguments() {
    return yargs(hideBin(process.argv))
        .usage('Usage: $0 --target-doc <path> --prompt-type <type> --output <path>')
        .option('target-doc', { alias: 't', description: '執筆対象のドキュメントファイルパス', type: 'string', demandOption: true })
        .option('prompt-type', { alias: 'p', description: '生成するプロンプトの種類', type: 'string', choices: ['writer', 'plot-reviewer', 'draft-reviewer', 'rewriter'], demandOption: true })
        .option('output', { alias: 'o', description: '生成されたプロンプトの出力先ファイルパス', type: 'string', demandOption: true })
        .help().alias('help', 'h').strict().argv;
}


/**
 * メイン処理 (引数解析関数を引数として受け取る)
 */
export async function main(argParser = parseArguments) {
  let argv;
  try {
      argv = await argParser();
  } catch (error) {
      console.error(formatError('Argument parsing failed', error));
      process.exit(1);
  }

  try {
    await runRepomix(); // repomix はファイル書き込みを伴う可能性があるため、先に実行

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

    // ファイル読み込みを並列化
    const [
        templateContent,
        subTaskContent,
        microTaskContent,
        targetDocContent,
        sectionListYamlContent,
        repomixContent, // Optional
        plotContent,    // Conditional
        draftContent,   // Conditional
        reviewContent   // Conditional
    ] = await Promise.all([
        readCached(templateFilePath),
        readCached(subTaskPath),
        readCached(microTaskPath),
        readCached(argv.targetDoc),
        readCached(sectionListYamlPath),
        readCached(repomixOutputPath).catch(err => { // Handle optional file error
            if (err.code === 'ENOENT') {
                console.warn(`Optional file not found: ${repomixOutputPath}. Skipping.`);
                return null; // Return null if not found
            }
            throw err; // Re-throw other errors
        }),
        plotPath ? readCached(plotPath) : Promise.resolve(null), // Read conditionally or resolve null
        draftPath ? readCached(draftPath) : Promise.resolve(null), // Read conditionally or resolve null
        reviewPath ? readCached(reviewPath) : Promise.resolve(null)  // Read conditionally or resolve null
    ]);

    // sectionListYamlContent のパース (エラーハンドリング強化)
    let sectionListYamlData = null;
    if (sectionListYamlContent) {
        try {
            sectionListYamlData = yaml.load(sectionListYamlContent);
            if (!sectionListYamlData || typeof sectionListYamlData !== 'object' || !Array.isArray(sectionListYamlData.sections)) {
                // より具体的な構造チェック
                throw new Error('Invalid YAML structure: Root should be an object with a "sections" array.');
            }
        } catch (e) {
            console.error(formatError(`Failed to parse ${sectionListYamlPath}`, e));
            process.exit(1);
        }
    } else {
        // sectionListYamlContent が null または空の場合のエラー処理
        console.error(`Error: ${sectionListYamlPath} not found or empty.`);
        process.exit(1);
    }

    const { currentScope, sectionStructure, documentStructure, sectionListRaw } = determineNextScope(sectionListYamlData, targetDocContent);

    if (currentScope === "<!-- No next section identified from YAML -->") {
        console.log("Skipping prompt generation because no next section was identified from YAML.");
        return;
    }

    const generatedPrompt = replacePlaceholders(templateContent, {
      targetDocPath: argv.targetDoc, subTask: subTaskContent, microTask: microTaskContent, repomix: repomixContent,
      plot: plotContent, draft: draftContent, review: reviewContent, targetDoc: targetDocContent,
      currentScope: currentScope, // Markdown string
      sectionStructure: sectionStructure, // Markdown string
      documentStructure: documentStructure, // Markdown string
      // sectionListRaw: sectionListRaw, // This is already a YAML string
    });

    const outputFilePath = path.resolve(argv.output);
    await writeFile(outputFilePath, generatedPrompt, 'utf-8');
    console.log(`✅ Prompt successfully generated and saved to: ${outputFilePath}`);

  } catch (error) {
    // Promise.all やその他の非同期処理からのエラーをキャッチ
    console.error(formatError('Failed to generate prompt', error));
    process.exit(1);
  }
}

// Check if the script is being run directly using import.meta.url
const isMainScript = process.argv[1] === fileURLToPath(import.meta.url);

if (isMainScript) {
  main();
}