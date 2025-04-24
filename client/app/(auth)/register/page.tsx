"use client"
import {useEffect, useState} from "react"
import axios, {type AxiosResponse} from "axios"
import {apiUrl} from "@/app/api/config"
import {Inter, Space_Grotesk} from "next/font/google"
import Cookies from "js-cookie"
import Link from "next/link"
import {AlertCircle, ArrowLeft, CheckCircle2, ChevronRight, Eye, EyeOff} from "lucide-react"
import {authSessionCheck} from "@/app/func/funcs"
import GoogleLoginButton from "@/app/components/_auth/googleSSO"
import {motion} from "framer-motion"

interface InputField<T> {
    label: string
    value: T
    onChange: (value: T) => void
    type?: "text" | "email" | "date" | "password" | "checkbox" | "select"
    combinedWith?: string
    placeholder?: string
    requirements?: string[]
}

const spaceGrotesk = Space_Grotesk({subsets: ["latin"], weight: ["600", "700"], display: "swap"})
const inter = Inter({subsets: ["latin"], display: "swap"})

const handleRegister = (data: any, isOwner: boolean) => {
    axios
        .post(`${apiUrl}/auth/register`, data, {
            headers: {
                "Content-Type": "application/json",
            },
        })
        .then((response: AxiosResponse) => {
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
            if (isOwner) {
                window.location.href = "/register/organization"
            } else {
                window.location.href = "/organizations"
            }
        })
        .catch((error: any) => {
            if (error.response?.status === 409) {
                showNotification("Email already in use", "error")
            } else {
                showNotification("Registration failed. Please try again.", "error")
            }
        })
}

const isLeapYear = (year: number): boolean => {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

const isValidDate = (day: string, month: string, year: string): boolean => {
    const dayInt = Number.parseInt(day)
    const monthInt = Number.parseInt(month)
    const yearInt = Number.parseInt(year)

    const currentDate = new Date()
    const selectedDate = new Date(yearInt, monthInt - 1, dayInt)

    if (selectedDate > currentDate) {
        return false
    }

    if (monthInt === 2) {
        if (isLeapYear(yearInt)) {
            return dayInt <= 29
        } else {
            return dayInt <= 28
        }
    }

    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    return dayInt <= daysInMonth[monthInt - 1]
}

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

const Register = () => {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [age, setAge] = useState({day: "1", month: "1", year: "2000"})
    const [password, setPassword] = useState("")
    const [password2, setPassword2] = useState("")
    const [step, setStep] = useState(0)
    const [days, setDays] = useState<string[]>([])
    const [months, setMonths] = useState<string[]>([])
    const [years, setYears] = useState<string[]>([])
    const [nameError, setNameError] = useState<string>("")
    const [emailError, setEmailError] = useState<string>("")
    const [passwordError, setPasswordError] = useState<string>("")
    const [password2Error, setPassword2Error] = useState<string>("")
    const [showPassword, setShowPassword] = useState<boolean>(false)
    const [showPassword2, setShowPassword2] = useState<boolean>(false)
    const [passwordStrength, setPasswordStrength] = useState<number>(0)
    // First, let's add a new state for the role selection
    const [role, setRole] = useState<string>("client") // Default to client

    useEffect(() => {
        if (Cookies.get("azionAccessToken") && Cookies.get("azionRefreshToken")) {
            authSessionCheck()
        }
    }, [])

    // DATE
    useEffect(() => {
        const currentDate = new Date()
        const currentYear = currentDate.getFullYear() - 1
        const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, "0")
        const currentDay = currentDate.getDate().toString().padStart(2, "0")

        // Generate years
        const newYears = Array.from({length: 100}, (_, i) => (currentYear - i).toString())
        setYears(newYears)

        // Generate months
        const newMonths = Array.from({length: 12}, (_, i) => (i + 1).toString().padStart(2, "0")).filter(
            (month) =>
                age.year < currentYear.toString() ||
                (age.year === currentYear.toString() && Number.parseInt(month) <= Number.parseInt(currentMonth)),
        )
        setMonths(newMonths)

        // Generate days
        const newDays = Array.from({length: 31}, (_, i) => (i + 1).toString().padStart(2, "0")).filter(
            (day) =>
                isValidDate(day, age.month, age.year) &&
                (age.year < currentYear.toString() ||
                    (age.year === currentYear.toString() && Number.parseInt(age.month) < Number.parseInt(currentMonth)) ||
                    (age.year === currentYear.toString() &&
                        age.month === currentMonth &&
                        Number.parseInt(day) <= Number.parseInt(currentDay))),
        )
        setDays(newDays)
    }, [age.year, age.month])

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

    // Email validation
    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return re.test(email)
    }

    //SUBMIT
    const handleSubmit = () => {
        let valid = true
        if (!name) {
            setNameError("Name is required")
            valid = false
        } else if (name.length < 3) {
            setNameError("Name must be at least 3 characters")
            valid = false
        } else {
            setNameError("")
        }

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
        } else if (password.length < 8) {
            setPasswordError("Password must be at least 8 characters")
            valid = false
        } else if (passwordStrength < 3) {
            setPasswordError("Password is too weak")
            valid = false
        } else {
            setPasswordError("")
        }

        if (password !== password2) {
            setPassword2Error("Passwords do not match")
            valid = false
        } else {
            setPassword2Error("")
        }

        if (valid) {
            // Set isOrgOwner and isWorker based on the selected role
            const isOrgOwner = role === "owner"
            const isWorker = role === "worker"

            const userData = {
                name,
                email,
                age: `${age.year}-${age.month.padStart(2, "0")}-${age.day.padStart(2, "0")}`,
                isOrgOwner,
                password,
                isWorker,
            }
            handleRegister(userData, isOrgOwner)
        } else {
            showNotification("Please fix the errors before submitting", "error")
        }
    }

    const handleNextStep = () => {
        let valid = true
        if (step === 0) {
            if (!name) {
                setNameError("Name is required")
                valid = false
            } else if (name.length < 3) {
                setNameError("Name must be at least 3 characters")
                valid = false
            } else {
                setNameError("")
            }

            if (!email) {
                setEmailError("Email is required")
                valid = false
            } else if (!validateEmail(email)) {
                setEmailError("Please enter a valid email address")
                valid = false
            } else {
                setEmailError("")
            }
        } else if (step === 1) {
            if (!password) {
                setPasswordError("Password is required")
                valid = false
            } else if (password.length < 8) {
                setPasswordError("Password must be at least 8 characters")
                valid = false
            } else if (passwordStrength < 3) {
                setPasswordError("Password is too weak")
                valid = false
            } else {
                setPasswordError("")
            }

            if (password !== password2) {
                setPassword2Error("Passwords do not match")
                valid = false
            } else {
                setPassword2Error("")
            }
        }

        if (valid) {
            if (step < stepLabels.length - 1) {
                setStep(step + 1) // Move to the next step
            } else {
                handleSubmit() // Call submit function on the last step
            }
        } else {
            showNotification("Please fix the errors before continuing", "error")
        }
    }

    const handleBackStep = () => {
        if (step > 0) {
            setStep(step - 1) // Move to the previous step
        }
    }

    const stepLabels = ["User Details", "Password", "Role", "Submit"]

    const inputFields: InputField<any>[] = [
        {
            label: "Username",
            value: name,
            onChange: setName,
            type: "text",
            placeholder: "Enter your username",
            requirements: ["At least 3 characters", "No special characters"],
        },
        {
            label: "Email",
            value: email,
            onChange: setEmail,
            type: "email",
            placeholder: "Enter your email",
            requirements: ["Valid email format (e.g., user@example.com)"],
        },
        {
            label: "Date of Birth",
            value: age,
            onChange: (value: any) => setAge(value),
            type: "date",
        },
        {
            label: "Password",
            value: password,
            onChange: setPassword,
            type: "password",
            placeholder: "Enter your password",
            requirements: [
                "At least 8 characters",
                "Include uppercase letters",
                "Include lowercase letters",
                "Include numbers",
                "Include special characters",
            ],
        },
        {
            label: "Confirm Password",
            value: password2,
            onChange: setPassword2,
            type: "password",
            placeholder: "Confirm your password",
            requirements: ["Must match the password above"],
        },
        {
            label: "Role",
            value: role,
            onChange: setRole,
            type: "select", // New type for dropdown
            placeholder: "Select your role",
        },
    ]

    const getCurrentFields = () => {
        switch (step) {
            case 0:
                return inputFields.slice(0, 3) // User Details
            case 1:
                return inputFields.slice(3, 5) // Password
            case 2:
                return inputFields.slice(5, 6) // Role (now a single dropdown)
            default:
                return []
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
                    Create Your Account
                </motion.h1>

                {/* Steps */}
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        {stepLabels.map((label, index) => (
                            <div key={index} className="flex flex-col items-center">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                                        index <= step
                                            ? "bg-gradient-to-r from-blue-600 to-blue-400 text-white"
                                            : "bg-blue-900/20 text-blue-300 border border-blue-800/50"
                                    }`}
                                >
                                    {index + 1}
                                </div>
                                <span
                                    className={`text-xs mt-1 ${index <= step ? "text-blue-300" : "text-gray-500"} hidden sm:inline-block`}
                                >
                  {label}
                </span>
                            </div>
                        ))}
                    </div>
                    <div className="relative mt-2">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-blue-900/20 rounded-full"></div>
                        <div
                            className="absolute top-0 left-0 h-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-300"
                            style={{width: `${((step + 1) / stepLabels.length) * 100}%`}}
                        ></div>
                    </div>
                </div>

                {/* Form Fields */}
                <motion.div
                    key={step}
                    initial={{opacity: 0, x: 20}}
                    animate={{opacity: 1, x: 0}}
                    exit={{opacity: 0, x: -20}}
                    transition={{duration: 0.3}}
                    className="bg-blue-900/10 border border-blue-900/20 rounded-md p-6 mb-6"
                >
                    <h2 className={`text-xl font-semibold mb-4 text-blue-100 ${spaceGrotesk.className}`}>{stepLabels[step]}</h2>

                    <div className="space-y-4">
                        {getCurrentFields().map((field, index) => (
                            <div key={index} className="w-full">
                                {field.type === "select" ? (
                                    <div className="space-y-1">
                                        <label className="block text-sm font-medium text-blue-200">{field.label}</label>
                                        <div className="relative">
                                            <select
                                                value={field.value}
                                                onChange={(e) => field.onChange(e.target.value)}
                                                className="w-full appearance-none bg-blue-900/20 border border-blue-800/50 text-white p-2 pr-8 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option className="bg-blue-950" value="client">
                                                    Client
                                                </option>
                                                <option className="bg-blue-950" value="worker">
                                                    Organization Worker
                                                </option>
                                                <option className="bg-blue-950" value="owner">
                                                    Organization Owner
                                                </option>
                                            </select>
                                            <div
                                                className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                                <svg
                                                    className="h-4 w-4 text-gray-400"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                    aria-hidden="true"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {field.value === "owner"
                                                ? "You'll be able to create and manage an organization"
                                                : field.value === "worker"
                                                    ? "You'll be able to join an organization as a worker"
                                                    : "You'll be able to access services as a client"}
                                        </p>
                                    </div>
                                ) : field.type === "checkbox" ? (
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                checked={field.value as boolean}
                                                onChange={(e) => field.onChange(e.target.checked)}
                                                className="sr-only"
                                            />
                                            <div
                                                className={`w-5 h-5 border ${
                                                    field.value
                                                        ? "bg-gradient-to-r from-blue-600 to-blue-400 border-blue-400"
                                                        : "bg-blue-900/20 border-blue-800/50"
                                                } rounded flex items-center justify-center transition-colors`}
                                            >
                                                {field.value && <CheckCircle2 size={12} className="text-white"/>}
                                            </div>
                                        </div>
                                        <span className="text-sm text-gray-300">{field.label}</span>
                                    </label>
                                ) : field.type === "date" ? (
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-blue-200">{field.label}</label>
                                        <div className="flex flex-wrap gap-2">
                                            {/* Day */}
                                            <div className="flex-1 min-w-[80px]">
                                                <label className="block text-xs text-gray-500 mb-1">Day</label>
                                                <div className="relative">
                                                    <select
                                                        value={age.day}
                                                        onChange={(e) => setAge({...age, day: e.target.value})}
                                                        className="w-full appearance-none bg-blue-900 opacity-65 border border-blue-800/50 text-white p-2 pr-8 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    >
                                                        {Array.from({length: 31}, (_, i) => i + 1).map((day) => (
                                                            <option key={day} value={day}>
                                                                {day}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <div
                                                        className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                                        <svg
                                                            className="h-4 w-4 text-gray-400"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 20 20"
                                                            fill="currentColor"
                                                            aria-hidden="true"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Month */}
                                            <div className="flex-1 min-w-[80px]">
                                                <label className="block text-xs text-gray-500 mb-1">Month</label>
                                                <div className="relative">
                                                    <select
                                                        value={age.month}
                                                        onChange={(e) => setAge({...age, month: e.target.value})}
                                                        className="w-full appearance-none bg-blue-900 opacity-65 border border-blue-800/50 text-white p-2 pr-8 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    >
                                                        {[
                                                            {value: "1", label: "January"},
                                                            {value: "2", label: "February"},
                                                            {value: "3", label: "March"},
                                                            {value: "4", label: "April"},
                                                            {value: "5", label: "May"},
                                                            {value: "6", label: "June"},
                                                            {value: "7", label: "July"},
                                                            {value: "8", label: "August"},
                                                            {value: "9", label: "September"},
                                                            {value: "10", label: "October"},
                                                            {value: "11", label: "November"},
                                                            {value: "12", label: "December"},
                                                        ].map((month) => (
                                                            <option key={month.value} value={month.value}>
                                                                {month.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <div
                                                        className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                                        <svg
                                                            className="h-4 w-4 text-gray-400"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 20 20"
                                                            fill="currentColor"
                                                            aria-hidden="true"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Year */}
                                            <div className="flex-1 min-w-[80px]">
                                                <label className="block text-xs text-gray-500 mb-1">Year</label>
                                                <div className="relative">
                                                    <select
                                                        value={age.year}
                                                        onChange={(e) => setAge({...age, year: e.target.value})}
                                                        className="w-full appearance-none bg-blue-900 opacity-65 border border-blue-800/50 text-white p-2 pr-8 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    >
                                                        {Array.from({length: 100}, (_, i) => new Date().getFullYear() - i).map((year) => (
                                                            <option key={year} value={year}>
                                                                {year}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <div
                                                        className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                                        <svg
                                                            className="h-4 w-4 text-gray-400"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 20 20"
                                                            fill="currentColor"
                                                            aria-hidden="true"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Must be at least 13 years old</p>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        <label className="block text-sm font-medium text-blue-200">{field.label}</label>
                                        <div className="relative">
                                            <input
                                                type={
                                                    field.type === "password" && (field.label === "Password" ? showPassword : showPassword2)
                                                        ? "text"
                                                        : field.type
                                                }
                                                value={field.value as string}
                                                onChange={(e) => field.onChange(e.target.value as any)}
                                                placeholder={field.placeholder}
                                                className={`w-full bg-blue-900/20 border ${
                                                    (field.label === "Username" && nameError) ||
                                                    (field.label === "Email" && emailError) ||
                                                    (field.label === "Password" && passwordError) ||
                                                    (field.label === "Confirm Password" && password2Error)
                                                        ? "border-red-500/50"
                                                        : "border-blue-800/50"
                                                } text-white p-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500`}
                                            />
                                            {field.type === "password" && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        field.label === "Password"
                                                            ? setShowPassword(!showPassword)
                                                            : setShowPassword2(!showPassword2)
                                                    }
                                                    className="absolute right-2 top-2 text-gray-400 hover:text-gray-300"
                                                >
                                                    {field.label === "Password" ? (
                                                        showPassword ? (
                                                            <EyeOff size={16}/>
                                                        ) : (
                                                            <Eye size={16}/>
                                                        )
                                                    ) : showPassword2 ? (
                                                        <EyeOff size={16}/>
                                                    ) : (
                                                        <Eye size={16}/>
                                                    )}
                                                </button>
                                            )}
                                        </div>

                                        {/* Password strength indicator */}
                                        {field.label === "Password" && password && (
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

                                        {/* Error messages */}
                                        {field.label === "Username" && nameError && (
                                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                                <AlertCircle size={12}/>
                                                {nameError}
                                            </p>
                                        )}
                                        {field.label === "Email" && emailError && (
                                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                                <AlertCircle size={12}/>
                                                {emailError}
                                            </p>
                                        )}
                                        {field.label === "Password" && passwordError && (
                                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                                <AlertCircle size={12}/>
                                                {passwordError}
                                            </p>
                                        )}
                                        {field.label === "Confirm Password" && password2Error && (
                                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                                <AlertCircle size={12}/>
                                                {password2Error}
                                            </p>
                                        )}

                                        {/* Field requirements */}
                                        {field.requirements && (
                                            <div className="mt-2">
                                                <p className="text-xs text-gray-500 mb-1">Requirements:</p>
                                                <ul className="space-y-1">
                                                    {field.requirements.map((req, idx) => (
                                                        <li key={idx}
                                                            className="text-xs text-gray-500 flex items-start gap-1">
                                                            <span className="mt-0.5">•</span> {req}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center">
                    {step > 0 ? (
                        <button
                            onClick={handleBackStep}
                            className="px-4 py-2 border border-blue-800/50 rounded-md text-blue-300 hover:bg-blue-900/20 transition-colors text-sm"
                        >
                            Back
                        </button>
                    ) : (
                        <div></div>
                    )}

                    {step < stepLabels.length - 1 ? (
                        <button
                            onClick={handleNextStep}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-400 rounded-md text-white hover:opacity-90 transition-opacity text-sm flex items-center gap-1"
                        >
                            Next <ChevronRight size={16}/>
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-400 rounded-md text-white hover:opacity-90 transition-opacity text-sm"
                        >
                            Create Account
                        </button>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-gray-400 text-sm mb-4">
                        Already have an account?{" "}
                        <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
                            Sign in
                        </Link>
                    </p>

                    <div className="flex justify-center">
                        <GoogleLoginButton text="Sign up with Google"/>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Register
