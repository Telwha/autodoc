[View code on GitHub](/blob/master/utils/FileUtil.ts)

```markdown
The provided code snippet from the `autodoc` project includes utility functions designed to streamline the process of managing and linking documentation files, particularly in the context of GitHub repositories. These functions are crucial for automating the generation of documentation and enhancing the accessibility of project files.

### `getFileName` Function

The `getFileName` function is designed to manipulate file names, specifically for converting them into Markdown format or altering their extensions. It accepts an input string representing the file name, an optional delimiter (defaulting to '.'), and an optional extension (defaulting to '.md'). This function is particularly useful for ensuring that documentation files adhere to a consistent naming convention, facilitating their identification and rendering in Markdown viewers.

**Example Usage:**

```javascript
const markdownFileName = getFileName("example", '.', '.md');
// Output: "example.md"
```

### `githubFileUrl` and `githubFolderUrl` Functions

Both `githubFileUrl` and `githubFolderUrl` functions generate URLs for accessing files and folders within a GitHub repository. They are essential for creating hyperlinks in documentation that directly link to source code, examples, or additional resources stored in GitHub. These functions take parameters for the GitHub root URL, the root directory of the input files, the specific file or folder path, and a boolean indicating whether the link should point to the hosted version or the repository itself (blob or tree view).

**Example Usage for `githubFileUrl`:**

```javascript
const fileUrl = githubFileUrl("https://github.com/user/repo", "/docs", "/docs/example.md", false);
// Output: "https://github.com/user/repo/blob/master/docs/example.md"
```

**Example Usage for `githubFolderUrl`:**

```javascript
const folderUrl = githubFolderUrl("https://github.com/user/repo", "/docs", "/docs/resources", true);
// Output: "https://github.com/user/repo/resources"
```

In summary, these functions collectively support the `autodoc` project's goal of automating documentation processes, ensuring consistency in document naming, and facilitating easy access to related files and folders within a GitHub repository.
```

## Questions: 
 ```markdown
### Questions and Answers:

1. **What happens if the `input` string in `getFileName` function does not contain the specified `delimiter`?**
   - If the `input` string does not contain the specified `delimiter`, the function appends the `extension` to the original `input` string and returns it. This is because the function is designed to add the extension to the input if the delimiter is not found.

2. **In the `githubFileUrl` and `githubFolderUrl` functions, why is `substring(inputRoot.length - 1)` used?**
   - The `substring(inputRoot.length - 1)` is used to remove the `inputRoot` part from the `filePath` or `folderPath`, adjusting by one character to account for potential off-by-one errors in path lengths. However, this might raise concerns about its correctness in all scenarios, especially if `inputRoot` is not guaranteed to be a prefix of `filePath` or `folderPath`.

3. **How does the `linkHosted` parameter affect the URLs generated by `githubFileUrl` and `githubFolderUrl` functions?**
   - The `linkHosted` parameter determines whether the generated URL points directly to the hosted file or folder (`true`) or to its GitHub repository location (`false`). If `linkHosted` is `true`, the URL points directly to the resource. If `linkHosted` is `false`, the URL includes `/blob/master/` or `/tree/master/` to point to the repository location of the file or folder, respectively.
```