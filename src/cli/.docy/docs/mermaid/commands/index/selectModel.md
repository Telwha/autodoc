```mermaid
graph TD
    A[Start: selectModel Function] --> B{Check Priority}
    B -->|COST| C[Check for GPT3 Model]
    B -->|OTHER| D[Check for GPT4 Model]
    C -->|Exists| E{Check GPT3 Max Length}
    C -->|Does Not Exist| F[Check for GPT4 Model]
    E -->|Sufficient| G[Return GPT3 Model Details]
    E -->|Insufficient| F
    F -->|Exists| H{Check GPT4 Max Length}
    F -->|Does Not Exist| I[Check for GPT432k Model]
    H -->|Sufficient| J[Return GPT4 Model Details]
    H -->|Insufficient| I
    I -->|Exists| K{Check GPT432k Max Length}
    I -->|Does Not Exist| L[Return null]
    K -->|Sufficient| M[Return GPT432k Model Details]
    K -->|Insufficient| L
    D -->|Exists| N{Check GPT4 Max Length on Other Priority}
    D -->|Does Not Exist| O[Return GPT4turbo Model Details]
    N -->|Sufficient| P[Return GPT4 Model Details on Other Priority]
    N -->|Insufficient| Q[Check for GPT432k Model on Other Priority]
    Q -->|Exists| R{Check GPT432k Max Length on Other Priority}
    Q -->|Does Not Exist| S[Return null on Other Priority]
    R -->|Sufficient| T[Return GPT432k Model Details on Other Priority]
    R -->|Insufficient| S

    subgraph getMaxPromptLength
        direction TB
        AA[Start: getMaxPromptLength Function] --> BB{Encode Prompts}
        BB --> CC[Return Max Prompt Length]
    end

    E --> AA
    H --> AA
    K --> AA
    N --> AA
    R --> AA
```
This mermaid diagram illustrates the flow of the `selectModel` function, detailing how it decides which model to return based on priority and the sufficiency of the model's maximum length compared to the encoded prompt lengths. The `getMaxPromptLength` function is represented as a subgraph to show its role in calculating the maximum length of the encoded prompts, which is a crucial step in the decision-making process of the `selectModel` function.