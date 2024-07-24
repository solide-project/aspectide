"use client"

import { Blend } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useNav } from "@/components/core/providers/navbar-provider"

interface NavItemBindProps
    extends React.HTMLAttributes<HTMLButtonElement> {
}

export const BIND_KEY = "bind"

export function NavItemBind({
    ...props
}: NavItemBindProps) {
    const { isNavItemActive, setNavItemActive } = useNav()

    const handleOnClick = async (event: any) => {
        setNavItemActive(BIND_KEY)
        props.onClick && props.onClick(event)
    }


    return <Button
        className="cursor-pointer border-0 hover:bg-grayscale-100"
        size="icon"
        variant="ghost"
        onClick={handleOnClick}
        {...props}
    >
        <Blend />
    </Button>
}