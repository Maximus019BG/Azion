"use client"

import {useState} from "react"
import {AnimatePresence, motion} from "framer-motion"
import {ChevronDown} from "lucide-react"
import {cn} from "@/lib/utils/cn"
import {Space_Grotesk} from "next/font/google"

const spaceGrotesk = Space_Grotesk({subsets: ["latin"], weight: ["600", "700"], display: "swap"})

interface FaqItem {
    question: string
    answer: string
}

interface FaqAccordionProps {
    title?: string
    items: FaqItem[]
    className?: string
}

export function FaqAccordion({title = "Frequently Asked Questions", items, className}: FaqAccordionProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(null)

    const toggleItem = (index: number) => {
        setOpenIndex(openIndex === index ? null : index)
    }

    return (
        <div className={cn("rounded-lg p-6 border border-blue-900/20 w-full", className)}>
            <h3
                className={`text-xl font-semibold mb-6 text-center bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent ${spaceGrotesk.className}`}
            >
                {title}
            </h3>
            <div className="space-y-3">
                {items.map((item, index) => (
                    <div
                        key={index}
                        className={cn(
                            "overflow-hidden rounded-md transition-all duration-200",
                            openIndex === index ? "bg-blue-900/20" : "bg-blue-900/5 hover:bg-blue-900/10",
                        )}
                    >
                        <button
                            onClick={() => toggleItem(index)}
                            className="flex items-center justify-between w-full p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                            aria-expanded={openIndex === index}
                        >
                            <h4 className={`font-medium text-blue-200 text-sm ${spaceGrotesk.className}`}>{item.question}</h4>
                            <motion.div
                                animate={{rotate: openIndex === index ? 180 : 0}}
                                transition={{duration: 0.2}}
                                className="flex-shrink-0 ml-2"
                            >
                                <ChevronDown size={18} className="text-blue-400"/>
                            </motion.div>
                        </button>

                        <AnimatePresence initial={false}>
                            {openIndex === index && (
                                <motion.div
                                    initial={{height: 0, opacity: 0}}
                                    animate={{height: "auto", opacity: 1}}
                                    exit={{height: 0, opacity: 0}}
                                    transition={{duration: 0.2}}
                                >
                                    <div className="px-4 pb-4 pt-0">
                                        <div
                                            className="h-px w-full bg-gradient-to-r from-blue-500/20 via-blue-400/20 to-blue-500/20 mb-3"/>
                                        <p className="text-gray-300 text-xs leading-relaxed">{item.answer}</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </div>
    )
}
