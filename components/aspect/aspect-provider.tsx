"use client"

import React, { createContext, useContext, useState } from "react"

import { AspectSDK } from "@/lib/aspect/service"

export const AspectProvider = ({ children }: AspectProviderProps) => {
    const [sdk, _] = useState<AspectSDK>(new AspectSDK())
    const [compiledWasm, setCompiledWasm] = useState<Blob | null>(null)

    return (
        <AspectContext.Provider
            value={{
                sdk,
                compiledWasm,
                setCompiledWasm,
            }}
        >
            {children}
        </AspectContext.Provider>
    )
}

interface AspectProviderProps extends React.HTMLAttributes<HTMLDivElement> {
    name?: string
}

export const AspectContext = createContext({
    sdk: {} as AspectSDK,
    compiledWasm: null as Blob | null,
    setCompiledWasm: (_: Blob | null) => { },
})

export const useAspect = () => useContext(AspectContext)