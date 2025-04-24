"use client"

import {cn} from "@/lib/utils/cn"
import {motion} from "framer-motion"
import {Space_Grotesk} from "next/font/google"

const spaceGrotesk = Space_Grotesk({subsets: ["latin"], display: "swap"})

interface AnimatedTextProps {
    text: string | string[]
    className?: string
    once?: boolean
    useSpaceGrotesk?: boolean
}

export function AnimatedText({text, className, once = true, useSpaceGrotesk = false}: AnimatedTextProps) {
    const fontClass = useSpaceGrotesk ? spaceGrotesk.className : ""

    // Handle array of strings (multiple lines)
    if (Array.isArray(text)) {
        return (
            <>
                {text.map((line, index) => (
                    <div key={index} className="overflow-hidden">
                        <motion.div
                            initial={{y: "100%"}}
                            whileInView={{y: 0}}
                            transition={{duration: 0.5, delay: index * 0.1}}
                            viewport={{once}}
                            className={cn("", className, fontClass)}
                        >
                            {line}
                        </motion.div>
                    </div>
                ))}
            </>
        )
    }

    // Handle single string with words animation
    const words = text.split(" ")

    return (
        <div className="flex flex-wrap">
            {words.map((word, index) => (
                <div key={index} className="overflow-hidden mr-2 mb-2">
                    <motion.span
                        className={cn(className, fontClass)}
                        initial={{y: "100%"}}
                        whileInView={{y: 0}}
                        transition={{duration: 0.5, delay: index * 0.05}}
                        viewport={{once}}
                    >
                        {word}
                    </motion.span>
                </div>
            ))}
        </div>
    )
}
