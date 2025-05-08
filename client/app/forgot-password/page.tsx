"use client"
import type React from "react"
import {useState} from "react"
import axios from "axios"
import Link from "next/link"
import {apiUrl} from "@/app/api/config"
import {Inter, Space_Grotesk} from "next/font/google"
import {motion} from "framer-motion"
import {AlertCircle, ArrowLeft, Mail} from "lucide-react"

const spaceGrotesk = Space_Grotesk({subsets: ["latin"], weight: ["600", "700"], display: "swap"})
const inter = Inter({subsets: ["latin"], display: "swap"})

const ForgotPassword = () => {
    const [email, setEmail] = useState("")
    const [message, setMessage] = useState("")
    const [error, setError] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    // Notification component
    const showNotification = (messageText: string, type: "success" | "error") => {
        const notification = document.getElementById("notification")
        const notificationMessage = document.getElementById("notification-message")
        const notificationIcon = document.getElementById("notification-icon")

        if (notification && notificationMessage && notificationIcon) {
            notificationMessage.textContent = messageText

            if (type === "success") {
                notification.classList.remove("bg-red-500/10", "border-red-500/30", "text-red-500")
                notification.classList.add("bg-green-500/10", "border-green-500/30", "text-green-500")
                notificationIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`
            } else {
                notification.classList.remove("bg-green-500/10", "border-green-500/30", "text-green-500")
                notification.classList.add("bg-red-500/10", "border-red-500/30", "text-red-500")
                notificationIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`
            }

            notification.classList.remove("hidden")
            notification.classList.add("flex")

            setTimeout(() => {
                notification.classList.add("hidden")
                notification.classList.remove("flex")
            }, 5000)
        }
    }

    // Email validation
    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return re.test(email)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!email) {
            setMessage("Email is required")
            setError(true)
            return
        }

        if (!validateEmail(email)) {
            setMessage("Please enter a valid email address")
            setError(true)
            return
        }

        setIsLoading(true)
        setMessage("")
        setError(false)

        try {
            const response = await axios.put(
                `${apiUrl}/auth/forgot-password`,
                {email},
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            )

            setMessage("Password reset link sent to your email.")
            setError(false)
            showNotification("Password reset link sent to your email.", "success")
        } catch (error: any) {
            if (error.response && error.response.status === 401) {
                setMessage("Unauthorized: Please check your credentials.")
            } else {
                setMessage("Error sending password reset email.")
            }
            setError(true)
            showNotification(error.response?.data?.message || "Error sending password reset email.", "error")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen text-white flex flex-col justify-center items-center p-4 md:p-8">
            {/* Notification */}
            <div
                id="notification"
                className="hidden fixed top-4 right-4 z-50 items-center gap-2 p-3 rounded-md border text-sm max-w-xs"
            >
                <span id="notification-icon"></span>
                <span id="notification-message"></span>
            </div>

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

            <div className="w-full max-w-md mx-auto relative z-10">
                {/* Header */}
                <motion.h1
                    initial={{opacity: 0, y: -20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.5}}
                    className={`text-3xl md:text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent ${spaceGrotesk.className}`}
                >
                    Forgot Password
                </motion.h1>

                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.5, delay: 0.1}}
                    className="bg-blue-900/10 border border-blue-900/20 rounded-md p-6 mb-6"
                >
                    <p className="text-gray-300 mb-6 text-sm">
                        Enter your email address below and we'll send you a link to reset your password.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email Field */}
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-blue-200">Email</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className={`w-full bg-blue-900/20 border ${
                                        error ? "border-red-500/50" : "border-blue-800/50"
                                    } text-white p-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500`}
                                />
                            </div>
                            {error && (
                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle size={12}/>
                                    {message}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-2 mt-4 bg-gradient-to-r from-blue-600 to-blue-400 rounded-md text-white hover:opacity-90 transition-opacity text-sm flex items-center justify-center ${
                                isLoading ? "opacity-70 cursor-not-allowed" : ""
                            }`}
                        >
                            {isLoading ? (
                                <>
                                    <svg
                                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Mail size={16} className="mr-2"/>
                                    Send Reset Link
                                </>
                            )}
                        </button>
                    </form>

                    {!error && message && <p className="text-green-500 text-sm mt-4 text-center">{message}</p>}
                </motion.div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-gray-400 text-sm">
                        Remember your password?{" "}
                        <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default ForgotPassword
