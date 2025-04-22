"use client"
import {useEffect, useRef, useState} from "react"
import {Space_Grotesk} from "next/font/google"
import axios from "axios"
import {apiUrl} from "@/app/api/config"
import Cookies from "js-cookie"
import {motion} from "framer-motion"
import {LinkIcon, PlusCircle, X} from "lucide-react"

const spaceGrotesk = Space_Grotesk({subsets: ["latin"], weight: "700"})

const Join_Organization = ({onClose}: { onClose: () => void }) => {
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
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
            <motion.div
                ref={modalRef}
                initial={{scale: 0.9, y: 20}}
                animate={{scale: 1, y: 0}}
                exit={{scale: 0.9, y: 20}}
                className="w-full max-w-md bg-[#080818] border border-blue-900/30 rounded-lg shadow-2xl overflow-hidden"
            >
                {/* Header with gradient */}
                <div className="bg-gradient-to-r from-blue-900/30 to-blue-800/20 p-5 relative">
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
                        aria-label="Close"
                    >
                        <X size={20}/>
                    </button>
                    <h2 className={`text-2xl font-bold text-white ${spaceGrotesk.className}`}>Join Organization</h2>
                    <p className="text-gray-300 text-sm mt-1">Enter the connection code to join an organization</p>
                </div>

                <div className="p-5">
                    <div className="mb-5">
                        <label htmlFor="connString" className="block text-sm font-medium text-gray-300 mb-1">
                            Connection Code
                        </label>
                        <div className="relative">
                            <input
                                id="connString"
                                type="text"
                                placeholder="Enter connection code"
                                className="w-full bg-blue-900/10 border border-blue-800/50 rounded-md py-2.5 px-4 pl-10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={connString}
                                onChange={(e) => setConnString(e.target.value)}
                            />
                            <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400"
                                      size={16}/>
                        </div>
                        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 text-white font-medium py-2.5 px-4 rounded-md transition duration-200 flex items-center justify-center gap-2 disabled:opacity-70"
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

                        <div className="relative flex items-center justify-center">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-blue-900/30"></div>
                            </div>
                            <div className="relative bg-[#080818] px-4">
                                <span className="text-xs text-gray-500">or</span>
                            </div>
                        </div>

                        <button
                            onClick={createOne}
                            className="w-full bg-blue-900/20 hover:bg-blue-900/30 text-blue-300 border border-blue-800/50 font-medium py-2.5 px-4 rounded-md transition duration-200 flex items-center justify-center gap-2"
                        >
                            <PlusCircle size={16}/>
                            <span>Create New Organization</span>
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    )
}

export default Join_Organization
