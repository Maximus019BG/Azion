"use client"

import {cn} from "@/lib/utils/cn"
import {motion} from "framer-motion"
import type {ReactNode} from "react"

interface AnimatedGradientBorderProps {
    children: ReactNode
    className?: string
    containerClassName?: string
    gradientClassName?: string
    duration?: number
    borderWidth?: number
    animate?: boolean
}

export function AnimatedGradientBorder({
                                           children,
                                           className,
                                           containerClassName,
                                           gradientClassName,
                                           duration = 8,
                                           borderWidth = 1,
                                           animate = true,
                                       }: AnimatedGradientBorderProps) {
    return (
        <div className={cn("relative rounded-lg p-[1px] overflow-hidden group", containerClassName)}>
            {animate ? (
                <motion.div
                    className={cn(
                        "absolute inset-0 rounded-lg z-[1] opacity-40",
                        gradientClassName || "bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600",
                    )}
                    animate={{
                        backgroundPosition: ["0% 0%", "100% 100%"],
                    }}
                    transition={{
                        duration,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: "reverse",
                        ease: "linear",
                    }}
                    style={{
                        backgroundSize: "200% 200%",
                    }}
                />
            ) : (
                <div
                    className={cn(
                        "absolute inset-0 rounded-lg z-[1] opacity-40",
                        gradientClassName || "bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600",
                    )}
                />
            )}
            <div className={cn("relative z-[2] rounded-[calc(0.5rem-1px)] bg-black/80 backdrop-blur-sm", className)}>
                {children}
            </div>
        </div>
    )
}
