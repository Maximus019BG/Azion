"use client"
import type React from "react"
import {useEffect, useState} from "react"
import axios from "axios"
import {apiUrl} from "@/app/api/config"
import {Space_Grotesk} from "next/font/google"
import Cookies from "js-cookie"
import Link from "next/link"
import {ArrowLeft, Briefcase, Building2, CheckCircle2, Copy, FileText, Loader2, Mail, MapPin, Phone} from "lucide-react"
import {PartOfOrg, sessionCheck} from "@/app/func/funcs"
import {motion} from "framer-motion"

const spaceGrotesk = Space_Grotesk({subsets: ["latin"], weight: ["600", "700"], display: "swap"})

interface FormField {
    id: string
    label: string
    placeholder: string
    type: string
    value: string
    onChange: (value: string) => void
    icon: React.ReactNode
    required?: boolean
}

const Register_Organisation = () => {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [address, setAddress] = useState("")
    const [type, setType] = useState("")
    const [phone, setPhone] = useState("")
    const [description, setDescription] = useState("")
    const [step, setStep] = useState(0)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [conString, setConString] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(conString).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        })
    }

    useEffect(() => {
        const refreshToken = Cookies.get("azionRefreshToken")
        const accessToken = Cookies.get("azionAccessToken")
        if (refreshToken && accessToken) {
            sessionCheck()
            PartOfOrg(false)
        } else if (!accessToken && !refreshToken) {
            window.location.href = "/login"
        }
    }, [])

    const validateStep = () => {
        const errors: Record<string, string> = {}
        const currentFields = getCurrentFields()

        currentFields.forEach((field) => {
            if (field.required && !field.value.trim()) {
                errors[field.id] = `${field.label} is required`
            }
        })

        // Email validation for step 0
        if (step === 0 && email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = "Please enter a valid email address"
        }

        // Phone validation for step 1
        if (step === 1 && phone && !/^\+?[0-9\s\-()]{8,20}$/.test(phone)) {
            errors.phone = "Please enter a valid phone number"
        }

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSubmit = () => {
        const missingFields = [];
        if (!name) missingFields.push("Name");
        if (!email) missingFields.push("Email");
        if (!address) missingFields.push("Address");
        if (!type) missingFields.push("Type");
        if (!phone) missingFields.push("Phone");
        if (!description) missingFields.push("Description");

        if (missingFields.length > 0) {
            alert(`Please fill in all fields. The following fields are missing: ${missingFields.join(", ")}`);
            return;
        }

        const data = {
            orgName: name,
            orgEmail: email,
            orgAddress: address,
            orgType: type,
            orgPhone: phone,
            orgDescription: description,
            accessToken: Cookies.get("azionAccessToken"),
        };

        axios
            .post(`${apiUrl}/org/create`, data, {
                headers: {
                    "Content-Type": "application/json",
                },
            })
            .then((response) => {
                setConString(response.data);
                setIsSubmitted(true);
            })
            .catch((error) => {
                alert(
                    "An error occurred, please try again. Error: " +
                    error.response.data.message
                );
            });
    };

    const handleNextStep = () => {
        if (validateStep()) {
            if (step < stepLabels.length - 1) {
                setStep(step + 1)
            }
        }
    }

    const handlePreviousStep = () => {
        if (step > 0) {
            setStep(step - 1)
        }
    }

    const formFields: FormField[] = [
        {
            id: "name",
            label: "Organization Name",
            placeholder: "Enter organization name",
            type: "text",
            value: name,
            onChange: setName,
            icon: <Building2 size={18} className="text-blue-400"/>,
            required: true,
        },
        {
            id: "email",
            label: "Organization Email",
            placeholder: "Enter organization email",
            type: "email",
            value: email,
            onChange: setEmail,
            icon: <Mail size={18} className="text-blue-400"/>,
            required: true,
        },
        {
            id: "address",
            label: "Organization Address",
            placeholder: "Enter organization address",
            type: "text",
            value: address,
            onChange: setAddress,
            icon: <MapPin size={18} className="text-blue-400"/>,
            required: true,
        },
        {
            id: "phone",
            label: "Organization Phone",
            placeholder: "Enter organization phone",
            type: "tel",
            value: phone,
            onChange: setPhone,
            icon: <Phone size={18} className="text-blue-400"/>,
            required: true,
        },
        {
            id: "type",
            label: "Type of Organization",
            placeholder: "Enter organization type",
            type: "text",
            value: type,
            onChange: setType,
            icon: <Briefcase size={18} className="text-blue-400"/>,
            required: true,
        },
        {
            id: "description",
            label: "Organization Description",
            placeholder: "Enter organization description",
            type: "textarea",
            value: description,
            onChange: setDescription,
            icon: <FileText size={18} className="text-blue-400"/>,
            required: true,
        },
    ]

    const getCurrentFields = () => {
        switch (step) {
            case 0:
                return formFields.slice(0, 2) // Name and Email
            case 1:
                return formFields.slice(2, 4) // Address and Phone
            case 2:
                return formFields.slice(4, 6) // Type and Description
            default:
                return []
        }
    }

    const stepLabels = ["Organization Info", "Contact Details", "Type & Description", "Review & Submit"]

    // Connection string component
    const ConnectionString = ({value}: { value: string }) => (
        <motion.div
            initial={{opacity: 0, scale: 0.95}}
            animate={{opacity: 1, scale: 1}}
            className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-6 max-w-md w-full"
        >
            <div className="flex items-center justify-center mb-4 text-green-400">
                <CheckCircle2 size={48}/>
            </div>
            <h3 className={`text-xl font-bold mb-4 text-center text-blue-100 ${spaceGrotesk.className}`}>
                Organization Created Successfully
            </h3>
            <p className="text-gray-300 mb-4 text-sm text-center">
                Your organization has been created. Use the connection string below to connect to your organization.

            </p>
            <div className="bg-blue-950/50 flex justify-between items-center p-3 rounded-md mb-4 overflow-x-auto">
                <code className="text-blue-300 text-sm break-all">{value}</code>
                <button
                    onClick={handleCopy}
                    className="text-blue-300 hover:text-blue-100 transition"
                    title="Copy to clipboard"
                >
                    <Copy size={18}/>
                </button>
            </div>
            <div className="flex justify-center">
                <Link href="/organizations">
                    <button
                        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-400 rounded-md text-white hover:opacity-90 transition-opacity text-sm">
                        Go to Organizations
                    </button>
                </Link>
            </div>
        </motion.div>
    )

    // Review component
    const ReviewInformation = () => (
        <motion.div
            initial={{opacity: 0, y: 10}}
            animate={{opacity: 1, y: 0}}
            className="w-full"
        >
            <h3 className="text-lg font-medium mb-4 text-blue-200">
                Review Organization Information
            </h3>
            <div className="space-y-3 mb-6">
                {formFields.map((field) => (
                    <div
                        key={field.id}
                        className="flex items-start gap-3 bg-blue-900/10 p-3 rounded-md break-words"
                    >
                        <div className="mt-1">{field.icon}</div>
                        <div className="text-wrap break-words max-w-full overflow-hidden">
                            <p className="text-xs text-gray-400">{field.label}</p>
                            <p className="text-sm text-white break-words">
                                {field.value || "Not provided"}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>

    )

    return (
        <div
            className="min-h-screen  text-white flex flex-col justify-center items-center p-4 md:p-8 relative">
            {/* Background gradient */}
            <div
                className="fixed inset-0 bg-gradient-to-b from-blue-950/20 via-[#040410] to-[#040410] pointer-events-none"/>

            {/* Blue gradient orb */}
            <div
                className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] opacity-30 pointer-events-none"/>

            {/* Back Button */}
            <Link
                href="/organizations"
                className="absolute top-4 left-4 flex items-center gap-1 text-blue-300 hover:text-blue-200 transition-colors"
            >
                <ArrowLeft size={16}/>
                <span className="text-sm">Back to Organizations</span>
            </Link>

            <div className="w-full max-w-md mx-auto relative z-10">
                {/* Header */}
                <motion.h1
                    initial={{opacity: 0, y: -20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.5}}
                    className={`text-3xl md:text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent ${spaceGrotesk.className}`}
                >
                    Register Organization
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

                {/* Error Message */}
                {error && (
                    <motion.div
                        initial={{opacity: 0, y: 10}}
                        animate={{opacity: 1, y: 0}}
                        className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-md text-red-400 text-sm text-center"
                    >
                        {error}
                    </motion.div>
                )}

                {/* Form or Success Message */}
                {isSubmitted ? (
                    <ConnectionString value={conString}/>
                ) : (
                    <motion.div
                        key={step}
                        initial={{opacity: 0, x: 20}}
                        animate={{opacity: 1, x: 0}}
                        exit={{opacity: 0, x: -20}}
                        transition={{duration: 0.3}}
                        className="bg-blue-900/10 border border-blue-900/20 rounded-md p-6 mb-6"
                    >
                        <h2 className={`text-xl font-semibold mb-4 text-blue-100 ${spaceGrotesk.className}`}>{stepLabels[step]}</h2>

                        {step === 3 ? (
                            <ReviewInformation/>
                        ) : (
                            <div className="space-y-4">
                                {getCurrentFields().map((field) => (
                                    <div key={field.id} className="space-y-1">
                                        <label className="block text-sm font-medium text-blue-200">{field.label}</label>
                                        <div className="relative">
                                            {field.type === "textarea" ? (
                                                <div className="flex">
                                                    <div
                                                        className="bg-blue-900/30 border-y border-l border-blue-800/50 rounded-l-md p-2">
                                                        {field.icon}
                                                    </div>
                                                    <textarea
                                                        value={field.value}
                                                        onChange={(e) => field.onChange(e.target.value)}
                                                        placeholder={field.placeholder}
                                                        rows={4}
                                                        className={`w-full bg-blue-900/20 border ${
                                                            formErrors[field.id] ? "border-red-500/50" : "border-blue-800/50"
                                                        } border-l-0 text-white p-2 rounded-r-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500`}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex">
                                                    <div
                                                        className="bg-blue-900/30 border-y border-l border-blue-800/50 rounded-l-md p-2">
                                                        {field.icon}
                                                    </div>
                                                    <input
                                                        type={field.type}
                                                        value={field.value}
                                                        onChange={(e) => field.onChange(e.target.value)}
                                                        placeholder={field.placeholder}
                                                        className={`w-full bg-blue-900/20 border ${
                                                            formErrors[field.id] ? "border-red-500/50" : "border-blue-800/50"
                                                        } border-l-0 text-white p-2 rounded-r-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500`}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        {formErrors[field.id] &&
                                            <p className="text-red-500 text-xs mt-1">{formErrors[field.id]}</p>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Navigation Buttons */}
                {!isSubmitted && (
                    <div className="flex justify-between items-center">
                        {step > 0 ? (
                            <button
                                onClick={handlePreviousStep}
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
                                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-400 rounded-md text-white hover:opacity-90 transition-opacity text-sm"
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className={`px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-400 rounded-md text-white hover:opacity-90 transition-opacity text-sm flex items-center gap-2 ${
                                    isLoading ? "opacity-70 cursor-not-allowed" : ""
                                }`}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin"/>
                                        Creating...
                                    </>
                                ) : (
                                    "Create Organization"
                                )}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Register_Organisation
