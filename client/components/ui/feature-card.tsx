"use client"

import {cn} from "@/lib/utils/cn"
import {motion} from "framer-motion"
import type {ReactNode} from "react"
import Link from "next/link"
import {ArrowRight} from "lucide-react"

interface FeatureCardProps {
    icon: ReactNode
    title: string
    description: string
    className?: string
    index?: number
    link?: string
}

export function FeatureCard({icon, title, description, className, index = 0, link}: FeatureCardProps) {
    const CardContent = () => (
        <div className="h-full p-5 flex flex-col">
            <div className="mb-4 text-cyan-400 bg-cyan-950/20 w-10 h-10 rounded-md flex items-center justify-center">
                {icon}
            </div>
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-gray-400 text-sm mb-4">{description}</p>

            {link && (
                <div className="mt-auto pt-3">
                    <motion.div
                        className="inline-flex items-center gap-1 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
                        whileHover={{x: 2}}
                    >
                        Learn more <ArrowRight size={12}/>
                    </motion.div>
                </div>
            )}
        </div>
    )

    return (
        <motion.div
            initial={{opacity: 0, y: 10}}
            whileInView={{opacity: 1, y: 0}}
            transition={{duration: 0.5, delay: index * 0.1}}
            viewport={{once: true}}
            className={cn("h-full", className)}
        >
            <div
                className="h-full rounded-lg overflow-hidden group border border-gray-800/50 bg-gray-900/20 hover:border-gray-700/50 transition-colors">
                {link ? (
                    <Link href={link} className="block h-full group-hover:bg-white/[0.02] transition-colors">
                        <CardContent/>
                    </Link>
                ) : (
                    <CardContent/>
                )}
            </div>
        </motion.div>
    )
}
