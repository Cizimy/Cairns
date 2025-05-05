#!/usr/bin/env node

import { readFile, writeFile } from 'fs/promises';
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

/**
 * 指定されたパスのファイルを読み込むヘルパー関数
 */
export async function readFileContent(filePath, description, optional = false) {
  const absolutePath = path.resolve(filePath);
  try {
    const content = await readFile(absolutePath, 'utf-8');
    return content;
  } catch (error) {
    if (error.code === 'ENOENT') {
      if (optional) {
        console.warn(`Optional file not found for ${description}: ${absolutePath}. Skipping.`);
        return null;
      }
      throw new Error(`File not found for ${description}: ${absolutePath}`);
    }
    throw new Error(`Failed to read ${description} at ${absolutePath}: ${error.message}`);
  }
}

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
 * @returns {string} 再構築されたMarkdown文字列
 */
function reconstructMarkdownFromYaml(section, remainingDepth) {
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
        section.children.forEach(child => {
            // 再帰呼び出し時に remainingDepth をデクリメント
            markdown += reconstructMarkdownFromYaml(child, remainingDepth - 1);
        });
    }
    return markdown;
}


/**
 * YAMLデータとtargetDocContentを比較し、次に執筆すべき範囲などを決定する (YAML版)
 */
export function determineNextScope(sectionListYamlData, targetDocContent) {
    const targetBodyContent = grayMatter(targetDocContent || '').content;
    const targetDocHeadings = extractHeadings(targetBodyContent, 'targetDoc'); // AST + 文字列操作でID除去されたタイトルを取得

    const targetHeadingsSet = new Set(targetDocHeadings.map(h => `${h.level}-${h.title}`));

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
            /* ① YAML ⇔ Target Doc 見出し比較 */
            const normalizedYamlTitle = section.title.replace(/\s+/g, ' ').trim();
            const comparableText = `${section.level}-${normalizedYamlTitle}`;
            const existsInTarget = targetHeadingsSet.has(comparableText);

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
    // granularity が 1 なら nextSectionData のみ (深さ1)
    // granularity が 2 なら nextSectionData とその子まで (深さ2)
    // granularity が未指定 or 0 以下なら、従来の最大深度 (6) まで
    const remainingDepthForScope = (nextSectionData.granularity && nextSectionData.granularity > 0)
        ? nextSectionData.granularity
        : 6; // デフォルトの残り深さ
    const currentScope = reconstructMarkdownFromYaml(nextSectionData, remainingDepthForScope).trim();

    // sectionStructure: 親(H2)とその子要素全体を再構築。H2親がなければH1親(or自身)を使う
    // こちらは granularity によらず常に全階層 (深さ6) を表示
    const sectionToReconstructForStructure = parentH2Data || parentH1Data || nextSectionData;
    const sectionStructure = reconstructMarkdownFromYaml(sectionToReconstructForStructure, 6).trim();

    // documentStructure: H1, H2, H3レベルの構造を再構築
    let documentStructure = '';
    function buildDocStructureRecursive(sections) {
        for (const section of sections) {
            if (section.level <= 3) { // H3まで含める
                documentStructure += `${'#'.repeat(section.level)} ${section.title}`;
                if (section.id) documentStructure += ` {#${section.id}}`;
                // granularity は documentStructure には不要なので除去
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

    return {
        currentScope, // granularity の解釈が反映されたはず
        sectionStructure,
        documentStructure: documentStructure.trim(),
        sectionListRaw: yaml.dump(sectionListYamlData)
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
    // TODO: currentScope と sectionStructure が YAML 文字列になるように修正 (これは YAML 文字列ではなく Markdown 文字列で正しいはずなので TODO 削除)
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
    await runRepomix();
    const repomixContent = await readFileContent('repomix-output.md', 'Repomix Output', true);
    const templateFileName = `${argv.promptType}-prompt-template.md`;
    const templateFilePath = path.join('temp-documentation-support', templateFileName);
    const templateContent = await readFileContent(templateFilePath, 'Prompt Template');
    const subTaskContent = await readFileContent(path.join('temp-documentation-support', 'sub-task.md'), 'Sub-task Document');
    const microTaskContent = await readFileContent(path.join('temp-documentation-support', 'micro-task.md'), 'Micro-task Document');
    const targetDocContent = await readFileContent(argv.targetDoc, 'Target Document');

    // TEMP: Test granularity
    const sectionListYamlPath = path.join('temp-documentation-support', 'section-list-granularity-test.yaml');
    const sectionListYamlContent = await readFileContent(sectionListYamlPath, 'Section List YAML');
    let sectionListYamlData = null;
    if (sectionListYamlContent) {
        try {
            sectionListYamlData = yaml.load(sectionListYamlContent);
            if (!sectionListYamlData || typeof sectionListYamlData !== 'object') {
                throw new Error('Invalid YAML structure: Root should be an object.');
            }
        } catch (e) {
            console.error(formatError(`Failed to parse ${sectionListYamlPath}`, e));
            process.exit(1);
        }
    } else {
        console.error(`Error: ${sectionListYamlPath} not found or empty.`);
        process.exit(1);
    }

    let plotContent = null;
    if (argv.promptType === 'plot-reviewer') plotContent = await readFileContent(path.join('temp-documentation-support', 'plot.yaml'), 'Plot YAML');
    let draftContent = null;
    if (argv.promptType === 'draft-reviewer' || argv.promptType === 'rewriter') draftContent = await readFileContent(path.join('temp-documentation-support', 'draft.md'), 'Draft Markdown');
    let reviewContent = null;
    if (argv.promptType === 'rewriter') reviewContent = await readFileContent(path.join('temp-documentation-support', 'review.md'), 'Review Markdown');

    const { currentScope, sectionStructure, documentStructure, sectionListRaw } = determineNextScope(sectionListYamlData, targetDocContent);

    if (currentScope === "<!-- No next section identified from YAML -->") {
        console.log("Skipping prompt generation because no next section was identified from YAML.");
        return;
    }

    const generatedPrompt = replacePlaceholders(templateContent, {
      targetDocPath: argv.targetDoc, subTask: subTaskContent, microTask: microTaskContent, repomix: repomixContent,
      plot: plotContent, draft: draftContent, review: reviewContent, targetDoc: targetDocContent,
      currentScope: currentScope, sectionStructure: sectionStructure, documentStructure: documentStructure,
      // sectionListRaw: sectionListRaw,
    });

    const outputFilePath = path.resolve(argv.output);
    await writeFile(outputFilePath, generatedPrompt, 'utf-8');
    console.log(`✅ Prompt successfully generated and saved to: ${outputFilePath}`);

  } catch (error) {
    console.error(formatError('Failed to generate prompt', error));
    process.exit(1);
  }
}

// Check if the script is being run directly using import.meta.url
const isMainScript = process.argv[1] === fileURLToPath(import.meta.url);

if (isMainScript) {
  main();
}