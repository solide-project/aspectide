import { GithubResolver } from "@resolver-engine/imports/build/resolvers/githubresolver"

import { ContractPaths, ContractDependency } from "@/lib/core"
import { GITHUBUSERCONTENT_REGEX, resolve } from "./utils"

/**
 * Main function to get the solidity contract source code
 * @param url
 * @returns
 */
export const getTypescriptContract = async (url: string) => {
    const loader = new TypescriptLoader(url)
    return await loader.generateSource()
}

class TypescriptLoader {
    source: string
    constructor(source: string) {
        this.source = source
    }

    async generateSource(): Promise<any | string> {
        if (!this.isValidURL()) return "Invalid Github URL Path"

        const resolver = GithubResolver()
        const raw = (await resolver(this.source, { resolver: "" })) || ""
        if (!raw) return "Can't resolve the Github URL Path"

        // Fetch the source code
        const response = await fetch(raw)
        if (!response.ok) return "Failed to fetch the source code"

        const content = await response.text() // Main source code
        const sourceName = raw.replace(GITHUBUSERCONTENT_REGEX, "")

        let dependencies: ContractDependency[] = []
        let sources: any = {}
        try {
            dependencies = await extractImports(content, raw, [])

            dependencies.forEach((dependency) => {
                const { paths, originalContents } = dependency

                const sourceKey = paths.isHttp() ? paths.folderPath : paths.filePath
                sources[sourceKey] = { content: originalContents || "" }
            })

            sources[sourceName] = { content }
        } catch (error: any) {
            return "Error loading dependencies"
        }

        return {
            language: "Aspect",
            sources: {
                ...sources,
                [sourceName]: {
                    content,
                },
            },
        }
    }

    isValidURL(): boolean {
        if (!this.source) return false
        if (!this.source.startsWith("https://github.com")) return false
        if (!this.source.endsWith(".ts")) return false
        return true
    }
}

async function extractImports(
    content: any,
    mainPath: any = "",
    libraries: string[] = []
): Promise<ContractDependency[]> {
    // Regex to extract import information
    const regex = /\bimport\s+(?:[\w*\s{},]*)\s+from\s+['"]([^'"]+)['"];/g

    const matches: ContractDependency[] = []

    let match
    while ((match = regex.exec(content)) !== null) {
        let lib = match[1] // The imported library
        // We only care about the libraries locally
        if (!(lib.startsWith("./") || lib.startsWith("../"))) {
            continue
        }

        if (!lib.endsWith(".ts")) {
            lib = lib + ".ts"
        }

        const contractPath = new ContractPaths(lib, mainPath)

        // This is to prevent circular dependency and infinite recursion
        if (libraries.includes(contractPath.filePath)) {
            continue
        }
        libraries.push(contractPath.filePath.toString())

        // Get the source code either from node_modules or relative github path
        const { fileContents } = await resolve(contractPath.filePath)

        matches.push({
            paths: contractPath,
            fileContents: fileContents,
            originalContents: fileContents,
        })
        matches.push(
            ...(await extractImports(fileContents, contractPath.filePath, libraries))
        )
    }

    return matches
}