export interface CompileInput {
    language: "Aspect"
    settings?: {
        outputSelection: any
        optimizer: any
        evmVersion: string
        metadata: any
        libraries: any
        remappings: any
        metadataHash: string
    }
    sources: {
        [key: string]: CompileSource
    }
}

export interface CompileSource {
    content: string
}
