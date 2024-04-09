```mermaid
flowchart TB
    start((Start)) --> checkConfig{Check Config Exists}
    checkConfig -- Yes --> promptOverwrite{Prompt Overwrite?}
    checkConfig -- No --> createDir(Create Directories)
    promptOverwrite -- No --> end((End))
    promptOverwrite -- Yes --> selectLLMs(Prompt: Select LLMs)
    createDir --> selectLLMs
    selectLLMs --> makeConfig[Make Config Template]
    makeConfig --> saveConfig(Save Configuration)
    saveConfig --> end

    style start fill:#f9f,stroke:#333,stroke-width:4px
    style end fill:#f9f,stroke:#333,stroke-width:4px
    style checkConfig fill:#bbf,stroke:#333,stroke-width:2px
    style promptOverwrite fill:#bbf,stroke:#333,stroke-width:2px
    style createDir fill:#bbf,stroke:#333,stroke-width:2px
    style selectLLMs fill:#bbf,stroke:#333,stroke-width:2px
    style makeConfig fill:#bbf,stroke:#333,stroke-width:2px
    style saveConfig fill:#bbf,stroke:#333,stroke-width:2px

    classDef operation fill:#bbf,stroke:#333,stroke-width:2px;
    classDef startend fill:#f9f,stroke:#333,stroke-width:4px;

    %% Link to other parts of the project (Hypothetical connections)
    saveConfig --> configUsage[Use Config in Project]
    configUsage --> docGeneration{Documentation Generation}
    docGeneration --> output((Output: Automated Docs))

    class docGeneration,configUsage operation;
    class output startend;
```