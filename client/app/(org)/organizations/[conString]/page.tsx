"use client"
import {use, useEffect, useState} from "react"
import axios from "axios"
import {apiUrl} from "@/app/api/config"
import Cookies from "js-cookie"
import {AlertCircle, ArrowLeft, CheckCircle2} from "lucide-react"
import Link from "next/link"
import {motion} from "framer-motion"

interface OrganizationPageProps {
    params: Promise<{
        conString: string
    }>
}

const OrganizationPage = ({params}: OrganizationPageProps) => {
    const {conString} = use(params)
    const [organizationData, setOrganizationData] = useState(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const refreshToken = Cookies.get("azionRefreshToken")
        const accessToken = Cookies.get("azionAccessToken")

        const data = {
            accessToken,
            refreshToken,
        }

        const fetchOrganizationData = async () => {
            try {
                setLoading(true)
                const response = await axios.put(`${apiUrl}/org/con/str/${conString}`, data, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                })
                setOrganizationData(response.data)

                // Redirect after a short delay to show success message
                setTimeout(() => {
                    window.location.href = `/organizations`
                }, 2000)
            } catch (error: any) {
                console.error("Error fetching organization data:", error)
                setError(error.response?.data?.message || "Unable to fetch organization details.")
            } finally {
                setLoading(false)
            }
        }

        fetchOrganizationData()
    }, [conString])

    return (
        <div className="min-h-screen bg-[#040410] text-white flex justify-center items-center p-4">
            <div className="max-w-md w-full">
                {loading ? (
                    <motion.div
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        className="bg-gradient-to-b from-blue-900/10 to-transparent border border-blue-900/30 rounded-lg p-8 text-center"
                    >
                        <div
                            className="w-16 h-16 rounded-full border-4 border-blue-400 border-t-transparent animate-spin mx-auto mb-6"></div>
                        <h2 className="text-xl font-semibold text-white mb-2">Joining Organization</h2>
                        <p className="text-gray-300">Please wait while we process your request...</p>
                    </motion.div>
                ) : error ? (
                    <motion.div
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        className="bg-gradient-to-b from-red-900/10 to-transparent border border-red-900/30 rounded-lg p-8 text-center"
                    >
                        <div className="bg-red-900/20 rounded-full p-4 inline-block mb-4">
                            <AlertCircle className="h-8 w-8 text-red-400"/>
                        </div>
                        <h2 className="text-xl font-semibold text-white mb-2">Error</h2>
                        <p className="text-gray-300 mb-6">{error}</p>
                        <Link href="/organizations">
                            <button
                                className="bg-blue-900/20 hover:bg-blue-900/30 text-blue-300 border border-blue-800/50 font-medium py-2 px-4 rounded-md transition duration-200 flex items-center gap-2 mx-auto">
                                <ArrowLeft size={16}/>
                                <span>Back to Organizations</span>
                            </button>
                        </Link>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        className="bg-gradient-to-b from-green-900/10 to-transparent border border-green-900/30 rounded-lg p-8 text-center"
                    >
                        <div className="bg-green-900/20 rounded-full p-4 inline-block mb-4">
                            <CheckCircle2 className="h-8 w-8 text-green-400"/>
                        </div>
                        <h2 className="text-xl font-semibold text-white mb-2">Success!</h2>
                        <p className="text-gray-300 mb-2">You have successfully joined the organization.</p>
                        <p className="text-gray-400 text-sm mb-6">Redirecting to organizations page...</p>
                        <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-green-500 to-green-300"
                                initial={{width: 0}}
                                animate={{width: "100%"}}
                                transition={{duration: 2}}
                            />
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}

export default OrganizationPage
