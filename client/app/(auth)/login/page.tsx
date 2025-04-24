"use client"
import {useEffect, useState} from "react"
import axios, {type AxiosResponse} from "axios"
import {apiUrl} from "@/app/api/config"
import {Inter, Space_Grotesk} from "next/font/google"
import OTP from "../../components/OTP"
import Cookies from "js-cookie"
import Link from "next/link"
import {authSessionCheck} from "@/app/func/funcs"
import GoogleLoginButton from "@/app/components/_auth/googleSSO"
import {motion} from "framer-motion"
import {AlertCircle, ArrowLeft, Eye, EyeOff} from "lucide-react"

interface Token {
    refreshToken: string
    accessToken: string
}

const spaceGrotesk = Space_Grotesk({subsets: ["latin"], weight: ["600", "700"], display: "swap"})
const inter = Inter({subsets: ["latin"], display: "swap"})

// Notification component
const showNotification = (messageDTO: string, type: "success" | "error") => {
    const notification = document.getElementById("notification")
    const notificationMessage = document.getElementById("notification-messageDTO")
    const notificationIcon = document.getElementById("notification-icon")

    if (notification && notificationMessage && notificationIcon) {
        notificationMessage.textContent = messageDTO

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

const Login = () => {
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [OTPNeeded, setOTPNeeded] = useState<boolean>(false)
    const [emailError, setEmailError] = useState<string>("")
    const [passwordError, setPasswordError] = useState<string>("")
    const [showPassword, setShowPassword] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const login = async (data: any) => {
        setIsLoading(true)
        axios
            .post(`${apiUrl}/auth/login`, data, {
                headers: {
                    "Content-Type": "application/json",
                },
            })
            .then(async (response: AxiosResponse) => {
                if (response.data.messageDTO === "OTP required" || response.status === 204) {
                    await setOTPNeeded(true)
                    await showModal()
                    showNotification("Please enter your OTP code", "success")
                } else {
                    const accessToken = response.data.accessToken
                    const refreshToken = response.data.refreshToken
                    Cookies.set("azionAccessToken", accessToken, {
                        secure: true,
                        sameSite: "Strict",
                    })
                    Cookies.set("azionRefreshToken", refreshToken, {
                        secure: true,
                        sameSite: "Strict",
                    })
                    showNotification("Login successful! Redirecting...", "success")
                    setTimeout(() => {
                        window.location.href = "/organizations"
                    }, 1000)
                }
            })
            .catch((error: any) => {
                if (error.response) {
                    showNotification(error.response.data || "Login failed", "error")
                } else {
                    showNotification("An error occurred. Please try again.", "error")
                }
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    useEffect(() => {
        if (Cookies.get("azionAccessToken") && Cookies.get("azionRefreshToken")) {
            authSessionCheck()
        }
    }, [])

    // Email validation
    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return re.test(email)
    }

    //Request before OTP
    const handleSubmitNoOTP = () => {
        let valid = true
        if (!email) {
            setEmailError("Email is required")
            valid = false
        } else if (!validateEmail(email)) {
            setEmailError("Please enter a valid email address")
            valid = false
        } else {
            setEmailError("")
        }

        if (!password) {
            setPasswordError("Password is required")
            valid = false
        } else {
            setPasswordError("")
        }

        if (valid) {
            const userData = {
                email,
                password,
            }
            login(userData)
        } else {
            showNotification("Please fix the errors before continuing", "error")
        }
    }

    //Request after OTP only if needed
    const handleSubmit = (otp: string) => {
        let valid = true
        if (!email) {
            setEmailError("Email is required")
            valid = false
        } else if (!validateEmail(email)) {
            setEmailError("Please enter a valid email address")
            valid = false
        } else {
            setEmailError("")
        }

        if (!password) {
            setPasswordError("Password is required")
            valid = false
        } else {
            setPasswordError("")
        }

        if (valid) {
            const userData = {
                email,
                password,
                OTP: otp,
            }
            login(userData)
        } else {
            showNotification("Please fix the errors before continuing", "error")
        }
    }

    const showModal = () => {
        const modal = document.getElementById("modal_5") as HTMLDialogElement | null
        if (modal) {
            modal.showModal()
        } else {
            console.error("Modal element not found")
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
                <span id="notification-messageDTO"></span>
            </div>

            {/* Background gradient */}
            <div
                className="fixed inset-0 bg-gradient-to-b from-blue-950/20 via-[#040410] to-[#040410] pointer-events-none"/>

            {/* Blue gradient orb */}
            <div
                className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] opacity-30 pointer-events-none"/>

            {/* Back Button */}
            <Link
                href="/"
                className="absolute top-4 left-4 flex items-center gap-1 text-blue-300 hover:text-blue-200 transition-colors"
            >
                <ArrowLeft size={16}/>
                <span className="text-sm">Back to Home</span>
            </Link>

            <div className="w-full max-w-md mx-auto relative z-10">
                {/* Header */}
                <motion.h1
                    initial={{opacity: 0, y: -20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.5}}
                    className={`text-3xl md:text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent ${spaceGrotesk.className}`}
                >
                    Welcome Back
                </motion.h1>

                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.5, delay: 0.1}}
                    className="bg-blue-900/10 border border-blue-900/20 rounded-md p-6 mb-6"
                >
                    <div className="space-y-4">
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
                                        emailError ? "border-red-500/50" : "border-blue-800/50"
                                    } text-white p-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500`}
                                />
                            </div>
                            {emailError && (
                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle size={12}/>
                                    {emailError}
                                </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">Enter the email associated with your account</p>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-blue-200">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className={`w-full bg-blue-900/20 border ${
                                        passwordError ? "border-red-500/50" : "border-blue-800/50"
                                    } text-white p-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-2 top-2 text-gray-400 hover:text-gray-300"
                                >
                                    {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                                </button>
                            </div>
                            {passwordError && (
                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle size={12}/>
                                    {passwordError}
                                </p>
                            )}
                            <div className="flex justify-end">
                                <Link href="/forgot-password"
                                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                                    Forgot password?
                                </Link>
                            </div>
                        </div>

                        {/* Login Button */}
                        <button
                            onClick={OTPNeeded ? showModal : handleSubmitNoOTP}
                            disabled={isLoading}
                            className={`w-full py-2 mt-2 bg-gradient-to-r from-blue-600 to-blue-400 rounded-md text-white hover:opacity-90 transition-opacity text-sm flex items-center justify-center ${
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
                                    Signing in...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </div>
                </motion.div>

                {/* Alternative Login Methods */}
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.5, delay: 0.2}}
                    className="space-y-4"
                >
                    <div className="relative flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-blue-900/30"></div>
                        </div>
                        <div className="relative bg-[#040410] px-4">
                            <span className="text-sm text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="flex justify-center">
                            <GoogleLoginButton text="Sign in with Google"/>
                        </div>

                        <Link href="/login/fast" className="flex justify-center">
                            <button
                                className="flex items-center justify-center gap-2 w-full py-2 border border-blue-800/50 rounded-md text-blue-300 hover:bg-blue-900/20 transition-colors text-sm">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                                    <circle cx="12" cy="12" r="3"/>
                                </svg>
                                Sign in with Face Recognition
                            </button>
                        </Link>
                    </div>
                </motion.div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-gray-400 text-sm">
                        Don&apos;t have an account?{" "}
                        <Link href="/register" className="text-blue-400 hover:text-blue-300 transition-colors">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>

            {/* OTP Modal */}
            <dialog id="modal_5" className="modal modal-bottom sm:modal-middle">
                <div className="modal-box bg-[#080818] border border-blue-900/30 p-6">
                    <h3 className={`text-xl font-bold mb-4 text-blue-100 ${spaceGrotesk.className}`}>Enter One-Time
                        Password</h3>
                    <p className="text-sm text-gray-400 mb-6">Please enter the verification code from your authenticator
                        app</p>
                    <OTP length={6} onComplete={handleSubmit}/>
                    <div className="modal-action">
                        <form method="dialog">
                            <button
                                className="px-4 py-2 bg-blue-900/20 border border-blue-800/50 rounded-md text-blue-300 hover:bg-blue-900/30 transition-colors text-sm">
                                Close
                            </button>
                        </form>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </div>
    )
}

export default Login
