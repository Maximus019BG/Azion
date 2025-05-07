"use client"

import * as React from "react"
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"
import {cn} from "@/lib/utils/cn"
import {toggleVariants} from "@/components/ui/toggle"

const ToggleGroup = React.forwardRef<
    React.ElementRef<typeof ToggleGroupPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root>
>(({className, ...props}, ref) => (
    <ToggleGroupPrimitive.Root
        ref={ref}
        className={cn(
            "inline-flex bg-[#111] border border-[#222] p-1 rounded-md items-center justify-center gap-1",
            className,
        )}
        {...props}
    />
))

ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName

const ToggleGroupItem = React.forwardRef<
    React.ElementRef<typeof ToggleGroupPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>
>(({className, children, ...props}, ref) => (
    <ToggleGroupPrimitive.Item
        ref={ref}
        className={cn(
            toggleVariants({variant: "outline", size: "sm"}),
            "border-0 data-[state=on]:bg-[#0c4a6e] data-[state=on]:text-white text-gray-400 hover:text-[#0ea5e9] hover:bg-transparent focus:bg-[#0c4a6e]/20 flex items-center justify-center",
            className,
        )}
        {...props}
    >
        {children}
    </ToggleGroupPrimitive.Item>
))

ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName

export {ToggleGroup, ToggleGroupItem}
