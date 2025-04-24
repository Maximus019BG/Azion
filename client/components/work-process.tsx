"use client"
import {motion} from "framer-motion"
import {useRef} from "react"
import {Poppins} from "next/font/google"
import Image from "next/image"

const poppins = Poppins({subsets: ["latin"], weight: ["500", "600", "700"]})

export default function WorkProcess() {
    const containerRef = useRef<HTMLDivElement>(null)

    return (
        <div className="relative bg-gradient-to-b from-[#02061700] via-[#02061778] to-[#020617] py-20">
            {/* Illuminated Title Section */}
            <IlluminatedTitle/>

            {/* Timeline Section */}
            <div className="container mx-auto px-4 mt-32">
                <Timeline/>
            </div>
        </div>
    )
}

function IlluminatedTitle() {
    return (
        <div className="relative overflow-hidden">
            {/* Light effect */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-blue-500/20 rounded-full blur-[100px] opacity-70"/>

            <motion.div
                initial={{opacity: 0, y: 50}}
                whileInView={{opacity: 1, y: 0}}
                transition={{duration: 0.8}}
                viewport={{once: true, margin: "-100px"}}
                className="relative z-10 text-center py-16"
            >
                <h2 className={`text-4xl md:text-6xl font-bold ${poppins.className} uppercase tracking-wider`}>
          <span className="bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent">
            The Life of Azion
          </span>
                </h2>
            </motion.div>
        </div>
    )
}

function Timeline() {
    const timelineData = [
        {
            date: "July 2024",
            title: "The Idea",
            description:
                "The idea of Azion was born in July 2024. We wanted to create a platform that will help organizations to improve their workflow and secure their company.",
            images: [
                "https://assets.aceternity.com/templates/startup-1.webp",
                "https://assets.aceternity.com/templates/startup-2.webp",
                "https://assets.aceternity.com/templates/startup-3.webp",
                "https://assets.aceternity.com/templates/startup-4.webp",
            ],
        },
        {
            date: "August 2024",
            title: "Security",
            description:
                "Security is our top priority. We have implemented various security measures to protect your data. By using Azion, you can be sure that your data is safe and secure. We use the latest encryption technologies to protect your data from unauthorized access.",
            images: [
                "https://assets.aceternity.com/pro/hero-sections.png",
                "https://assets.aceternity.com/features-section.png",
                "https://assets.aceternity.com/pro/bento-grids.png",
                "https://assets.aceternity.com/cards.png",
            ],
        },
        {
            date: "October 2024",
            title: "Launch",
            description: "Deployed the first version of Azion to production in October 2024.",
            features: [
                "Better design for the dashboard",
                "Improved performance",
                "New security features (Azion Camera)",
                "Statistics and analytics",
                "Calendar",
            ],
            images: [
                "https://assets.aceternity.com/pro/hero-sections.png",
                "https://assets.aceternity.com/features-section.png",
                "https://assets.aceternity.com/pro/bento-grids.png",
                "https://assets.aceternity.com/cards.png",
            ],
        },
    ]

    return (
        <div className="relative">
            {/* Timeline line */}
            <div
                className="absolute left-[15px] md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-blue-500/0 via-blue-500/50 to-blue-500/0 md:-translate-x-[1px]"/>

            {timelineData.map((item, index) => (
                <TimelineItem
                    key={index}
                    date={item.date}
                    title={item.title}
                    description={item.description}
                    features={item.features}
                    images={item.images}
                    isLeft={index % 2 === 0}
                    index={index}
                />
            ))}
        </div>
    )
}

interface TimelineItemProps {
    date: string
    title: string
    description: string
    features?: string[]
    images: string[]
    isLeft: boolean
    index: number
}

function TimelineItem({date, title, description, features, images, isLeft, index}: TimelineItemProps) {
    return (
        <div className="relative mb-24 md:mb-32">
            {/* Timeline dot */}
            <motion.div
                initial={{scale: 0}}
                whileInView={{scale: 1}}
                transition={{duration: 0.5, delay: 0.2}}
                viewport={{once: true, margin: "-100px"}}
                className="absolute left-[15px] md:left-1/2 top-[30px] w-[15px] h-[15px] rounded-full bg-blue-500 border-4 border-[#020617] z-10 md:-translate-x-[7.5px]"
            />

            <div className={`flex flex-col ${isLeft ? "md:flex-row" : "md:flex-row-reverse"} gap-8`}>
                {/* Date column - visible on mobile and desktop */}
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    whileInView={{opacity: 1, y: 0}}
                    transition={{duration: 0.5}}
                    viewport={{once: true, margin: "-100px"}}
                    className="pl-10 md:pl-0 md:w-1/2 flex md:justify-center"
                >
                    <div className={`md:w-[80%] ${isLeft ? "md:text-right" : "md:text-left"}`}>
                        <div className="text-blue-400 font-medium mb-2">{date}</div>
                        <h3 className={`text-2xl md:text-3xl font-bold mb-4 ${poppins.className}`}>{title}</h3>
                        <p className="text-gray-300 mb-4">{description}</p>

                        {features && (
                            <ul className="space-y-1 mb-4">
                                {features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                        <span className="text-blue-400 mt-1">•</span>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </motion.div>

                {/* Images column */}
                <motion.div
                    initial={{opacity: 0, x: isLeft ? 20 : -20}}
                    whileInView={{opacity: 1, x: 0}}
                    transition={{duration: 0.5, delay: 0.3}}
                    viewport={{once: true, margin: "-100px"}}
                    className="pl-10 md:pl-0 md:w-1/2 flex md:justify-center"
                >
                    <div className="grid grid-cols-2 gap-3 md:w-[80%]">
                        {images.map((image, idx) => (
                            <motion.div
                                key={idx}
                                initial={{opacity: 0, y: 20}}
                                whileInView={{opacity: 1, y: 0}}
                                transition={{duration: 0.5, delay: 0.3 + idx * 0.1}}
                                viewport={{once: true, margin: "-100px"}}
                                className="relative overflow-hidden rounded-lg aspect-video"
                            >
                                <Image
                                    src={image || "/placeholder.svg"}
                                    alt={`${title} image ${idx + 1}`}
                                    width={300}
                                    height={200}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                />
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
