import { useState } from "react"
import { ethers } from "ethers"

import { Button } from "@/components/ui/button"
import { ContractAspect } from "@/lib/aspect/interface"
import { useAspect } from "../aspect-provider"
import { useLogger } from "@/components/core/providers/logger-provider"

interface ContractAspectsProps extends React.HTMLAttributes<HTMLDivElement> {
    contractAddress: string
}

export function ContractAspects({ contractAddress }: ContractAspectsProps) {
    const [contractAspects, setContractAspects] = useState<ContractAspect[] | null>(null)
    const { sdk } = useAspect()
    const logger = useLogger()

    const getContractAspects = async () => {
        setContractAspects(null)
        if (!ethers.isAddress(contractAddress)) return

        try {
            const aspects = await sdk.getAspect(contractAddress)
            logger.info(`${contractAddress} has ${aspects.length} aspect(s) binded.`)
            setContractAspects(aspects)
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <>
            <div>
                <Button className="h-9 rounded-md px-3" onClick={getContractAspects}>
                    Load Aspects
                </Button>
            </div>
            {contractAspects && (
                <div className="my-4 max-h-[200px] overflow-y-auto">
                    <Button
                        size="sm"
                        variant="outline"
                        className="flex"
                        onClick={() => {
                            setContractAspects(null)
                        }}
                    >
                        Clear
                    </Button>

                    {contractAspects.length > 0 ? (
                        contractAspects.map((aspect: any) => (
                            <div key={aspect.aspectId}>
                                {aspect.aspectId} {`(v${aspect.version})`}
                            </div>
                        ))
                    ) : <div>Contract is not binded to any Aspect</div>}
                </div>
            )}
        </>
    )
}