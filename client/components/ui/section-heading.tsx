"use client"

import {cn} from "@/lib/utils/cn"
import {motion} from "framer-motion"

interface SectionHeadingProps {
    title: string
    subtitle?: string
    className?: string
    titleClassName?: string
    subtitleClassName?: string
    badge?: string
}

export function SectionHeading({
                                   title,
                                   subtitle,
                                   className,
                                   titleClassName,
                                   subtitleClassName,
                                   badge,
                               }: SectionHeadingProps) {
    return (
        <motion.div
            initial={{opacity: 0, y: 10}}
            whileInView={{opacity: 1, y: 0}}
            transition={{duration: 0.5}}
            viewport={{once: true}}
            className={cn("text-center max-w-3xl mx-auto mb-12", className)}
        >
            {badge && (
                <motion.div
                    initial={{opacity: 0, y: 5}}
                    whileInView={{opacity: 1, y: 0}}
                    transition={{duration: 0.5, delay: 0.1}}
                    viewport={{once: true}}
                    className="mb-3"
                >
          <span
              className="inline-block px-2 py-1 bg-cyan-950/20 text-cyan-400 text-xs font-medium rounded-md border border-cyan-900/20">
            {badge}
          </span>
                </motion.div>
            )}

            <h2
                className={cn(
                    "text-2xl md:text-3xl font-bold mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent",
                    titleClassName,
                )}
            >
                {title}
            </h2>

            {subtitle && (
                <p className={cn("text-gray-400 text-sm max-w-2xl mx-auto leading-relaxed", subtitleClassName)}>{subtitle}</p>
            )}
        </motion.div>
    )
}
