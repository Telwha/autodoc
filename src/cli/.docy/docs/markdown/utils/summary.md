[View code on GitHub](/tree/master/.docy/docs/json/utils)

The `.docy/docs/json/utils` directory contains a collection of TypeScript and JavaScript utility modules designed to enhance the functionality and efficiency of operations related to API rate limiting, file management, interaction with Large Language Models (LLMs), and asynchronous utility functions. These utilities are crucial for managing external API interactions, automating documentation processes, and handling file system traversal and timing operations within a broader system.

### API Rate Limiting

The `APIRateLimit.ts` module provides a class for managing API call execution within specified rate limits. It's essential for applications that interact with external APIs having strict rate limits. By controlling concurrency and queuing excess calls, it ensures compliance with API usage policies, preventing throttling or bans.

```typescript
const apiLimiter = new APIRateLimit(20);
// Use apiLimiter.callApi() to manage API calls
```

### File Management

The `FileUtil.ts` module offers functions for manipulating file names and generating GitHub URLs for files and folders. This is particularly useful for linking to source code or documentation stored in GitHub repositories directly from within documentation files, ensuring consistency and accessibility.

```javascript
const fileUrl = githubFileUrl("https://github.com/user/repo", "/docs", "/example.md", false);
```

### Large Language Models (LLMs) Interaction

`LLMUtil.ts` is designed for managing interactions with various GPT models, focusing on cost management and token tracking. It allows for easy configuration and usage tracking of different LLMs, aiding in budgeting and operational oversight for projects utilizing these models.

```javascript
const totalCost = totalIndexCostEstimate([models[LLMModels.GPT3], models[LLMModels.GPT4]]);
```

### Asynchronous Utilities

The `WaitUtil.ts` module provides asynchronous functions for introducing delays (`wait`) and polling for conditions (`forTrue`). These utilities are useful in testing, synchronization tasks, or when certain conditions must be met before proceeding.

```javascript
await wait(1000); // Delay for 1 second
await forTrue(() => condition);
```

### File System Traversal

`traverseFileSystem.ts` enables recursive traversal of the file system, processing files and folders based on user-defined criteria. It's a key component for automating documentation generation or performing file system operations, supporting customizable workflows.

```javascript
traverseFileSystem({
  inputPath: './myProject',
  ignore: ['node_modules/**'],
  processFile: async ({ fileName }) => {/* ... */},
});
```

Collectively, these utilities support a wide range of operations from API management, documentation automation, to file system manipulation, making them integral to projects requiring these functionalities.
