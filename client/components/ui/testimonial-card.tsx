"use client"
import {motion} from "framer-motion"
import Image from "next/image"
import {Quote} from "lucide-react"

interface TestimonialCardProps {
    quote: string
    author: string
    role: string
    avatarSrc?: string
    index?: number
    companyLogo?: string
}

export function TestimonialCard({quote, author, role, avatarSrc, companyLogo, index = 0}: TestimonialCardProps) {
    return (
        <motion.div
            initial={{opacity: 0, y: 10}}
            whileInView={{opacity: 1, y: 0}}
            transition={{duration: 0.5, delay: index * 0.1}}
            viewport={{once: true}}
            className="bg-gray-900/20 border border-gray-800/50 rounded-lg p-5 relative group hover:border-gray-700/50 transition-colors"
        >
            <Quote className="absolute top-4 right-4 text-cyan-500/10 w-8 h-8"/>

            {/* Rating stars - simplified */}
            <div className="flex mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 24 24">
                        <path
                            d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                    </svg>
                ))}
            </div>

            <p className="text-gray-300 mb-5 text-sm">{quote}</p>

            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <div className="mr-3">
                        {avatarSrc ? (
                            <Image
                                src={avatarSrc || "/placeholder.svg"}
                                alt={author}
                                width={36}
                                height={36}
                                className="rounded-full object-cover border border-gray-800/50"
                            />
                        ) : (
                            <div
                                className="w-9 h-9 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                                {author.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div>
                        <h4 className="font-medium text-white text-sm">{author}</h4>
                        <p className="text-gray-400 text-xs">{role}</p>
                    </div>
                </div>

                {companyLogo && (
                    <div className="h-6 w-auto opacity-60 group-hover:opacity-80 transition-opacity">
                        <Image
                            src={companyLogo || "/placeholder.svg"}
                            alt={`${author}'s company`}
                            width={60}
                            height={24}
                            className="h-full w-auto object-contain"
                        />
                    </div>
                )}
            </div>
        </motion.div>
    )
}
