"use client"
import {motion, useScroll, useTransform} from "framer-motion"
import {useEffect, useRef, useState} from "react"
import {Poppins} from "next/font/google"
import Image from "next/image"

const poppins = Poppins({subsets: ["latin"], weight: ["500", "600", "700"]})

interface ServiceCardProps {
    title: string
    description: string
    imageSrc: string
    index: number
}

function ServiceCard({title, description, imageSrc, index}: ServiceCardProps) {
    return (
        <motion.div
            initial={{opacity: 0, y: 50}}
            whileInView={{opacity: 1, y: 0}}
            transition={{duration: 0.5, delay: index * 0.1}}
            viewport={{once: true, margin: "-100px"}}
            className="group relative w-full md:w-[350px] h-[400px] rounded-2xl overflow-hidden bg-gradient-to-b from-blue-900/20 to-blue-950/40 backdrop-blur-sm border border-blue-900/30"
        >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10"/>

            <div className="absolute inset-0 w-full h-full">
                <Image
                    src={imageSrc || "/placeholder.svg"}
                    alt={title}
                    width={500}
                    height={500}
                    className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700"
                />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                <h3 className={`text-2xl font-bold mb-2 text-white ${poppins.className}`}>{title}</h3>
                <p className="text-gray-300 text-sm">{description}</p>
            </div>

            <div
                className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"/>
        </motion.div>
    )
}

export default function ServicesShowcase() {
    const containerRef = useRef<HTMLDivElement>(null)
    const {scrollYProgress} = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    })

    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768)
        }
        window.addEventListener("resize", handleResize)
        handleResize()
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    // Parallax effect for desktop
    const x = useTransform(scrollYProgress, [0, 1], ["1%", "-67%"])

    // Service card data
    const services = [
        {
            title: "Dashboard",
            description:
                "Get a comprehensive view of your organization's data with our intuitive dashboard. Monitor performance and make informed decisions.",
            imageSrc: "/Dashboard.png",
        },
        {
            title: "Organization",
            description:
                "Seamlessly collaborate with other organizations. Find and connect with any organization registered in Azion.",
            imageSrc: "/Org.png",
        },
        {
            title: "Task Management",
            description:
                "Create, control, and delete tasks with ease. Our task management system helps you stay organized and productive.",
            imageSrc: "/Task.png",
        },
        {
            title: "Cyber Security",
            description:
                "Protect your data with our advanced security features including MFA, OTP, and more to keep your account safe.",
            imageSrc: "/Account.png",
        },
    ]

    return (
        <section ref={containerRef} className="relative py-20 md:py-32 overflow-hidden bg-[#060610]">
            <div className="container mx-auto px-4 mb-16">
                <motion.div
                    initial={{opacity: 0, y: 30}}
                    whileInView={{opacity: 1, y: 0}}
                    transition={{duration: 0.6}}
                    viewport={{once: true, margin: "-100px"}}
                    className="text-center max-w-3xl mx-auto"
                >
                    <h2 className={`text-3xl md:text-5xl font-bold mb-6 ${poppins.className}`}>
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Powerful Features
            </span>
                    </h2>
                    <p className="text-gray-300 text-lg">
                        Azion provides a comprehensive suite of tools to enhance your organization&apos;s productivity
                        and
                        security
                    </p>
                </motion.div>
            </div>

            {isMobile ? (
                // Mobile layout - vertical cards
                <div className="px-4 flex flex-col gap-8">
                    {services.map((service, index) => (
                        <ServiceCard
                            key={index}
                            title={service.title}
                            description={service.description}
                            imageSrc={service.imageSrc}
                            index={index}
                        />
                    ))}
                </div>
            ) : (
                // Desktop layout - horizontal scroll
                <div className="h-[600px] flex items-center overflow-hidden">
                    <motion.div style={{x}} className="flex gap-8 pl-[10%]">
                        <div className="flex-shrink-0 w-[500px]">
                            <h3 className={`text-4xl font-bold leading-tight ${poppins.className}`}>
                                Azion secures every part of your account and organisation
                            </h3>
                            <p className="mt-4 text-gray-300">Our comprehensive security features protect your data at
                                every level</p>
                        </div>

                        {services.map((service, index) => (
                            <ServiceCard
                                key={index}
                                title={service.title}
                                description={service.description}
                                imageSrc={service.imageSrc}
                                index={index}
                            />
                        ))}
                    </motion.div>
                </div>
            )}
        </section>
    )
}
