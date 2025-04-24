"use client"

import React, {useEffect, useRef, useState} from "react"
import axios from "axios"
import {apiUrl} from "@/app/api/config"
import {Commissioner} from "next/font/google"
import Cookies from "js-cookie"
import ReturnButton from "@/app/components/ReturnButton"

const azionText = Commissioner({subsets: ["latin"], weight: "800"})

export default function CamTest() {
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const [showOverlay, setShowOverlay] = useState(false)
    const [processing, setProcessing] = useState(false)
    const [result, setResult] = useState<string | null>(null)

    useEffect(() => {
        const refreshToken = Cookies.get("azionRefreshToken")
        const accessToken = Cookies.get("azionAccessToken")
        if (!refreshToken || !accessToken) {
            window.location.href = "/login"
        }
    }, [])

    useEffect(() => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices
                .getUserMedia({video: true})
                .then((stream) => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream
                    }
                })
                .catch((err) => {
                    console.error("Error accessing webcam: ", err)
                })
        }
    }, [])

    const captureAndSendFrame = async () => {
        if (!videoRef.current) return

        setProcessing(true)
        setShowOverlay(true)
        setResult(null)

        const canvas = document.createElement("canvas")
        canvas.width = videoRef.current.videoWidth
        canvas.height = videoRef.current.videoHeight
        const context = canvas.getContext("2d")

        if (context) {
            context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
            const imageData = canvas.toDataURL("image/jpeg")
            const base64Image = imageData.split(",")[1]

            const payload = {image: base64Image}

            try {
                const response = await axios.post(
                    `${apiUrl}/cam/sec`,
                    {payload},
                    {
                        headers: {
                            "Content-Type": "application/json",
                            authorization: "TEST1234",
                        },
                    },
                )

                if (response.data.image === "no faces detected") {
                    setResult("No faces detected")
                } else {
                    setResult("Face detected successfully")
                }
            } catch (error: any) {
                console.error("Error sending image to API: ", error)
                setResult(error.response?.data || "An error occurred")
            } finally {
                setTimeout(() => {
                    setShowOverlay(false)
                    setProcessing(false)
                }, 200)
            }
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-base-300 p-4 sm:p-6 relative">
            <div className="absolute top-4 sm:top-5 left-4 sm:left-5">
                <ReturnButton to={"/cam/list"}/>
            </div>
            {showOverlay && (
                <div className="absolute inset-0 bg-base-100/50 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="animate-pulse text-lightAccent text-lg sm:text-xl">Processing...</div>
                </div>
            )}

            <div className="w-full max-w-md flex flex-col items-center gap-6 sm:gap-8">
                <h1 className={`text-slate-300 text-4xl sm:text-5xl md:text-6xl font-bold ${azionText.className} text-center`}>
                    Azion<span className="ml-2 sm:ml-3 text-accent">Cam-Test</span>
                </h1>

                <div
                    className="relative w-56 h-56 sm:w-64 sm:h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-accent">
                    <video
                        ref={videoRef}
                        autoPlay
                        className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
                    />
                </div>

                {result && (
                    <div
                        className={`text-center p-3 rounded-lg w-full text-sm sm:text-base ${
                            result.includes("error") || result.includes("No faces")
                                ? "bg-red-900/20 text-red-400"
                                : "bg-green-900/20 text-green-400"
                        }`}
                    >
                        {result}
                    </div>
                )}

                <button
                    className="w-full bg-accent hover:bg-lightAccent text-white font-bold text-lg sm:text-xl py-3 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={captureAndSendFrame}
                    disabled={processing}
                >
                    {processing ? "Processing..." : "Test Camera"}
                </button>
            </div>
        </div>
    )
}

