import fs from 'node:fs/promises';
import path from 'node:path';
import { Md5 } from 'ts-md5';
import { OpenAIChat } from 'langchain/llms';
import { encoding_for_model } from '@dqbd/tiktoken';
import { APIRateLimit } from '../../utils/APIRateLimit.js';
import { ChatOllama } from "@langchain/community/chat_models/ollama";

import {
  createCodeFileSummary,
  createCodeQuestions,
  folderSummaryPrompt,
  mermaidFolderSummaryPrompt,
} from './prompts.js';
import {
  AutodocRepoConfig,
  FileSummary,
  FolderSummary,
  FolderSummaryMermaid,
  FileSummaryMermaid,
  LLMModelDetails,
  LLMModels,
  ProcessFile,
  ProcessFolder,
} from '../../../types.js';
import { traverseFileSystem } from '../../utils/traverseFileSystem.js';
import {
  spinnerSuccess,
  stopSpinner,
  updateSpinnerText,
} from '../../spinner.js';
import {
  getFileName,
  githubFileUrl,
  githubFolderUrl,
} from '../../utils/FileUtil.js';
import { models } from '../../utils/LLMUtil.js';
import { selectModel } from './selectModel.js';

export const processRepository = async (
  {
    name: projectName,
    repositoryUrl,
    root: inputRoot,
    output: outputRoot,
    llms,
    priority,
    maxConcurrentCalls,
    addQuestions,
    ignore,
    filePromptMermaid,
    folderPromptMermaid,
    filePrompt,
    folderPrompt,
    contentType,
    targetAudience,
    linkHosted,
  }: AutodocRepoConfig,
  dryRun?: boolean,
) => {
  const rateLimit = new APIRateLimit(maxConcurrentCalls);

  const ollamaLlm = new ChatOllama({
    baseUrl: "http://localhost:11434", // Default value
    model: "wizardcoder:13b-python", // Default value
  });

  const callLLM = async (
    prompt: string,
    model: OpenAIChat,
  ): Promise<string> => {
    return (await ollamaLlm.invoke(prompt)).content as string;
  };

  const isModel = (model: LLMModelDetails | null): model is LLMModelDetails =>
    model !== null;

  const processFile: ProcessFile = async ({
    fileName,
    filePath,
    projectName,
    contentType,
    filePromptMermaid,
    filePrompt,
    targetAudience,
    linkHosted,
  }): Promise<void> => {
    const content = await fs.readFile(filePath, 'utf-8');

    /**
     * Calculate the checksum of the file content
     */
    const newChecksum = await calculateChecksum([content]);

    /**
     * if an existing .json file exists,
     * it will check the checksums and decide if a reindex is needed
     */
    const reindex = await shouldReindex(
      path.join(outputRoot, filePath.substring(0, filePath.lastIndexOf('\\'))),
      fileName.replace(/\.[^/.]+$/, '.json'),
      newChecksum,
    );
    if (!reindex) {
      return;
    }

    const markdownFilePath = path.join(outputRoot, filePath);
    const mermaidFilePath = markdownFilePath.replace('json', 'mermaid-json');
    
    const url = githubFileUrl(repositoryUrl, inputRoot, filePath, linkHosted);

    const mermaidFileSummaryPrompt = createCodeFileSummary(
      projectName,
      projectName,
      content,
      contentType,
      filePromptMermaid,
    );
    const summaryPrompt = createCodeFileSummary(
      projectName,
      projectName,
      content,
      contentType,
      filePrompt,
    );
    const questionsPrompt = createCodeQuestions(
      projectName,
      projectName,
      content,
      contentType,
      targetAudience,
    );

    const prompts = addQuestions
      ? [summaryPrompt, questionsPrompt]
      : [summaryPrompt];

    const model = selectModel(prompts, llms, models, priority);

    if (!isModel(model)) {
      // console.log(`Skipped ${filePath} | Length ${max}`);
      return;
    }

    const encoding = encoding_for_model(model.name);
    const summaryLength = encoding.encode(summaryPrompt).length;
    const mermaidSummaryLength = encoding.encode(mermaidFileSummaryPrompt).length;
    const questionLength = encoding.encode(questionsPrompt).length;

    try {
      if (!dryRun) {
        /** Call LLM */
        const response = await Promise.all(
          prompts.map(async (prompt) => callLLM(prompt, model.llm)),
        );

        /**
         * Create file and save to disk
         */
        const file: FileSummary = {
          fileName,
          filePath,
          url,
          summary: response[0],
          questions: addQuestions ? response[1] : '',
          checksum: newChecksum,
        };

        const mresponse = await Promise.all(
          [mermaidFileSummaryPrompt].map(async (prompt) => callLLM(prompt, model.llm)),
        );
        const mermaidFile: FileSummaryMermaid = {
          fileName,
          filePath,
          mermaidSummary: mresponse[0],
          checksum: newChecksum,
        }

        const mermaidOutPath = getFileName(mermaidFilePath, '.', '.json');
        const mcontent = mermaidFile.mermaidSummary.length > 0 ? JSON.stringify(mermaidFile, null, 2) : '';

        const outputPath = getFileName(markdownFilePath, '.', '.json');
        const content =
          file.summary.length > 0 ? JSON.stringify(file, null, 2) : '';

        /**
         * Create the output directory if it doesn't exist
         */
        try {
          await fs.mkdir(markdownFilePath.replace(fileName, ''), {
            recursive: true,
          });
          await fs.writeFile(outputPath, content, 'utf-8');
        } catch (error) {
          console.error(error);
          return;
        }

        try {
          await fs.mkdir(mermaidFilePath.replace(fileName, ''), {
            recursive: true,
          });
          await fs.writeFile(mermaidOutPath, mcontent, 'utf-8');
        } catch (error) {
          console.error(error);
          return;
        }

        // console.log(`File: ${fileName} => ${outputPath}`);
      }

      /**
       * Track usage for end of run summary
       */
      model.inputTokens += summaryLength;
      model.inputTokens += mermaidSummaryLength;
      if (addQuestions) model.inputTokens += questionLength;
      model.total++;
      model.outputTokens += 2000;
      model.succeeded++;
    } catch (e) {
      console.log(e);
      console.error(`Failed to get summary for file ${fileName}`);
      model.failed++;
    }
  };

  const processFolder: ProcessFolder = async ({
    folderName,
    folderPath,
    projectName,
    contentType,
    folderPrompt,
    folderPromptMermaid,
    shouldIgnore,
    linkHosted,
  }): Promise<void> => {
    /**
     * For now we don't care about folders
     *
     * TODO: Add support for folders during estimation
     */
    if (dryRun) return;

    const contents = (await fs.readdir(folderPath)).filter(
      (fileName) => !shouldIgnore(fileName),
    );

    /**
     * Get the checksum of the folder
     */
    const newChecksum = await calculateChecksum(contents);

    /**
     * If an existing summary.json file exists,
     * it will check the checksums and decide if a reindex is needed
     */
    const reindex = await shouldReindex(
      folderPath,
      'summary.json',
      newChecksum,
    );
    if (!reindex) {
      return;
    }

    // eslint-disable-next-line prettier/prettier
    const url = githubFolderUrl(
      repositoryUrl,
      inputRoot,
      folderPath,
      linkHosted,
    );
    const allFiles: (FileSummary | null)[] = await Promise.all(
      contents.map(async (fileName) => {
        const entryPath = path.join(folderPath, fileName);
        const entryStats = await fs.stat(entryPath);

        if (entryStats.isFile() && fileName !== 'summary.json') {
          const file = await fs.readFile(entryPath, 'utf8');
          return file.length > 0 ? JSON.parse(file) : null;
        }

        return null;
      }),
    );

    try {
      const files = allFiles.filter(
        (file): file is FileSummary => file !== null,
      );
      const allFolders: (FolderSummary | null)[] = await Promise.all(
        contents.map(async (fileName) => {
          const entryPath = path.join(folderPath, fileName);
          const entryStats = await fs.stat(entryPath);

          if (entryStats.isDirectory()) {
            try {
              const summaryFilePath = path.resolve(entryPath, 'summary.json');
              const file = await fs.readFile(summaryFilePath, 'utf8');
              return JSON.parse(file);
            } catch (e) {
              console.log(`Skipped: ${folderPath}`);
              return null;
            }
          }

          return null;
        }),
      );

      const folders = allFolders.filter(
        (folder): folder is FolderSummary => folder !== null,
      );

      const summaryPrompt = folderSummaryPrompt(
        folderPath,
        projectName,
        files,
        folders,
        contentType,
        folderPrompt,
      );
      const mermaidSummaryPrompt = mermaidFolderSummaryPrompt(
        folderPath,
        projectName,
        files,
        folders,
        contentType,
        folderPromptMermaid,
      );

      const model = selectModel([summaryPrompt, mermaidSummaryPrompt], llms, models, priority);

      if (!isModel(model)) {
        // console.log(`Skipped ${filePath} | Length ${max}`);
        return;
      }

      const mermaidSummary = await callLLM(mermaidSummaryPrompt, model.llm);
      const summary = await callLLM(summaryPrompt, model.llm);

      const folderSummary: FolderSummary = {
        folderName,
        folderPath,
        url,
        files,
        folders: folders.filter(Boolean),
        summary,
        questions: '',
        checksum: newChecksum,
      };

      const folderSummaryMermaid: FolderSummaryMermaid = {
        folderName,
        folderPath,
        url,
        files,
        folders: folders.filter(Boolean),
        mermaidSummary,
        checksum: newChecksum,
      };

      const outputPath = path.join(folderPath, 'summary.json');
      await fs.writeFile(
        outputPath,
        JSON.stringify(folderSummary, null, 2),
        'utf-8',
      );

      const mermaidSPath = folderPath.replace('json', 'mermaid-json')
      const outputPathMermaid = path.join(mermaidSPath, 'summary.json');
      await fs.writeFile(
        outputPathMermaid,
        JSON.stringify(folderSummaryMermaid, null, 2),
        'utf-8',
      );

      // console.log(`Folder: ${folderName} => ${outputPath}`);
    } catch (e) {
      console.log(e);
      console.log(`Failed to get summary for folder: ${folderPath}`);
    }
  };

  /**
   * Get the number of files and folders in the project
   */

  const filesAndFolders = async (): Promise<{
    files: number;
    folders: number;
  }> => {
    let files = 0;
    let folders = 0;

    await Promise.all([
      traverseFileSystem({
        inputPath: inputRoot,
        projectName,
        processFile: () => {
          files++;
          return Promise.resolve();
        },
        ignore,
        filePromptMermaid,
        filePrompt,
        folderPromptMermaid,
        folderPrompt,
        contentType,
        targetAudience,
        linkHosted,
      }),
      traverseFileSystem({
        inputPath: inputRoot,
        projectName,
        processFolder: () => {
          folders++;
          return Promise.resolve();
        },
        ignore,
        filePromptMermaid,
        filePrompt,
        folderPromptMermaid,
        folderPrompt,
        contentType,
        targetAudience,
        linkHosted,
      }),
    ]);

    return {
      files,
      folders,
    };
  };

  const { files, folders } = await filesAndFolders();

  /**
   * Create markdown files for each code file in the project
   */

  updateSpinnerText(`Processing ${files} files...`);
  await traverseFileSystem({
    inputPath: inputRoot,
    projectName,
    processFile,
    ignore,
    filePromptMermaid,
    filePrompt,
    folderPromptMermaid,
    folderPrompt,
    contentType,
    targetAudience,
    linkHosted,
  });
  spinnerSuccess(`Processing ${files} files...`);

  /**
   * Create markdown summaries for each folder in the project
   */
  updateSpinnerText(`Processing ${folders} folders... `);
  await traverseFileSystem({
    inputPath: outputRoot,
    projectName,
    processFolder,
    ignore,
    filePromptMermaid,
    filePrompt,
    folderPromptMermaid,
    folderPrompt,
    contentType,
    targetAudience,
    linkHosted,
  });
  spinnerSuccess(`Processing ${folders} folders... `);
  stopSpinner();

  /**
   * Print results
   */
  return models;
};

/**
 * Calculates the checksum of all the files in a folder
 */
async function calculateChecksum(contents: string[]): Promise<string> {
  const checksums: string[] = [];
  for (const content of contents) {
    const checksum = Md5.hashStr(content);
    checksums.push(checksum);
  }
  const concatenatedChecksum = checksums.join('');
  const finalChecksum = Md5.hashStr(concatenatedChecksum);
  return finalChecksum;
}

/**
 * Checks if a summary.json file exists.
 * If it does, compares the checksums to see if it
 * needs to be re-indexed or not.
 */

async function shouldReindex(
  contentPath: string,
  name: string,
  newChecksum: string,
): Promise<boolean> {
  const jsonPath = path.join(contentPath, name);

  let summaryExists = false;
  try {
    await fs.access(jsonPath);
    summaryExists = true;
  } catch (error) {}

  if (summaryExists) {
    const fileContents = await fs.readFile(jsonPath, 'utf8');
    const fileContentsJSON = JSON.parse(fileContents);

    const oldChecksum = fileContentsJSON.checksum;

    if (oldChecksum === newChecksum) {
      console.log(`Skipping ${jsonPath} because it has not changed`);
      return false;
    } else {
      console.log(`Reindexing ${jsonPath} because it has changed`);
      return true;
    }
  }
  //if no summary then generate one
  return true;
}
