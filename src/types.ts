import { OpenAIChat } from 'langchain/llms';

export type AutodocUserConfig = {
  llms: LLMModels[];
};

export type AutodocRepoConfig = {
  name: string;
  repositoryUrl: string;
  root: string;
  output: string;
  llms: LLMModels[];
  priority: Priority;
  maxConcurrentCalls: number;
  addQuestions: boolean;
  ignore: string[];
  filePromptMermaid: string;
  folderPromptMermaid: string;
  filePrompt: string;
  folderPrompt: string;
  chatPrompt: string;
  contentType: string;
  targetAudience: string;
  linkHosted: boolean;
};

export type FileSummary = {
  fileName: string;
  filePath: string;
  url: string;
  summary: string;
  questions?: string;
  checksum: string;
};

export type FileSummaryMermaid = {
  fileName: string;
  filePath: string;
  mermaidSummary: string;
  checksum: string;
};

export type ProcessFileParams = {
  fileName: string;
  filePath: string;
  projectName: string;
  contentType: string;
  filePrompt: string;
  filePromptMermaid: string;
  targetAudience: string;
  linkHosted: boolean;
};

export type ProcessFile = (params: ProcessFileParams) => Promise<void>;

export type FolderSummary = {
  folderName: string;
  folderPath: string;
  url: string;
  files: FileSummary[];
  folders: FolderSummary[];
  summary: string;
  questions: string;
  checksum: string;
};

export type FolderSummaryMermaid = {
  folderName: string;
  folderPath: string;
  url: string;
  mermaidSummary: string;
  files: FileSummary[];
  folders: FolderSummary[];
  checksum: string;
};

export type ProcessFolderParams = {
  inputPath: string;
  folderName: string;
  folderPath: string;
  projectName: string;
  contentType: string;
  folderPrompt: string;
  folderPromptMermaid: string;
  targetAudience: string;
  linkHosted: boolean;
  shouldIgnore: (fileName: string) => boolean;
};

export type ProcessFolder = (params: ProcessFolderParams) => Promise<void>;

export type TraverseFileSystemParams = {
  inputPath: string;
  projectName: string;
  processFile?: ProcessFile;
  processFolder?: ProcessFolder;
  ignore: string[];
  filePromptMermaid: string;
  folderPromptMermaid: string;
  filePrompt: string;
  folderPrompt: string;
  contentType: string;
  targetAudience: string;
  linkHosted: boolean;
};

export enum LLMModels {
  GPT3 = 'gpt-3.5-turbo',
  GPT4 = 'gpt-4',
  GPT432k = 'gpt-4-32k',
  GPT4turbo = 'gpt-4-turbo-preview'
}

export type LLMModelDetails = {
  name: LLMModels;
  inputCostPer1KTokens: number;
  outputCostPer1KTokens: number;
  maxLength: number;
  llm: OpenAIChat;
  inputTokens: number;
  outputTokens: number;
  succeeded: number;
  failed: number;
  total: number;
};

export enum Priority {
  COST = 'cost',
  PERFORMANCE = 'performance',
}
