import { ethers } from "ethers"

export const RPC = "https://betanet-rpc1.artela.network"

export interface KVPair {
    key: string
    value: any
}

export interface AspectTransactionReceipt
    extends ethers.TransactionReceipt {
    aspectAddress: string
}

export interface ContractAspect {
    aspectId: string
    priority: string
    version: string
}