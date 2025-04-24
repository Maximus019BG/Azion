"use client"
import {useEffect, useState} from "react"
import axios from "axios"
import {useParams} from "next/navigation"
import {ArrowLeft, Building2, Clock, Mail, MapPin, Phone, Shield, Tag, Users,} from "lucide-react"
import type {Organization} from "@/app/types/types"
import {apiUrl} from "@/app/api/config"
import Link from "next/link"
import {motion} from "framer-motion"

export default function OrganizationPage() {
    const params = useParams()
    const orgId = params.orgId as string
    const [organization, setOrganization] = useState<Organization | undefined>(undefined)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchOrganization = async () => {
            try {
                setLoading(true)
                const response = await axios.get<Organization>(`${apiUrl}/org/get/${orgId}`)
                if (response?.data) {
                    setOrganization(response.data)
                }
            } catch (err) {
                console.error("Error fetching organization:", err)
                setError("Failed to load organization details. Please try again later.")
            } finally {
                setLoading(false)
            }
        }

        if (orgId) {
            fetchOrganization()
        }
    }, [orgId])

    if (loading) {
        return (
            <div className="min-h-screen w-full bg-[#030308] text-white flex justify-center items-center">
                <div className="flex flex-col items-center">
                    <div className="relative w-20 h-20">
                        <div className="absolute inset-0 rounded-full border-4 border-blue-400/20"></div>
                        <div
                            className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-400 animate-spin"></div>
                    </div>
                    <p className="text-blue-300 mt-6 font-medium">Loading organization details...</p>
                </div>
            </div>
        )
    }

    if (error || !organization) {
        return (
            <div className="min-h-screen w-full bg-[#030308] text-white flex justify-center items-center p-4">
                <motion.div
                    initial={{opacity: 0, scale: 0.9}}
                    animate={{opacity: 1, scale: 1}}
                    transition={{duration: 0.5}}
                    className="text-center max-w-md bg-[#0c0c14] border border-red-900/30 rounded-lg p-8"
                >
                    <div className="bg-red-900/20 rounded-full p-6 inline-block mb-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-red-400 h-12 w-12"
                        >
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Error Loading Organization</h3>
                    <p className="text-gray-400 mb-6">{error || "Organization not found"}</p>
                    <Link href="/organizations">
                        <button
                            className="bg-[#1a1a2e] hover:bg-[#252538] text-blue-300 border border-blue-800/50 font-medium py-3 px-6 rounded-md transition duration-200 flex items-center gap-2 mx-auto">
                            <ArrowLeft size={16}/>
                            <span>Back to Organizations</span>
                        </button>
                    </Link>
                </motion.div>
            </div>
        )
    }

    const fadeInUp = {
        hidden: {opacity: 0, y: 20},
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1,
                duration: 0.5,
            },
        }),
    }

    return (
        <div className="min-h-screen w-full text-white pb-16">
            {/* Hero section with organization name and type */}
            <div className="relative w-full ">
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5"></div>
                <div className="container mx-auto max-w-6xl px-4 py-12 relative">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <Link
                                href="/organizations"
                                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors mb-4"
                            >
                                <ArrowLeft size={16}/>
                                <span>Back to Organizations</span>
                            </Link>
                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-300">
                                {organization.orgName}
                            </h1>
                            <div className="flex items-center gap-3 mt-2">
                                <div
                                    className="inline-block bg-[#1a1a2e] border border-blue-800/50 rounded-full px-3 py-1 text-xs font-medium text-blue-300">
                                    {organization.orgType}
                                </div>
                                <div className="h-1.5 w-1.5 rounded-full bg-blue-400/50"></div>
                                <div className="text-blue-300/70 text-sm">ID: {orgId.substring(0, 8)}...</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto max-w-6xl px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main content - left side */}
                    <div className="lg:col-span-2">
                        {/* About section */}
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            custom={0}
                            variants={fadeInUp}
                            className="bg-gradient-to-b from-blue-900/10 to-transparent border border-blue-900/30 rounded-lg overflow-hidden shadow-lg p-6"
                        >
                            <h2 className="text-xl font-semibold flex items-center gap-2 mb-4 text-white">
                                <Building2 className="h-5 w-5 text-blue-400"/>
                                About
                            </h2>
                            <p className="text-gray-300 leading-relaxed">{organization.orgDescription}</p>
                        </motion.div>

                        {/* Organization Stats */}
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            custom={1}
                            variants={fadeInUp}
                            className="bg-gradient-to-b from-blue-900/10 to-transparent border border-blue-900/30 rounded-lg overflow-hidden shadow-lg p-6 mt-8"
                        >
                            <h2 className="text-xl font-semibold flex items-center gap-2 mb-4 text-white">
                                <Shield className="h-5 w-5 text-blue-400"/>
                                Organization Stats
                            </h2>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div
                                    className="bg-gradient-to-b from-blue-900/10 to-transparent border border-blue-900/30 rounded-lg p-4 flex flex-col items-center justify-center">
                                    <Users className="h-6 w-6 text-blue-400 mb-2"/>
                                    <p className="text-2xl font-bold text-white">24</p>
                                    <p className="text-xs text-gray-400">Members</p>
                                </div>

                                <div
                                    className="bg-gradient-to-b from-blue-900/10 to-transparent border border-blue-900/30 rounded-lg p-4 flex flex-col items-center justify-center">
                                    <Clock className="h-6 w-6 text-blue-400 mb-2"/>
                                    <p className="text-2xl font-bold text-white">3y</p>
                                    <p className="text-xs text-gray-400">Active</p>
                                </div>

                                <div
                                    className="bg-gradient-to-b from-blue-900/10 to-transparent border border-blue-900/30 rounded-lg p-4 flex flex-col items-center justify-center">
                                    <Shield className="h-6 w-6 text-blue-400 mb-2"/>
                                    <p className="text-2xl font-bold text-white">A+</p>
                                    <p className="text-xs text-gray-400">Security</p>
                                </div>

                                <div
                                    className="bg-gradient-to-b from-blue-900/10 to-transparent border border-blue-900/30 rounded-lg p-4 flex flex-col items-center justify-center">
                                    <Building2 className="h-6 w-6 text-blue-400 mb-2"/>
                                    <p className="text-2xl font-bold text-white">12</p>
                                    <p className="text-xs text-gray-400">Projects</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Sidebar - right side */}
                    <div>
                        {/* Contact Information */}
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            custom={0}
                            variants={fadeInUp}
                            className="bg-gradient-to-b from-blue-900/10 to-transparent border border-blue-900/30 rounded-lg p-6"
                        >
                            <h2 className="text-xl font-semibold mb-4 text-white">Contact Information</h2>

                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <Mail className="h-5 w-5 text-blue-400 mt-0.5"/>
                                    <div>
                                        <p className="text-sm text-gray-400">Email</p>
                                        <a
                                            href={`mailto:${organization.orgEmail}`}
                                            className="text-white hover:text-blue-300 transition-colors"
                                        >
                                            {organization.orgEmail}
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Phone className="h-5 w-5 text-blue-400 mt-0.5"/>
                                    <div>
                                        <p className="text-sm text-gray-400">Phone</p>
                                        <a
                                            href={`tel:${organization.orgPhone}`}
                                            className="text-white hover:text-blue-300 transition-colors"
                                        >
                                            {organization.orgPhone}
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 text-blue-400 mt-0.5"/>
                                    <div>
                                        <p className="text-sm text-gray-400">Address</p>
                                        <p className="text-white">{organization.orgAddress}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Tag className="h-5 w-5 text-blue-400 mt-0.5"/>
                                    <div>
                                        <p className="text-sm text-gray-400">Type</p>
                                        <p className="text-white">{organization.orgType}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Back button at the bottom */}
                <div className="mt-12 text-center">
                    <Link href="/organizations">
                        <button
                            className="bg-[#1a1a2e] hover:bg-[#252538] text-blue-300 border border-blue-800/50 font-medium py-2 px-4 rounded-md transition duration-200 flex items-center gap-2 mx-auto">
                            <ArrowLeft size={16}/>
                            <span>Back to Organizations</span>
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
