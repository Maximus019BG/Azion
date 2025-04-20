"use client"
import {useEffect, useRef, useState} from "react"
import axios, {type AxiosResponse} from "axios"
import {apiUrl} from "@/app/api/config"
import Cookies from "js-cookie"
import {Space_Grotesk} from "next/font/google"
import {authSessionCheck} from "@/app/func/funcs"
import Link from "next/link"
import {ArrowLeft, Camera, Loader2} from "lucide-react"
import {motion} from "framer-motion"

const spaceGrotesk = Space_Grotesk({subsets: ["latin"], weight: ["600", "700"], display: "swap"})

export default function FastLogIn() {
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const [showOverlay, setShowOverlay] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [cameraActive, setCameraActive] = useState(false)

    useEffect(() => {
        if (Cookies.get("azionAccessToken") && Cookies.get("azionRefreshToken")) {
            authSessionCheck()
        }
    }, [])

    useEffect(() => {
        let stream: MediaStream | null = null

        const startCamera = async () => {
            try {
                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    stream = await navigator.mediaDevices.getUserMedia({video: true})
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream
                        setCameraActive(true)
                    }
                }
            } catch (err) {
                console.error("Error accessing webcam: ", err)
                setError("Camera access denied. Please check your camera permissions.")
                setCameraActive(false)
            }
        }

        startCamera()

        // Cleanup function to stop the camera when component unmounts
        return () => {
            if (stream) {
                stream.getTracks().forEach((track) => {
                    track.stop()
                })
            }
        }
    }, [])

    const captureAndSendFrame = async () => {
        if (!videoRef.current || isLoading) return

        try {
            setIsLoading(true)
            setError(null)
            setShowOverlay(true)

            // Flash effect
            await new Promise((resolve) => setTimeout(resolve, 350))

            // Capture image
            const current = videoRef.current
            const canvas = document.createElement("canvas")
            canvas.width = current.videoWidth
            canvas.height = current.videoHeight
            const context = canvas.getContext("2d")

            if (context) {
                context.drawImage(current, 0, 0, canvas.width, canvas.height)
                const imageData = canvas.toDataURL("image/jpeg")
                const base64Image = imageData.split(",")[1]
                const payload = {image: base64Image}

                // Send to API
                const response: AxiosResponse<{
                    accessToken: string
                    refreshToken: string
                }> = await axios.post(
                    `${apiUrl}/auth/fast-login`,
                    {payload},
                    {
                        headers: {
                            "Content-Type": "application/json",
                        },
                    },
                )

                // Set cookies
                Cookies.set("azionAccessToken", response.data.accessToken, {
                    secure: true,
                    sameSite: "Strict",
                })
                Cookies.set("azionRefreshToken", response.data.refreshToken, {
                    secure: true,
                    sameSite: "Strict",
                })

                // Redirect on success
                if (Cookies.get("azionAccessToken") && Cookies.get("azionRefreshToken")) {
                    // Show success message before redirecting
                    setError(null)
                    setTimeout(() => {
                        window.location.href = "/organizations"
                    }, 1000)
                }
            }
        } catch (error: any) {
            console.error("Error sending image to API: ", error)
            setError(error.response?.data || "Face recognition failed. Please try again or use password login.")
        } finally {
            // Wait before removing overlay
            await new Promise((resolve) => setTimeout(resolve, 100))
            setShowOverlay(false)
            setIsLoading(false)
        }
    }

    return (
        <div
            className="min-h-screen bg-[#040410] text-white flex flex-col justify-center items-center p-4 md:p-8 relative">
            {/* Background gradient */}
            <div
                className="fixed inset-0 bg-gradient-to-b from-blue-950/20 via-[#040410] to-[#040410] pointer-events-none"/>

            {/* Blue gradient orb */}
            <div
                className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] opacity-30 pointer-events-none"/>

            {/* Back Button */}
            <Link
                href="/login"
                className="absolute top-4 left-4 flex items-center gap-1 text-blue-300 hover:text-blue-200 transition-colors"
            >
                <ArrowLeft size={16}/>
                <span className="text-sm">Back to Login</span>
            </Link>

            <div className="w-full max-w-md mx-auto relative z-10 flex flex-col items-center">
                {/* Header */}
                <motion.h1
                    initial={{opacity: 0, y: -20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.5}}
                    className={`text-3xl md:text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent ${spaceGrotesk.className}`}
                >
                    Face Recognition
                </motion.h1>

                {/* Camera Container */}
                <motion.div
                    initial={{opacity: 0, scale: 0.9}}
                    animate={{opacity: 1, scale: 1}}
                    transition={{duration: 0.5, delay: 0.1}}
                    className="relative mb-8 w-full max-w-sm aspect-[4/3]"
                >
                    {/* Camera Frame */}
                    <div className="absolute inset-0 rounded-lg border-2 border-blue-500/30 overflow-hidden z-10">
                        <div
                            className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-blue-400 rounded-tl-lg"></div>
                        <div
                            className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-blue-400 rounded-tr-lg"></div>
                        <div
                            className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-blue-400 rounded-bl-lg"></div>
                        <div
                            className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-blue-400 rounded-br-lg"></div>
                    </div>

                    {/* Video Element */}
                    <div className="w-full h-full rounded-lg overflow-hidden bg-blue-900/20 backdrop-blur-sm">
                        {cameraActive ? (
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover transform scale-x-[-1]"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <p className="text-gray-400 text-center px-4">
                                    {error || "Camera initializing... Please allow camera access."}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Flash Overlay */}
                    {showOverlay && <div className="absolute inset-0 bg-white z-20 rounded-lg animate-flash"></div>}

                    {/* Loading Overlay */}
                    {isLoading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-30 rounded-lg">
                            <Loader2 className="w-8 h-8 text-blue-400 animate-spin"/>
                        </div>
                    )}
                </motion.div>

                {/* Error Message */}
                {error && (
                    <motion.div
                        initial={{opacity: 0, y: 10}}
                        animate={{opacity: 1, y: 0}}
                        className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-md text-red-400 text-sm max-w-sm text-center"
                    >
                        {error}
                    </motion.div>
                )}

                {/* Login Button */}
                <motion.button
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.5, delay: 0.2}}
                    onClick={captureAndSendFrame}
                    disabled={isLoading || !cameraActive}
                    className={`flex items-center justify-center gap-2 px-8 py-3 rounded-md text-white font-medium bg-gradient-to-r from-blue-600 to-blue-400 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed w-full max-w-xs`}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin"/>
                            Authenticating...
                        </>
                    ) : (
                        <>
                            <Camera size={18}/>
                            Authenticate with Face
                        </>
                    )}
                </motion.button>

                {/* Help Text */}
                <p className="mt-4 text-gray-400 text-sm text-center max-w-sm">
                    Position your face in the center of the frame and ensure you&apos;re in a well-lit environment.
                </p>

                {/* Alternative Login */}
                <div className="mt-8 text-center">
                    <p className="text-gray-400 text-sm">
                        Prefer traditional login?{" "}
                        <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
                            Sign in with password
                        </Link>
                    </p>
                </div>
            </div>

            {/* Custom Animation for Flash Effect */}
            <style jsx global>{`
                @keyframes flash {
                    0% {
                        opacity: 0;
                    }
                    50% {
                        opacity: 1;
                    }
                    100% {
                        opacity: 0;
                    }
                }

                .animate-flash {
                    animation: flash 0.5s ease-out;
                }
            `}</style>
        </div>
    )
}
