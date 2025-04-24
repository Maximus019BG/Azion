"use client"
import {motion} from "framer-motion"
import Image from "next/image"

interface DecorativeSVGProps {
    src: string
    className?: string
    rotate?: number
    animate?: boolean
    delay?: number
}

export default function DecorativeSVG({
                                          src,
                                          className = "",
                                          rotate = 0,
                                          animate = true,
                                          delay = 0,
                                      }: DecorativeSVGProps) {
    return (
        <motion.div
            initial={{opacity: 0, rotate: rotate - 5}}
            animate={{opacity: 0.1, rotate}}
            transition={{duration: 1, delay}}
            className={className}
        >
            {animate ? (
                <motion.div
                    animate={{y: [0, -5, 0], rotate: [rotate, rotate + 2, rotate]}}
                    transition={{duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut"}}
                >
                    <Image
                        src={src || "/placeholder.svg"}
                        alt="Decorative element"
                        width={100}
                        height={100}
                        className="w-full h-full"
                    />
                </motion.div>
            ) : (
                <Image
                    src={src || "/placeholder.svg"}
                    alt="Decorative element"
                    width={100}
                    height={100}
                    className="w-full h-full"
                />
            )}
        </motion.div>
    )
}
