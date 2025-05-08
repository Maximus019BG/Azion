"use client"
import {useSearchParams} from "next/navigation"
import type React from "react"
import {useEffect, useState} from "react"
import axios from "axios"
import {apiUrl} from "@/app/api/config"
import {Inter, Space_Grotesk} from "next/font/google"
import {motion} from "framer-motion"
import {AlertCircle, ArrowLeft, Eye, EyeOff, Lock} from "lucide-react"
import Link from "next/link"

const spaceGrotesk = Space_Grotesk({subsets: ["latin"], weight: ["600", "700"], display: "swap"})
const inter = Inter({subsets: ["latin"], display: "swap"})

const ResetPassword = () => {
    const searchParams = useSearchParams()
    const token = searchParams.get("token")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [message, setMessage] = useState("")
    const [error, setError] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [passwordStrength, setPasswordStrength] = useState<number>(0)
    const [passwordError, setPasswordError] = useState<string>("")
    const [confirmPasswordError, setConfirmPasswordError] = useState<string>("")

    // Password strength checker
    useEffect(() => {
        if (!password) {
            setPasswordStrength(0)
            return
        }

        let strength = 0
        // Length check
        if (password.length >= 8) strength += 1
        // Contains uppercase
        if (/[A-Z]/.test(password)) strength += 1
        // Contains lowercase
        if (/[a-z]/.test(password)) strength += 1
        // Contains number
        if (/[0-9]/.test(password)) strength += 1
        // Contains special character
        if (/[^A-Za-z0-9]/.test(password)) strength += 1

        setPasswordStrength(strength)
    }, [password])

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

    // Validate password
    const validatePassword = (password: string) => {
        // Check if password meets all requirements
        const hasMinLength = password.length >= 8
        const hasUppercase = /[A-Z]/.test(password)
        const hasLowercase = /[a-z]/.test(password)
        const hasNumber = /[0-9]/.test(password)
        const hasSpecial = /[^A-Za-z0-9]/.test(password)

        if (!hasMinLength) {
            return "Password must be at least 8 characters long"
        }
        if (!hasUppercase) {
            return "Password must include at least one uppercase letter"
        }
        if (!hasLowercase) {
            return "Password must include at least one lowercase letter"
        }
        if (!hasNumber) {
            return "Password must include at least one number"
        }
        if (!hasSpecial) {
            return "Password must include at least one special character"
        }

        return ""
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Reset errors
        setPasswordError("")
        setConfirmPasswordError("")
        setError(false)

        // Validate password
        const passwordValidationError = validatePassword(password)
        if (passwordValidationError) {
            setPasswordError(passwordValidationError)
            setError(true)
            showNotification(passwordValidationError, "error")
            return
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            setConfirmPasswordError("Passwords do not match")
            setError(true)
            showNotification("Passwords do not match", "error")
            return
        }

        if (!token) {
            setMessage("Invalid or missing reset token")
            setError(true)
            showNotification("Invalid or missing reset token", "error")
            return
        }

        setIsLoading(true)
        setMessage("")
        setError(false)

        try {
            const response = await axios.put(
                `${apiUrl}/auth/reset-password`,
                {token, password},
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            )

            setMessage("Password reset successful!")
            setError(false)
            showNotification("Password reset successful! Redirecting to login...", "success")

            // Redirect to login page after successful password reset
            setTimeout(() => {
                window.location.href = "/login"
            }, 2000)
        } catch (error: any) {
            console.error("Reset password error:", error)
            if (error.response && error.response.status === 400) {
                setMessage(error.response.data.message || "Invalid or expired token")
            } else {
                setMessage("Error resetting password. Please try again.")
            }
            setError(true)
            showNotification(error.response?.data?.message || "Error resetting password", "error")
        } finally {
            setIsLoading(false)
        }
    }

    // If no token is provided, show an error message
    if (!token) {
        return (
            <div className="min-h-screen text-white flex flex-col justify-center items-center p-4 md:p-8">
                <div
                    className="fixed inset-0 bg-gradient-to-b from-blue-950/20 via-[#040410] to-[#040410] pointer-events-none"/>
                <div
                    className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] opacity-30 pointer-events-none"/>

                <div
                    className="w-full max-w-md mx-auto relative z-10 bg-blue-900/10 border border-blue-900/20 rounded-md p-6">
                    <h1 className={`text-2xl font-bold mb-4 text-center text-red-400 ${spaceGrotesk.className}`}>
                        Invalid Reset Link
                    </h1>
                    <p className="text-gray-300 mb-6 text-center">
                        The password reset link is invalid or has expired. Please request a new password reset link.
                    </p>
                    <div className="flex justify-center">
                        <Link href="/forgot-password">
                            <button
                                className="px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-500 transition-colors">
                                Request New Link
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        )
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
                    Reset Password
                </motion.h1>

                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.5, delay: 0.1}}
                    className="bg-blue-900/10 border border-blue-900/20 rounded-md p-6 mb-6"
                >
                    <p className="text-gray-300 mb-6 text-sm">
                        Create a new password for your account. Make sure it's strong and secure.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* New Password Field */}
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-blue-200">New Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter new password"
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

                            {/* Password strength indicator */}
                            {password && (
                                <div className="mt-2">
                                    <div className="flex gap-1 mb-1">
                                        {[1, 2, 3, 4, 5].map((level) => (
                                            <div
                                                key={level}
                                                className={`h-1 flex-1 rounded-full ${
                                                    passwordStrength >= level
                                                        ? level <= 2
                                                            ? "bg-red-500"
                                                            : level <= 3
                                                                ? "bg-yellow-500"
                                                                : "bg-green-500"
                                                        : "bg-gray-700"
                                                }`}
                                            ></div>
                                        ))}
                                    </div>
                                    <p className="text-xs">
                                        Password strength:{" "}
                                        <span
                                            className={
                                                passwordStrength <= 2
                                                    ? "text-red-400"
                                                    : passwordStrength <= 3
                                                        ? "text-yellow-400"
                                                        : "text-green-400"
                                            }
                                        >
                      {passwordStrength <= 2 ? "Weak" : passwordStrength <= 3 ? "Medium" : "Strong"}
                    </span>
                                    </p>
                                </div>
                            )}

                            {/* Password requirements */}
                            <div className="mt-2">
                                <p className="text-xs text-gray-500 mb-1">Requirements:</p>
                                <ul className="space-y-1">
                                    <li
                                        className={`text-xs flex items-start gap-1 ${
                                            password.length >= 8 ? "text-green-500" : "text-gray-500"
                                        }`}
                                    >
                                        <span className="mt-0.5">•</span> At least 8 characters
                                    </li>
                                    <li
                                        className={`text-xs flex items-start gap-1 ${
                                            /[A-Z]/.test(password) ? "text-green-500" : "text-gray-500"
                                        }`}
                                    >
                                        <span className="mt-0.5">•</span> Include uppercase letters
                                    </li>
                                    <li
                                        className={`text-xs flex items-start gap-1 ${
                                            /[a-z]/.test(password) ? "text-green-500" : "text-gray-500"
                                        }`}
                                    >
                                        <span className="mt-0.5">•</span> Include lowercase letters
                                    </li>
                                    <li
                                        className={`text-xs flex items-start gap-1 ${
                                            /[0-9]/.test(password) ? "text-green-500" : "text-gray-500"
                                        }`}
                                    >
                                        <span className="mt-0.5">•</span> Include numbers
                                    </li>
                                    <li
                                        className={`text-xs flex items-start gap-1 ${
                                            /[^A-Za-z0-9]/.test(password) ? "text-green-500" : "text-gray-500"
                                        }`}
                                    >
                                        <span className="mt-0.5">•</span> Include special characters
                                    </li>
                                </ul>
                            </div>

                            {passwordError && (
                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle size={12}/>
                                    {passwordError}
                                </p>
                            )}
                        </div>

                        {/* Confirm Password Field */}
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-blue-200">Confirm Password</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                    className={`w-full bg-blue-900/20 border ${
                                        confirmPasswordError ? "border-red-500/50" : "border-blue-800/50"
                                    } text-white p-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-2 top-2 text-gray-400 hover:text-gray-300"
                                >
                                    {showConfirmPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                                </button>
                            </div>

                            {confirmPasswordError && (
                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle size={12}/>
                                    {confirmPasswordError}
                                </p>
                            )}

                            <p className="text-xs text-gray-500 mt-1">Must match the password above</p>
                        </div>

                        {error && !passwordError && !confirmPasswordError && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <AlertCircle size={12}/>
                                {message}
                            </p>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading || passwordStrength < 3}
                            className={`w-full py-2 mt-4 bg-gradient-to-r from-blue-600 to-blue-400 rounded-md text-white hover:opacity-90 transition-opacity text-sm flex items-center justify-center ${
                                isLoading || passwordStrength < 3 ? "opacity-70 cursor-not-allowed" : ""
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
                                    Resetting...
                                </>
                            ) : (
                                <>
                                    <Lock size={16} className="mr-2"/>
                                    Reset Password
                                </>
                            )}
                        </button>
                    </form>

                    {!error && message && <p className="text-green-500 text-sm mt-4 text-center">{message}</p>}
                </motion.div>
            </div>
        </div>
    )
}

export default ResetPassword
