import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'node:fs';
import path from 'node:path';
import { AutodocRepoConfig, LLMModels, Priority } from '../../../types.js';

export const makeConfigTemplate = (
  config?: AutodocRepoConfig,
): AutodocRepoConfig => {
  return {
    name: config?.name ?? '',
    repositoryUrl: config?.repositoryUrl ?? '',
    root: '.',
    output: './.docy',
    llms: [LLMModels.GPT3],
    priority: Priority.PERFORMANCE,
    maxConcurrentCalls: 25,
    addQuestions: false,
    ignore: [
      '.*',
      '*package-lock.json',
      '*package.json',
      'node_modules',
      '*dist*',
      '*build*',
      '*test*',
      '*.svg',
      '*.md',
      '*.mdx',
      '*.toml',
      '*autodoc*',
      '*docy*',
      '*requirements.txt',
    ],
    include: [],
    filePromptMermaid:
      'Write a mermaid markdown code with shapes that illustrates the steps of what this code does. \n\
      Focus on the low-level purpose of the code and how it may be used in the larger project.\n\
      Do not just list the methods and classes in this file. \n\
      Output should be in markdown format.\n\
      DO NOT WRITE ANY FILE SUMMARY.\n\
      The output should only contain the mermaid markdown.\n\
      Do not use any colours in the mermaid markdown.\n\
      If there is a name that is containing special characters that would lead to conflicts in the mermaid representation, remove those special characters\n\
      MAKE SURE THAT THE GENERATED MERMAID MARKDOWN IS SYNTACTICALLY CORRECT',
    folderPromptMermaid:
      'Write a mermaid markdown code with shapes that illustrates the steps of what the code in this folder does\n\
      and how it might fit into the larger project or work with other parts of the project.\n\
      DO NOT WRITE ANY FILE SUMMARY.\n\
      Do not just list the files and folders in this folder.\n\
      The output should only contain the mermaid markdown.\n\
      Do not use any colours in the mermaid markdown.\n\
      If there is a name that is containing special characters that would lead to conflicts in the mermaid representation, remove those special characters\n\
      MAKE SURE THAT THE GENERATED MERMAID MARKDOWN IS SYNTACTICALLY CORRECT',
    filePrompt:
      'Write a detailed technical explanation of what this code does. \n\
      Focus on the high-level purpose of the code and how it may be used in the larger project.\n\
      Include code examples where appropriate. Keep you response between 100 and 300 words. \n\
      DO NOT RETURN MORE THAN 300 WORDS.\n\
      Output should be in markdown format.\n\
      Do not just list the methods and classes in this file.',
    folderPrompt:
      'Write a technical explanation of what the code in this folder does\n\
      and how it might fit into the larger project or work with other parts of the project.\n\
      Give examples of how this code might be used. Include code examples where appropriate.\n\
      Be concise. Include any information that may be relevant to a developer who is curious about this code.\n\
      Keep you response under 400 words. Output should be in markdown format.\n\
      Do not just list the files and folders in this folder.',
    chatPrompt: '',
    contentType: 'code',
    targetAudience: 'smart developer',
    linkHosted: false,
  };
};

export const init = async (
  config: AutodocRepoConfig = makeConfigTemplate(),
) => {
  const configPath = path.join(config.root, 'docy.config.json');

  if (fs.existsSync(configPath)) {
    const questions = [
      {
        type: 'confirm',
        name: 'continue',
        message:
          'A docy.config.json file already exists in this location. The existing configuration will be overwritten. Do you want to continue? ',
        default: false,
      },
    ];

    const answers = await inquirer.prompt(questions);
    if (!answers.continue) {
      process.exit(0);
    }
  }

  const questions = [
    {
      type: 'input',
      name: 'name',
      message: chalk.yellow(`Enter the name of your repository:`),
      default: config.name,
    },
    {
      type: 'input',
      name: 'include',
      message: chalk.yellow(`Do you want to run it on certain file types? Enter space separated file types, e.g., '.py', '.java' Leave blank otherwise.`),
      default: config.include,
    },
  ];

  const { name, include } =
    await inquirer.prompt(questions);

  const newConfig = makeConfigTemplate({
    ...config,
    name,
    include,
  });

  fs.writeFileSync(
    path.join(newConfig.root, 'docy.config.json'),
    JSON.stringify(newConfig, null, 2),
    'utf-8',
  );

  console.log(
    chalk.green('Docy initialized. Run `docy index` to get started.'),
  );
};
