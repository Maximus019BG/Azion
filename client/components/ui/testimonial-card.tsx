"use client"

import {motion} from "framer-motion"
import Image from "next/image"
import {Star} from "lucide-react"

interface TestimonialCardProps {
    quote: string
    author: string
    role: string
    index: number
    companyLogo?: string // Keep for backward compatibility
    userImage?: string // New prop for user profile image
}

export function TestimonialCard({quote, author, role, index, companyLogo, userImage}: TestimonialCardProps) {
    // Use userImage if provided, otherwise fall back to companyLogo
    const imageUrl = userImage || companyLogo || "/placeholder.svg"

    return (
        <motion.div
            initial={{opacity: 0, y: 20}}
            whileInView={{opacity: 1, y: 0}}
            transition={{duration: 0.5, delay: index * 0.1}}
            viewport={{once: true}}
            className="bg-gray-900/20 border border-gray-800/50 rounded-lg p-6 flex flex-col h-full"
        >
            <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className="text-yellow-400 fill-yellow-400"/>
                ))}
            </div>

            <p className="text-gray-300 mb-6 flex-grow">{quote}</p>

            <div className="flex items-center gap-4">
                {/* User profile image */}
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-cyan-500/30">
                    <Image
                        src={imageUrl || "/woman1.png"}
                        alt={author}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                    />
                </div>
                <div>
                    <h4 className="font-semibold text-white">{author}</h4>
                    <p className="text-gray-400 text-sm">{role}</p>
                </div>
            </div>
        </motion.div>
    )
}
