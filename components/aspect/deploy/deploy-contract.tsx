import { useState } from "react"
import { SelectJoints } from "./select-joints"
import { SelectProperties } from "./select-properties"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLogger } from "@/components/core/providers/logger-provider"
import { useAspect } from "../aspect-provider"
import { AspectTransactionReceipt, KVPair } from "@/lib/aspect/interface"
import { ethers } from "ethers"
import { Title } from "@/components/core/components/title"

interface DeployAspectProps extends React.HTMLAttributes<HTMLDivElement> {
}

export function DeployAspect({ className }: DeployAspectProps) {
    const logger = useLogger()
    const aspect = useAspect()

    const [aspectAddress, setAspectAddress] = useState<string>("")
    const [deploying, setDeploying] = useState<boolean>(false)

    const [joints, setJoints] = useState<string[]>([])
    const [properties, setProperties] = useState<{ [key: string]: string }>({} as { [key: string]: string })
    const generateProperties = (): KVPair[] => {
        const encoder = new TextEncoder()
        const props: KVPair[] = Object.entries(properties).map(
            ([key, val]) => ({
                key,
                value: ethers.isAddress(val as string)
                    ? val
                    : encoder.encode(val as string)
            })
        )

        return props
    }

    const handleDeploy = async () => {
        try {
            setDeploying(true)
            await doDeploy()
            // Deploy aspect
        } catch (e) {
            console.error(e)
        } finally {
            setDeploying(false)
        }
    }

    const doDeploy = async () => {
        if (!aspect.compiledWasm) return

        logger.info("Deploying Aspect...")

        const props = generateProperties()
        const receipt: AspectTransactionReceipt =
            await aspect.sdk.deploy(aspect.compiledWasm, props, joints)
        setAspectAddress(receipt.aspectAddress)
    }

    return <div className={cn("px-2 pb-4", className)}>
        <Title text="Deploy" />

        <div className="flex">
            <Button
                size="sm"
                onClick={handleDeploy}
                variant="default"
                disabled={deploying}
            >
                Deploy
            </Button>
            <Input
                className="h-9 rounded-md px-3"
                placeholder="Contract Address"
                value={aspectAddress}
                onChange={(e) => setAspectAddress(e.target.value)}
            />
        </div>

        <SelectJoints setJoints={setJoints} />
        <SelectProperties setProperties={setProperties} />
    </div>
}