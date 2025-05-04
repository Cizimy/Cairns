#!/usr/bin/env node

import { readFile, writeFile } from 'fs/promises'; // Use named imports
import path from 'path';
// Remove execSync import
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { remark } from 'remark';
import remarkParse from 'remark-parse';
import { visit } from 'unist-util-visit';
import { toString } from 'mdast-util-to-string'; // Import toString
import { VFile } from 'vfile'; // For tracking position
import grayMatter from 'gray-matter'; // Front Matter 解析用
import { runCli } from 'repomix'; // Import runCli from repomix library

/**
 * エラーメッセージをフォーマットするヘルパー関数
 * @param {string} message - エラーメッセージ
 * @param {Error} [error] - 元のエラーオブジェクト (オプション)
 * @returns {string} フォーマットされたエラーメッセージ
 */
export function formatError(message, error) {
  let formattedMessage = `Error: ${message}`;
  if (error) {
    // Include error details if available
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
 * @param {string} filePath - 読み込むファイルのパス (絶対パスまたは相対パス)
 * @param {string} description - ファイルの説明 (エラーメッセージ用)
 * @param {boolean} [optional=false] - ファイルが存在しなくてもエラーにしないか
 * @returns {Promise<string | null>} ファイルの内容、または optional=true でファイルが存在しない場合は null
 * @throws {Error} ファイルの読み込みに失敗した場合 (optional=false の場合)
 */
export async function readFileContent(filePath, description, optional = false) {
  const absolutePath = path.resolve(filePath);
  try {
    // console.log(`Reading ${description}: ${absolutePath}`); // Log restored (removed DEBUG)
    const content = await readFile(absolutePath, 'utf-8'); // Use imported readFile
    return content;
  } catch (error) {
    // console.error(`Error reading ${description}: ${error.message}`); // Removed DEBUG
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
 * Markdownコンテンツから見出しのリストを抽出する
 * @param {string} content - Markdownコンテンツ
 * @returns {Array<{depth: number, text: string}>} 見出しのリスト
 */
export function extractHeadings(content) {
    if (!content) return [];
    try {
        const tree = remark().use(remarkParse).parse(content);
        const headings = [];
        visit(tree, 'heading', (node) => {
            // Use toString to get the full text content of the heading
            const fullHeadingText = toString(node);
            // Basic trim for now, granularity extraction will happen in parseSectionListStructure
            headings.push({
                depth: node.depth,
                text: fullHeadingText.trim(),
            });
        });
        return headings;
    } catch (error) {
        console.warn(`Warning: Failed to parse markdown content for heading extraction. Returning empty list. Error: ${error.message}`);
        return [];
    }
}

/**
 * section-list.md を解析し、構造情報と執筆粒度を抽出する関数 (新しい {} 形式に対応)
 * @param {string} sectionListContent - section-list.md の内容
 * @returns {Array<{depth: number, text: string, granularity: string | null, startLine: number | undefined, endLine: number | undefined}>}
 */
export function parseSectionListStructure(sectionListContent) {
  if (!sectionListContent) return [];
  const file = new VFile(sectionListContent);
  const tree = remark().use(remarkParse).parse(file);
  const sections = [];

  // Regex to match the new granularity format {###} at the end of the heading text
  // Allows spaces inside the braces.
  // Captures: (1) heading text before the marker, (2) the '#' characters inside the braces
  const granularityRegex = /^(.*?)\s*\{\s*([#]+)\s*\}\s*$/;

  visit(tree, 'heading', (node) => {
    const startLine = node.position?.start?.line;
    // Get the full text content of the heading node using toString
    const fullText = toString(node);
    let headingText = fullText.trim(); // Default to trimmed full text
    let granularity = null;

    // Try to match the new granularity format at the end of the text
    const match = headingText.match(granularityRegex); // Apply regex to the trimmed text
    if (match) {
      headingText = match[1].trim(); // Extract text before the marker
      granularity = match[2];       // Extract the '#' characters
    }
    // If no match, headingText remains the trimmed fullText, and granularity remains null

    // Set endLine for the previous section
    if (sections.length > 0) {
      sections[sections.length - 1].endLine = startLine ? startLine - 1 : undefined;
    }

    sections.push({
      depth: node.depth,
      text: headingText, // Use the extracted or original heading text
      granularity: granularity, // Use the extracted granularity (or null)
      startLine: startLine,
      endLine: undefined, // Will be set later or at the end
    });
  });

  const totalLines = String(file).split('\n').length;

  // Set endLine for the last section
  if (sections.length > 0) {
    sections[sections.length - 1].endLine = totalLines;
  }

  // Fill in missing endLines based on the next section's startLine
  for (let i = 0; i < sections.length - 1; i++) {
      if (sections[i].endLine === undefined && sections[i+1].startLine !== undefined) {
          sections[i].endLine = sections[i+1].startLine - 1;
      }
  }
   // Ensure all sections have an endLine and it's not before startLine
   for (let i = 0; i < sections.length; i++) {
       if (sections[i].endLine === undefined) {
           sections[i].endLine = totalLines;
       }
       // Adjust endLine if it's smaller than startLine (can happen with single-line sections)
       if (sections[i].endLine !== undefined && sections[i].startLine !== undefined && sections[i].endLine < sections[i].startLine) {
           sections[i].endLine = sections[i].startLine;
       }
   }
  return sections;
}


/**
 * section-list.md と targetDocContent を比較し、次に執筆すべき範囲などを決定する
 * @param {string} sectionListContent
 * @param {string} targetDocContent
 * @returns {{ currentScope: string, sectionStructure: string, documentStructure: string, sectionListRaw: string }}
 */
export function determineNextScope(sectionListContent, targetDocContent) {
  // console.log('--- Debug: Entering determineNextScope ---'); // DEBUG LOG removed
  const sectionListStructure = parseSectionListStructure(sectionListContent); // Uses the updated parser
  const targetBodyContent = grayMatter(targetDocContent || '').content;
  // Use the original extractHeadings for the target doc, as it doesn't have the special format
  const targetDocHeadings = extractHeadings(targetBodyContent);
  const targetDocHeadingTexts = new Set(targetDocHeadings.map(h => h.text));
  // console.log('Target Doc Headings Set:', Array.from(targetDocHeadingTexts)); // DEBUG LOG removed

  let nextSection = null;
  let nextSectionIndex = -1;
  for (let i = 0; i < sectionListStructure.length; i++) {
    const section = sectionListStructure[i];
    const sectionText = section.text; // Already cleaned text
    const existsInTarget = targetDocHeadingTexts.has(sectionText);
    // console.log(`Checking section [${i}]: "${sectionText}" (Depth: ${section.depth}) | Exists in target: ${existsInTarget}`); // DEBUG LOG removed
    // Compare using the cleaned section text from the updated parser
    if (!existsInTarget) {
      // console.log(`Found next section: "${sectionText}" at index ${i}`); // DEBUG LOG removed
      nextSection = section;
      nextSectionIndex = i;
      break;
    }
  }

  if (!nextSection || nextSection.startLine === undefined) {
    console.warn('No next section found or section has no line information. Assuming completion or error.');
    // console.log('--- Debug: Exiting determineNextScope (No next section found) ---'); // DEBUG LOG removed
    return {
        currentScope: "<!-- No next section identified or line info missing -->",
        sectionStructure: "<!-- Could not determine section structure -->",
        documentStructure: "<!-- Could not determine document structure -->",
        sectionListRaw: sectionListContent // Return raw content as it might be needed elsewhere
    };
  }

  // console.log(`Next section to write identified: "${nextSection.text}" (Depth: ${nextSection.depth}, Granularity: ${nextSection.granularity})`); // DEBUG LOG removed

  const lines = sectionListContent.split('\n');

  let scopeEndLine = nextSection.endLine;
  // Determine scope based on granularity
  if (nextSection.granularity) {
      const granularityDepth = nextSection.granularity.length; // Granularity depth is the number of '#'
      for (let i = nextSectionIndex + 1; i < sectionListStructure.length; i++) {
          if (sectionListStructure[i].depth <= nextSection.depth || sectionListStructure[i].depth < granularityDepth) {
              scopeEndLine = sectionListStructure[i].startLine ? sectionListStructure[i].startLine - 1 : nextSection.endLine;
              break;
          }
      }
      scopeEndLine = scopeEndLine ?? nextSection.endLine ?? lines.length;

  } else {
       for (let i = nextSectionIndex + 1; i < sectionListStructure.length; i++) {
          if (sectionListStructure[i].depth <= nextSection.depth) {
              scopeEndLine = sectionListStructure[i].startLine ? sectionListStructure[i].startLine - 1 : nextSection.endLine;
              break;
          }
      }
       scopeEndLine = scopeEndLine ?? nextSection.endLine ?? lines.length;
  }

  scopeEndLine = scopeEndLine ?? lines.length;
  const startSlice = nextSection.startLine > 0 ? nextSection.startLine - 1 : 0;
  const endSlice = Math.min(scopeEndLine, lines.length);

  // Reconstruct the scope lines using the *original* section list content lines
  // We need to handle the case where the original line had the {granularity} marker
  const currentScopeLines = [];
  // Regex to remove marker *including internal spaces*
  const scopeRegex = /\s*\{\s*[#]+\s*\}\s*$/;
  for (let i = startSlice; i < endSlice; i++) {
      // Remove the marker from the line if it exists for the scope output
      currentScopeLines.push(lines[i].replace(scopeRegex, '').trimEnd());
  }
  const currentScope = currentScopeLines.join('\n');


  // Determine the parent section (# level) structure
  let parentSectionStartLine = 1;
  let parentSectionEndLine = sectionListStructure[sectionListStructure.length - 1]?.endLine ?? lines.length;
  let parentDepth1Index = -1;
   for (let i = nextSectionIndex; i >= 0; i--) {
       if (sectionListStructure[i].depth === 1) {
           parentSectionStartLine = sectionListStructure[i].startLine;
           parentDepth1Index = i;
           break;
       }
   }
   if (parentDepth1Index !== -1 && sectionListStructure[parentDepth1Index]) {
        parentSectionStartLine = sectionListStructure[parentDepth1Index].startLine ?? 1;
        for (let i = parentDepth1Index + 1; i < sectionListStructure.length; i++) {
            if (sectionListStructure[i].depth === 1) {
                parentSectionEndLine = sectionListStructure[i].startLine ? sectionListStructure[i].startLine - 1 : parentSectionEndLine;
                break;
            }
        }
        parentSectionEndLine = parentSectionEndLine ?? sectionListStructure[parentDepth1Index].endLine ?? lines.length;
   } else {
       parentSectionStartLine = 1;
       parentSectionEndLine = lines.length;
   }
   parentSectionStartLine = parentSectionStartLine ?? 1;
   parentSectionEndLine = parentSectionEndLine ?? lines.length;
   // FIX: Use parentSectionStartLine instead of parentStartSlice on the right side
   const parentStartSlice = parentSectionStartLine > 0 ? parentSectionStartLine - 1 : 0;
   const parentEndSlice = Math.min(parentSectionEndLine, lines.length);

   // Reconstruct parent structure lines, removing markers
   const sectionStructureLines = [];
    for (let i = parentStartSlice; i < parentEndSlice; i++) {
        sectionStructureLines.push(lines[i].replace(scopeRegex, '').trimEnd());
    }
   const sectionStructure = sectionStructureLines.join('\n');


  // Generate document structure up to H2 level using cleaned text
  const documentStructureLines = [];
  for (const section of sectionListStructure) {
      if (section.depth <= 2) {
          documentStructureLines.push(`${'#'.repeat(section.depth)} ${section.text}`); // Already cleaned text
      }
  }
  const documentStructure = documentStructureLines.join('\n');

  // console.log('--- Debug: Exiting determineNextScope (Found next section) ---'); // DEBUG LOG removed
  return { currentScope, sectionStructure, documentStructure, sectionListRaw: sectionListContent };
}

/**
 * テンプレート内のプレースホルダー {{VARIABLE_NAME}} を置換する関数
 * @param {string} templateContent - テンプレート文字列
 * @param {object} data - 置換用データオブジェクト
 * @returns {string} 置換後の文字列
 */
export function replacePlaceholders(templateContent, data) {
    let result = templateContent;

    // Replace placeholders using the new {{VARIABLE_NAME}} format
    // Use a function as the second argument to replace() to prevent
    // special replacement patterns (like $&) in the data from being interpreted.
    result = result.replace(/\{\{\s*TARGET_DOC_PATH\s*\}\}/g, () => data.targetDocPath || '');
    result = result.replace(/\{\{\s*SUB_TASK\s*\}\}/g, () => data.subTask || '');
    result = result.replace(/\{\{\s*MICRO_TASK\s*\}\}/g, () => data.microTask || '');
    result = result.replace(/\{\{\s*PLOT_YAML\s*\}\}/g, () => data.plot ?? ''); // Use ?? for nullish coalescing
    result = result.replace(/\{\{\s*DRAFT_MD\s*\}\}/g, () => data.draft ?? ''); // Use ?? for nullish coalescing
    // Add REVIEW_MD replacement
    result = result.replace(/\{\{\s*REVIEW_MD\s*\}\}/g, () => data.review ?? ''); // Use ?? for nullish coalescing
    // Re-add REPOMIX_OUTPUT replacement
    result = result.replace(/\{\{\s*REPOMIX_OUTPUT\s*\}\}/g, () => data.repomix ?? '<!-- repomix-output.md not found or empty -->');
    result = result.replace(/\{\{\s*TARGET_DOC_FULL\s*\}\}/g, () => data.targetDoc || '');
    result = result.replace(/\{\{\s*CURRENT_SCOPE\s*\}\}/g, () => data.currentScope || '');
    result = result.replace(/\{\{\s*SECTION_STRUCTURE\s*\}\}/g, () => data.sectionStructure || '');
    result = result.replace(/\{\{\s*DOC_STRUCTURE\s*\}\}/g, () => data.documentStructure || '');

    // Removed the potentially noisy warning check for remaining placeholders

    return result;
}

// Removed Default Repomix Configuration section

/**
 * repomix コマンドを実行して repomix-output.md を更新する関数 (ライブラリ使用・ルート設定ファイル自動読み込み版)
 */
async function runRepomix() {
  // Removed config reading and option building logic

  console.log(`🔄 Running repomix via library using root config to update repomix-output.md...`);

  try {
    // Use runCli from the library, relying on it to find root config files
    // Pass empty options object, repomix should pick up config from repomix.config.json
    // Pass quiet: false to see repomix output
    await runCli(['.'], process.cwd(), { quiet: false });

    // Assume success if runCli completes without throwing an error
    console.log(`✅ repomix command finished running via library.`);
    // Output path is now determined by repomix.config.json
    console.log(`   Output should be saved based on root repomix.config.json settings.`);

  } catch (error) {
    // Catch errors during runCli execution
    console.error(formatError('Failed to execute repomix via library', error));
    console.warn('Continuing prompt generation despite repomix execution error.');
  }
}


/**
 * メイン処理
 */
export async function main() {
  // console.log('--- Debug: Entering main function ---'); // DEBUG LOG removed
  const argv = await yargs(hideBin(process.argv))
    .usage('Usage: $0 --target-doc <path> --prompt-type <type> --output <path>')
    .option('target-doc', {
      alias: 't',
      description: '執筆対象のドキュメントファイルパス',
      type: 'string',
      demandOption: true,
    })
    .option('prompt-type', {
      alias: 'p',
      description: '生成するプロンプトの種類',
      type: 'string',
      choices: ['writer', 'plot-reviewer', 'draft-reviewer', 'rewriter'], // Add 'rewriter'
      demandOption: true,
    })
    .option('output', {
      alias: 'o',
      description: '生成されたプロンプトの出力先ファイルパス',
      type: 'string',
      demandOption: true,
    })
    .help()
    .alias('help', 'h')
    .strict()
    .argv;

  // console.log('--- Debug: Parsed arguments ---', argv); // DEBUG LOG removed

  try {
    // --- Run Repomix First ---
    // runRepomix might log errors but won't throw to stop the main process
    await runRepomix();
    // --- Repomix execution finished (or failed silently) ---

    // --- Read Repomix Output (Optional) ---
    const repomixContent = await readFileContent('repomix-output.md', 'Repomix Output', true); // optional=true

    // console.log('--- Debug: Reading template file ---'); // DEBUG LOG removed
    const templateFileName = `${argv.promptType}-prompt-template.md`;
    const templateFilePath = path.join('temp-documentation-support', templateFileName);
    const templateContent = await readFileContent(templateFilePath, 'Prompt Template');
    // console.log('--- Debug: Template file read successfully ---'); // DEBUG LOG removed

    // console.log('--- Debug: Reading supporting documents ---'); // DEBUG LOG removed
    const subTaskContent = await readFileContent(path.join('temp-documentation-support', 'sub-task.md'), 'Sub-task Document');
    const microTaskContent = await readFileContent(path.join('temp-documentation-support', 'micro-task.md'), 'Micro-task Document');
    const targetDocContent = await readFileContent(argv.targetDoc, 'Target Document');
    const sectionListContent = await readFileContent(path.join('temp-documentation-support', 'section-list.md'), 'Section List');
    // console.log('--- Debug: Supporting documents read ---'); // DEBUG LOG removed

    let plotContent = null;
    if (argv.promptType === 'plot-reviewer') {
      // console.log('--- Debug: Reading plot file ---'); // DEBUG LOG removed
      plotContent = await readFileContent(path.join('temp-documentation-support', 'plot.yaml'), 'Plot YAML');
    }
    let draftContent = null;
    // Read draft if type is draft-reviewer OR rewriter
    if (argv.promptType === 'draft-reviewer' || argv.promptType === 'rewriter') {
      // console.log('--- Debug: Reading draft file ---'); // DEBUG LOG removed
      draftContent = await readFileContent(path.join('temp-documentation-support', 'draft.md'), 'Draft Markdown');
    }
    let reviewContent = null; // Initialize reviewContent
    // Read review if type is rewriter
    if (argv.promptType === 'rewriter') {
        // console.log('--- Debug: Reading review file ---'); // DEBUG LOG removed
        reviewContent = await readFileContent(path.join('temp-documentation-support', 'review.md'), 'Review Markdown');
    }

    // console.log('--- Debug: Calling determineNextScope ---'); // DEBUG LOG removed
    // Pass the raw section list content to determineNextScope
    const { currentScope, sectionStructure, documentStructure } = determineNextScope(sectionListContent, targetDocContent);
    // console.log('--- Debug: Returned from determineNextScope ---'); // DEBUG LOG removed

    // Check if determineNextScope returned the "No next section" marker
    if (currentScope === "<!-- No next section identified or line info missing -->") {
        console.log("Skipping prompt generation because no next section was identified."); // Informative log
        // console.log('--- Debug: Exiting main function (No next section) ---'); // DEBUG LOG removed
        return; // Exit main function early, preventing writeFile
    }

    // console.log('--- Debug: Calling replacePlaceholders ---'); // DEBUG LOG removed
    const generatedPrompt = replacePlaceholders(templateContent, {
      targetDocPath: argv.targetDoc,
      subTask: subTaskContent,
      microTask: microTaskContent,
      repomix: repomixContent, // Pass repomix content
      plot: plotContent,
      draft: draftContent,
      review: reviewContent, // Pass review content
      targetDoc: targetDocContent,
      currentScope: currentScope, // Already cleaned
      sectionStructure: sectionStructure, // Already cleaned
      documentStructure: documentStructure, // Already cleaned
      // sectionListRaw is not needed here as it's handled within determineNextScope
    });
    // console.log('--- Debug: Returned from replacePlaceholders ---'); // DEBUG LOG removed

    const outputFilePath = path.resolve(argv.output);
    // console.log(`--- Debug: Writing prompt to ${outputFilePath} ---`); // DEBUG LOG removed
    await writeFile(outputFilePath, generatedPrompt, 'utf-8'); // Use imported writeFile
    console.log(`✅ Prompt successfully generated and saved to: ${outputFilePath}`);
    // console.log('--- Debug: Exiting main function (Success) ---'); // DEBUG LOG removed

  } catch (error) {
    // Catch errors from parts of main *other* than runRepomix
    console.error(formatError('Failed to generate prompt', error));
    // console.log('--- Debug: Exiting main function (Error) ---'); // DEBUG LOG removed
    process.exit(1); // Ensure exit with error code
  }
}

// Execute main function unconditionally
main();