"use client"
import {motion} from "framer-motion"
import {useEffect, useState} from "react"
import Image from "next/image"

interface SvgItem {
    src: string
    position: string
    delay: number
    scale?: number
    opacity?: number
}

interface FloatingIconsProps {
    svgData: SvgItem[]
    svgDataMobile: SvgItem[]
}

export default function FloatingIcons({svgData, svgDataMobile}: FloatingIconsProps) {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768)
        }

        handleResize()
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    const currentSvgData = isMobile ? svgDataMobile : svgData

    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
            {currentSvgData.map((svg, index) => (
                <motion.div
                    key={index}
                    className={`absolute ${svg.position} ${
                        isMobile ? "max-w-[60px] max-h-[60px]" : "max-w-[100px] max-h-[100px]"
                    }`}
                    initial={{opacity: 0, y: 10}}
                    animate={{
                        opacity: svg.opacity || 0.2,
                        y: 0,
                        scale: svg.scale || 1,
                    }}
                    transition={{duration: 1, delay: index * 0.2}}
                    whileInView={{
                        y: [0, -10, 0],
                        opacity: [svg.opacity || 0.2, (svg.opacity || 0.2) + 0.05, svg.opacity || 0.2],
                        transition: {
                            duration: 6,
                            ease: "easeInOut",
                            repeat: Number.POSITIVE_INFINITY,
                            repeatDelay: 0,
                            delay: svg.delay,
                        },
                    }}
                    viewport={{once: true}}
                >
                    <Image
                        src={svg.src || "/placeholder.svg"}
                        alt={`Floating icon ${index + 1}`}
                        width={100}
                        height={100}
                        className="w-full h-full"
                    />
                </motion.div>
            ))}
        </div>
    )
}
