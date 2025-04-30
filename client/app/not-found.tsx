"use client"
import {useEffect, useState} from "react"
import {Poppins} from "next/font/google"
import {motion} from "framer-motion"
import Link from "next/link"
import {ArrowLeft, Home, RefreshCw} from "lucide-react"

const headerText = Poppins({subsets: ["latin"], weight: "700"})
const bodyText = Poppins({subsets: ["latin"], weight: "400"})

const NotFound = () => {
    const [mousePosition, setMousePosition] = useState({x: 0, y: 0})
    const [windowSize, setWindowSize] = useState({width: 0, height: 0})

    useEffect(() => {
        // Set initial window size
        setWindowSize({
            width: window.innerWidth,
            height: window.innerHeight,
        })

        // Update mouse position for parallax effect
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({
                x: e.clientX,
                y: e.clientY,
            })
        }

        // Update window size on resize
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            })
        }

        window.addEventListener("mousemove", handleMouseMove)
        window.addEventListener("resize", handleResize)

        return () => {
            window.removeEventListener("mousemove", handleMouseMove)
            window.removeEventListener("resize", handleResize)
        }
    }, [])

    // Calculate parallax effect based on mouse position
    const calculateParallax = (depth = 0.05) => {
        const centerX = windowSize.width / 2
        const centerY = windowSize.height / 2
        const moveX = (mousePosition.x - centerX) * depth
        const moveY = (mousePosition.y - centerY) * depth
        return {x: moveX, y: moveY}
    }

    // Floating elements with different sizes and positions
    const floatingElements = [
        {size: "lg", position: "top-[10%] right-[15%]", delay: 0, depth: 0.03},
        {size: "md", position: "bottom-[20%] left-[10%]", delay: 0.5, depth: 0.05},
        {size: "sm", position: "top-[25%] left-[20%]", delay: 1, depth: 0.07},
        {size: "xl", position: "bottom-[15%] right-[20%]", delay: 1.5, depth: 0.02},
        {size: "xs", position: "top-[40%] left-[35%]", delay: 2, depth: 0.08},
        {size: "md", position: "bottom-[35%] right-[30%]", delay: 2.5, depth: 0.04},
        {size: "sm", position: "top-[60%] right-[40%]", delay: 3, depth: 0.06},
    ]

    // Size classes for floating elements
    const sizeClasses = {
        xs: "w-4 h-4",
        sm: "w-8 h-8",
        md: "w-12 h-12",
        lg: "w-16 h-16",
        xl: "w-24 h-24",
    }

    return (
        <div
            className="relative w-full min-h-screen bg-gradient-to-br from-[#050505] to-[#0c0c0c] overflow-hidden flex flex-col items-center justify-center px-4 py-16">
            {/* Animated background elements */}
            {floatingElements.map((element, index) => (
                <motion.div
                    key={index}
                    className={`absolute ${element.position} ${sizeClasses[element.size as keyof typeof sizeClasses]} rounded-full bg-[#0ea5e9] opacity-10 blur-xl pointer-events-none`}
                    animate={{
                        y: [0, -20, 0],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{
                        duration: 8,
                        ease: "easeInOut",
                        repeat: Number.POSITIVE_INFINITY,
                        delay: element.delay,
                    }}
                    style={{
                        x: calculateParallax(element.depth).x,
                        y: calculateParallax(element.depth).y + Math.sin(Date.now() * 0.001 + index) * 10,
                    }}
                />
            ))}

            {/* Central glowing circle */}
            <motion.div
                className="absolute w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] rounded-full bg-[#0ea5e9] opacity-5 blur-3xl pointer-events-none"
                animate={{
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 8,
                    ease: "easeInOut",
                    repeat: Number.POSITIVE_INFINITY,
                }}
            />

            {/* 404 Text */}
            <motion.div
                className="relative z-10 flex flex-col items-center text-center"
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.8}}
            >
                <h1
                    className={`${headerText.className} text-8xl sm:text-9xl font-bold bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] bg-clip-text text-transparent mb-2 drop-shadow-[0_0_15px_rgba(14,165,233,0.3)]`}
                >
                    404
                </h1>
                <div
                    className="w-24 h-1 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] rounded-full mb-6 shadow-[0_0_10px_rgba(14,165,233,0.5)]"></div>
                <h2
                    className={`${headerText.className} text-2xl sm:text-3xl md:text-4xl text-white mb-4 drop-shadow-[0_0_10px_rgba(14,165,233,0.2)]`}
                >
                    Page Not Found
                </h2>
                <p className={`${bodyText.className} text-gray-400 max-w-md mb-8 text-sm sm:text-base`}>
                    The page you&apos;re looking for doesn&apos;t exist or has been moved. Check the URL or navigate
                    back to the
                    homepage.
                </p>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/">
                        <motion.button
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] text-white rounded-lg shadow-[0_0_15px_rgba(14,165,233,0.3)] hover:shadow-[0_0_20px_rgba(14,165,233,0.5)] transition-all duration-300"
                            whileHover={{scale: 1.05}}
                            whileTap={{scale: 0.95}}
                        >
                            <Home className="h-5 w-5"/>
                            <span>Go to Homepage</span>
                        </motion.button>
                    </Link>
                    <motion.button
                        className="flex items-center gap-2 px-6 py-3 bg-transparent border border-[#333] hover:border-[#0ea5e9] text-gray-300 hover:text-[#0ea5e9] rounded-lg transition-all duration-300"
                        onClick={() => window.history.back()}
                        whileHover={{scale: 1.05}}
                        whileTap={{scale: 0.95}}
                    >
                        <ArrowLeft className="h-5 w-5"/>
                        <span>Go Back</span>
                    </motion.button>
                </div>
            </motion.div>

            {/* Animated 404 elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Animated code-like elements */}
                {Array.from({length: 20}).map((_, index) => (
                    <motion.div
                        key={index}
                        className="absolute text-[#0ea5e9]/10 text-xs sm:text-sm font-mono"
                        initial={{
                            x: Math.random() * windowSize.width,
                            y: -50,
                            opacity: 0,
                        }}
                        animate={{
                            y: windowSize.height + 50,
                            opacity: [0, 0.5, 0],
                        }}
                        transition={{
                            duration: Math.random() * 10 + 10,
                            repeat: Number.POSITIVE_INFINITY,
                            delay: Math.random() * 20,
                        }}
                    >
                        {Math.random() > 0.5 ? "404" : "</>"}
                    </motion.div>
                ))}
            </div>

            {/* Rotating loader in the background */}
            <motion.div
                className="absolute bottom-8 flex items-center justify-center text-gray-600 text-sm"
                animate={{opacity: [0.5, 0.8, 0.5]}}
                transition={{duration: 2, repeat: Number.POSITIVE_INFINITY}}
            >
                <RefreshCw className="h-4 w-4 mr-2 animate-spin"/>
                <span>Searching for your page...</span>
            </motion.div>
        </div>
    )
}

export default NotFound
