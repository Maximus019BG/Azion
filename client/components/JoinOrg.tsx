"use client"
import {useEffect, useRef, useState} from "react"
import {Space_Grotesk} from "next/font/google"
import axios from "axios"
import {apiUrl} from "@/app/api/config"
import Cookies from "js-cookie"
import {AnimatePresence, motion} from "framer-motion"
import {Building, LinkIcon, PlusCircle, X} from "lucide-react"

const spaceGrotesk = Space_Grotesk({subsets: ["latin"], weight: "700"})

interface JoinOrganizationProps {
    onClose: () => void
    initialTab?: "join" | "create"
}

const JoinOrganization = ({onClose, initialTab = "join"}: JoinOrganizationProps) => {
    const [activeTab, setActiveTab] = useState<"join" | "create">(initialTab)
    const [connString, setConnString] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const modalRef = useRef<HTMLDivElement>(null)

    const handleSubmit = async () => {
        if (connString === "") {
            setError("Please enter a connection code")
            return
        }

        setIsLoading(true)
        setError(null)

        const accessToken = Cookies.get("azionAccessToken")
        const data = {
            connString: connString,
            accessToken: accessToken,
        }

        try {
            await axios.post(`${apiUrl}/org/join`, data, {
                headers: {
                    "Content-Type": "application/json",
                },
            })
            window.location.href = "/organizations"
        } catch (error: any) {
            setError(error.response?.data?.message || "An error occurred. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const createOne = () => {
        window.location.href = "/register/organization"
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose()
            }
        }

        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose()
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        document.addEventListener("keydown", handleEscKey)

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
            document.removeEventListener("keydown", handleEscKey)
        }
    }, [onClose])

    return (
        <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
            <motion.div
                ref={modalRef}
                initial={{scale: 0.9, y: 20}}
                animate={{scale: 1, y: 0}}
                exit={{scale: 0.9, y: 20}}
                className="w-full max-w-md bg-gradient-to-b from-[#0f172a] to-[#0c1425] border border-blue-900/30 rounded-lg shadow-[0_0_30px_rgba(14,165,233,0.15)] overflow-hidden"
            >
                {/* Header with gradient */}
                <div className="bg-gradient-to-r from-blue-900/40 to-blue-800/20 p-6 relative">
                    <button
                        onClick={onClose}
                        className="absolute right-5 top-5 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10 p-1"
                        aria-label="Close"
                    >
                        <X size={18}/>
                    </button>
                    <div className="flex items-center gap-3">
                        <div
                            className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                            <Building className="h-5 w-5"/>
                        </div>
                        <div>
                            <h2 className={`text-2xl font-bold text-white ${spaceGrotesk.className}`}>Organizations</h2>
                            <p className="text-gray-300 text-sm mt-0.5">Join or create an organization</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-blue-900/30">
                    <button
                        onClick={() => setActiveTab("join")}
                        className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                            activeTab === "join" ? "text-blue-400" : "text-gray-400 hover:text-gray-300"
                        }`}
                    >
                        Join Existing
                        {activeTab === "join" && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                                initial={false}
                            />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("create")}
                        className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                            activeTab === "create" ? "text-blue-400" : "text-gray-400 hover:text-gray-300"
                        }`}
                    >
                        Create New
                        {activeTab === "create" && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                                initial={false}
                            />
                        )}
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === "join" ? (
                        <motion.div
                            key="join"
                            initial={{opacity: 0, y: 10}}
                            animate={{opacity: 1, y: 0}}
                            exit={{opacity: 0, y: -10}}
                            transition={{duration: 0.2}}
                            className="p-6"
                        >
                            <div className="mb-5">
                                <label htmlFor="connString" className="block text-sm font-medium text-gray-300 mb-1.5">
                                    Connection Code
                                </label>
                                <div className="relative">
                                    <input
                                        id="connString"
                                        type="text"
                                        placeholder="Enter connection code"
                                        className="w-full bg-[#111827]/50 border border-blue-900/40 rounded-lg py-3 px-4 pl-10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                                        value={connString}
                                        onChange={(e) => setConnString(e.target.value)}
                                    />
                                    <LinkIcon
                                        className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-blue-400"
                                        size={16}/>
                                </div>
                                {error && (
                                    <motion.p
                                        initial={{opacity: 0, y: -5}}
                                        animate={{opacity: 1, y: 0}}
                                        className="text-red-400 text-xs mt-2 flex items-center"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-3.5 w-3.5 mr-1"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        {error}
                                    </motion.p>
                                )}
                            </div>

                            <button
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2 disabled:opacity-70 shadow-[0_0_15px_rgba(37,99,235,0.2)]"
                                onClick={handleSubmit}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <svg
                                            className="animate-spin h-4 w-4 text-white"
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
                                        <span>Joining...</span>
                                    </>
                                ) : (
                                    <>
                                        <LinkIcon size={16}/>
                                        <span>Join Organization</span>
                                    </>
                                )}
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="create"
                            initial={{opacity: 0, y: 10}}
                            animate={{opacity: 1, y: 0}}
                            exit={{opacity: 0, y: -10}}
                            transition={{duration: 0.2}}
                            className="p-6"
                        >
                            <div className="mb-5">
                                <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-900/30">
                                    <h3 className="text-sm font-medium text-blue-300 mb-2">Create a New
                                        Organization</h3>
                                    <p className="text-xs text-gray-300 leading-relaxed">
                                        Creating a new organization allows you to collaborate with team members, manage
                                        projects together,
                                        and share resources efficiently.
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={createOne}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.2)]"
                            >
                                <PlusCircle size={16}/>
                                <span>Create New Organization</span>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    )
}

export default JoinOrganization
