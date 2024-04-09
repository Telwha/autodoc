```mermaid
graph TD
    A[Start] --> B[Load Documents]
    B --> C{Is Directory?}
    C -->|Yes| D[Process Directory]
    C -->|No| E[Process File]
    D --> F[Recurse into Directory]
    F --> G[Read Files in Directory]
    G --> H{Is File?}
    H -->|Yes| E
    H -->|No| F
    E --> I[Create Document Object]
    I --> J[Add Document to Collection]
    J --> K[All Files Processed?]
    K -->|Yes| L[Return Document Collection]
    K -->|No| G
    L --> M[Split Documents into Chunks]
    M --> N[Create Vector Store from Documents]
    N --> O[Save Vector Store]
    O --> P[End]
```

This flowchart represents the process of loading, processing, and vectorizing documents within a directory for the autodoc project. It starts with loading documents, where it checks if the current path is a directory or a file. If it's a directory, it processes each file within, recursing into nested directories as needed. Each file is processed into a Document object, which is then added to a collection. Once all files are processed, the collection of documents is split into chunks. These chunks are then used to create a vector store, which is finally saved to a specified output location.