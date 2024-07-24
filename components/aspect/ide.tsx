"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"
import { ConsoleLogger } from "@/components/core/console"
import { IDE } from "@/components/core/ide"
import { IDEHeader } from "@/components/core/ide-header"
import { useEditor } from "@/components/core/providers/editor-provider"
import { useFileSystem } from "@/components/core/providers/file-provider"
import { useLogger } from "@/components/core/providers/logger-provider"
import {
    CODE_KEY,
    CONSOLE_KEY,
    EDITOR_KEY,
    FILE_KEY,
    useNav,
} from "@/components/core/providers/navbar-provider"
// import { BuildDeploy } from "@/components/evm/deploy/build-deploy"
import { useAspect } from "@/components/aspect/aspect-provider"
import { AspectNavBar } from "@/components/aspect/navbar/navbar"
import { QueryHelper } from "@/lib/core"
import { CompileInput } from "@/lib/aspect/input"
import { DeployAspect } from "@/components/aspect/deploy/deploy-contract"
import { BIND_KEY } from "./navbar/nav-item-bind"
import { BindContract } from "./bind/bind-contract"
import { FileTree } from "../core/file/file-tree"
// import { CompileError, CompileInput, isAddress, parseInput } from "@/lib/evm"
// import { getContractExplorer } from "@/lib/chains"

export const hexToDecimal = (hex: string): number => parseInt(hex, 16)

interface AspectIDEProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * Entire GitHub URL or an contract address
     */
    url?: string
    /**
     * Chain ID of contract address, should only be used when smart contract is address
     */
    chainId?: string
    title?: string
    content: string
    version?: string
    bytecodeId?: string
}

export function AspectIDE({
    url,
    chainId,
    title,
    content,
    version,
    bytecodeId,
}: AspectIDEProps) {
    const [input, setInput] = React.useState<any>({})

    const fs = useFileSystem()
    const ide = useEditor()
    const logger = useLogger()
    const aspect = useAspect()

    const { setNavItemActive, isNavItemActive } = useNav()

    React.useEffect(() => {
        ; (async () => {
            setNavItemActive(EDITOR_KEY, true)
            setNavItemActive(FILE_KEY, true)
            setNavItemActive(CONSOLE_KEY, true)

            let input: CompileInput = JSON.parse(content)
            setInput(input)
            const entryFile = await fs.initAndFoundEntry(input.sources, title || "")
            if (entryFile) {
                ide.selectFile(entryFile)
            }
            ''
            logger.info("Welcome to Solide IDE")
        })()
    }, [])

    const [compiling, setCompiling] = React.useState<boolean>(false)
    const handleCompile = async () => {
        const start = performance.now()
        logger.info("Compiling ...")
        setCompiling(true)

        try {
            await doCompile()
        } catch (error: any) {
            logger.error(error)
        }

        const end = performance.now()
        logger.success(`Compiled in ${end - start} ms.`, true)
        setCompiling(false)

        setNavItemActive(CODE_KEY, true)
    }

    const doCompile = async () => {
        if (compiling) return

        const formData = new FormData()
        const sources = await fs.generateSources()
        const blob = new Blob([JSON.stringify({ sources })], {
            type: "text/plain",
        })

        formData.append("file", blob, title)
        const response = await fetch("/api/compile", {
            method: "POST",
            body: formData,
        })

        if (!response.ok) {
            const data = (await response.json()) as any //CompileError
            // TODO: Handle compile error
            return
        }

        const wasm: Blob = await response.blob()
        console.log(wasm)
        aspect.setCompiledWasm(wasm)
    }


    return (
        <div className="min-w-screen max-w-screen flex max-h-screen min-h-screen">
            <div className="py-2 pl-2">
                <AspectNavBar url="" bytecodeId="" />
            </div>
            <ResizablePanelGroup
                direction="horizontal"
                className="min-w-screen max-w-screen max-h-screen min-h-screen"
            >
                <ResizablePanel
                    defaultSize={30}
                    minSize={25}
                    className={cn({
                        hidden: !(isNavItemActive(FILE_KEY) || isNavItemActive(CODE_KEY)),
                    })}
                >
                    <div className="flex max-h-screen w-full flex-col gap-y-2 overflow-y-auto p-2">
                        {isNavItemActive(FILE_KEY) && (
                            <FileTree className="rounded-lg bg-grayscale-025 pb-4" />
                        )}
                        {isNavItemActive(CODE_KEY) && (
                            <DeployAspect className="rounded-lg bg-grayscale-025" />
                        )}
                        {isNavItemActive(BIND_KEY) && (
                            <BindContract className="rounded-lg bg-grayscale-025" />
                        )}
                    </div>
                </ResizablePanel>
                {(isNavItemActive(FILE_KEY) || isNavItemActive(CODE_KEY)) && (
                    <ResizableHandle withHandle />
                )}
                <ResizablePanel defaultSize={70} minSize={5}>
                    <ResizablePanelGroup direction="vertical">
                        <ResizablePanel
                            defaultSize={75}
                            minSize={5}
                            className={cn("relative", {
                                hidden: !isNavItemActive(EDITOR_KEY),
                            })}
                        >
                            {isNavItemActive(EDITOR_KEY) && (
                                <>
                                    <IDEHeader />
                                    <IDE />
                                    <Button
                                        className="absolute"
                                        style={{ bottom: "16px", right: "16px" }}
                                        size="sm"
                                        onClick={handleCompile}
                                        disabled={compiling}
                                    >
                                        {compiling ? "Compiling ..." : "Compile"}
                                    </Button>
                                </>
                            )}
                        </ResizablePanel>
                        {isNavItemActive(EDITOR_KEY) && isNavItemActive(CONSOLE_KEY) && (
                            <ResizableHandle withHandle />
                        )}
                        <ResizablePanel
                            defaultSize={25}
                            minSize={5}
                            className={cn(
                                "m-2 !overflow-y-auto rounded-lg bg-grayscale-025",
                                { hidden: !isNavItemActive(CONSOLE_KEY) }
                            )}
                        >
                            <ConsoleLogger className="p-3" />
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    )
}