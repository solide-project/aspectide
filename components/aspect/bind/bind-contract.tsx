import { Title } from "@/components/core/components/title";
import { useLogger } from "@/components/core/providers/logger-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ethers } from "ethers";
import { useState } from "react";
import { CollapsibleChevron } from "@/components/core/components/collapsible-chevron";
import { Textarea } from "@/components/ui/textarea";
import { ContractAspects } from "@/components/aspect/bind/contract-aspect";

interface BindContractProps extends React.HTMLAttributes<HTMLDivElement> {
}

export function BindContract({ className }: BindContractProps) {
    const logger = useLogger()

    const [contractAddress, setContractAddress] = useState<string>("")
    const [abi, setABI] = useState<string>("")
    const [binding, setBinding] = useState<boolean>(false)

    const handleBind = async () => {
        try {
            setBinding(true)
            await doBind()
        } catch (e: any) {
            console.error(e)
            logger.error(e.message || "Failed to bind aspect.")
        } finally {
            setBinding(false)
        }
    }

    const doBind = async () => {
        // Bind aspect
        logger.info(`Binding Aspect to ${contractAddress} ...`)

        const contractABI = JSON.parse(abi)
        console.log(contractABI)
    }

    return <div className={cn("px-2 pb-4", className)}>
        <Title text="Bind" />

        <div className="flex">
            <Button
                size="sm"
                onClick={handleBind}
                variant="default"
                disabled={binding || ethers.isAddress(contractAddress)}
            >
                Load
            </Button>
            <Input
                className="h-9 rounded-md px-3"
                placeholder="Contract Address"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
            />
        </div>

        <CollapsibleChevron name="Tools">
            <ContractAspects contractAddress={contractAddress} />
        </CollapsibleChevron>

        <CollapsibleChevron name="ABI">
            {ethers.isAddress(contractAddress) && <Textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                onChange={(e) => setABI(e.target.value)} />}
        </CollapsibleChevron>
    </div>
}