```mermaid
graph TD
    A[Start] --> B[Clear Screen and Move Cursor to Top]
    B --> C[Display Welcome Message]
    C --> D[Get Question from User]
    D --> E{Question is 'exit'}
    E -- Yes --> F[End]
    E -- No --> G[Update Spinner Text to 'Thinking...']
    G --> H[Call Chat Chain with Question]
    H --> I[Add Question and Response to Chat History]
    I --> J[Display Response as Markdown]
    J --> D
    H --> K[Error Handling]
    K --> D
```
This flowchart represents the steps taken by the code to interact with the user, process their questions, and display responses. The process starts with clearing the screen and displaying a welcome message. It then enters a loop where it prompts the user for a question, processes the question through a chat chain, and displays the response in markdown format. If an error occurs during the processing of the question, it is handled gracefully, and the user is prompted again. The loop continues until the user types 'exit'.