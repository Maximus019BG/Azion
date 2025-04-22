"use client"
import {useEffect, useState} from "react"
import axios from "axios"
import {useParams, useRouter} from "next/navigation"
import {
    ArrowLeft,
    Building2,
    Calendar,
    ChevronRight,
    Clock,
    ExternalLink,
    Globe,
    Mail,
    MapPin,
    Phone,
    Settings,
    Shield,
    Tag,
    Users,
} from "lucide-react"
import type {Organization} from "@/app/types/types"
import {apiUrl} from "@/app/api/config"
import Link from "next/link"
import {motion} from "framer-motion"

// Mock data for additional sections
const teamMembers = [
    {id: 1, name: "Alex Johnson", role: "CEO", avatar: "/placeholder.svg?height=40&width=40"},
    {id: 2, name: "Sarah Williams", role: "CTO", avatar: "/placeholder.svg?height=40&width=40"},
    {id: 3, name: "Michael Chen", role: "Lead Developer", avatar: "/placeholder.svg?height=40&width=40"},
]

const recentActivities = [
    {id: 1, action: "Project created", date: "2 days ago"},
    {id: 2, action: "New member joined", date: "1 week ago"},
    {id: 3, action: "Updated organization details", date: "2 weeks ago"},
]

export default function OrganizationPage() {
    const params = useParams()
    const router = useRouter()
    const orgId = params.orgId as string
    const [organization, setOrganization] = useState<Organization | undefined>(undefined)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState("overview")

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
            <div className="min-h-screen w-full text-white flex justify-center items-center">
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
            <div className="min-h-screen  text-white flex justify-center items-center p-4">
                <motion.div
                    initial={{opacity: 0, scale: 0.9}}
                    animate={{opacity: 1, scale: 1}}
                    transition={{duration: 0.5}}
                    className="text-center max-w-md bg-gradient-to-b from-red-900/20 to-transparent border border-red-900/30 rounded-lg p-8"
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
                            className="bg-blue-900/20 hover:bg-blue-900/30 text-blue-300 border border-blue-800/50 font-medium py-3 px-6 rounded-md transition duration-200 flex items-center gap-2 mx-auto">
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
            <div className="relative w-full">
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>
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
                                    className="inline-block bg-blue-900/30 border border-blue-800/50 rounded-full px-3 py-1 text-xs font-medium text-blue-300">
                                    {organization.orgType}
                                </div>
                                <div className="h-1.5 w-1.5 rounded-full bg-blue-400/50"></div>
                                <div className="text-blue-300/70 text-sm">ID: {orgId.substring(0, 8)}...</div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <a
                                href={`mailto:${organization.orgEmail}`}
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 text-white font-medium py-2 px-4 rounded-md transition duration-200"
                            >
                                <Mail size={16}/>
                                <span>Contact</span>
                            </a>
                            <button
                                onClick={() => router.push(`/organizations/join/${orgId}`)}
                                className="inline-flex items-center gap-2 bg-blue-900/30 hover:bg-blue-900/50 text-blue-300 border border-blue-800/50 font-medium py-2 px-4 rounded-md transition duration-200"
                            >
                                <Users size={16}/>
                                <span>Join Organization</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation tabs */}
            <div className="sticky top-0 z-10 bg-[#0e1014] rounded-lg">
                <div className="container mx-auto max-w-6xl px-4">
                    <div className="flex overflow-x-auto scrollbar-hide">
                        <button
                            onClick={() => setActiveTab("overview")}
                            className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                                activeTab === "overview"
                                    ? "border-blue-400 text-blue-400"
                                    : "border-transparent text-gray-400 hover:text-gray-300"
                            }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab("team")}
                            className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                                activeTab === "team"
                                    ? "border-blue-400 text-blue-400"
                                    : "border-transparent text-gray-400 hover:text-gray-300"
                            }`}
                        >
                            Team
                        </button>
                        <button
                            onClick={() => setActiveTab("activity")}
                            className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                                activeTab === "activity"
                                    ? "border-blue-400 text-blue-400"
                                    : "border-transparent text-gray-400 hover:text-gray-300"
                            }`}
                        >
                            Activity
                        </button>
                        <button
                            onClick={() => setActiveTab("settings")}
                            className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                                activeTab === "settings"
                                    ? "border-blue-400 text-blue-400"
                                    : "border-transparent text-gray-400 hover:text-gray-300"
                            }`}
                        >
                            Settings
                        </button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto max-w-6xl px-4 py-8">
                {/* Overview Tab */}
                {activeTab === "overview" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main content - left side */}
                        <div className="lg:col-span-2 space-y-8">
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

                            {/* Location section */}
                            <motion.div
                                initial="hidden"
                                animate="visible"
                                custom={1}
                                variants={fadeInUp}
                                className="bg-gradient-to-b from-blue-900/10 to-transparent border border-blue-900/30 rounded-lg overflow-hidden shadow-lg p-6"
                            >
                                <h2 className="text-xl font-semibold flex items-center gap-2 mb-4 text-white">
                                    <MapPin className="h-5 w-5 text-blue-400"/>
                                    Location
                                </h2>
                                <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-900/30">
                                    <p className="text-gray-300">{organization.orgAddress}</p>
                                </div>
                                <div className="mt-4 bg-blue-900/20 rounded-lg overflow-hidden h-48 relative">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <p className="text-blue-300/70">Map view would appear here</p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Projects section */}
                            <motion.div
                                initial="hidden"
                                animate="visible"
                                custom={2}
                                variants={fadeInUp}
                                className="bg-gradient-to-b from-blue-900/10 to-transparent border border-blue-900/30 rounded-lg overflow-hidden shadow-lg p-6"
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold flex items-center gap-2 text-white">
                                        <Globe className="h-5 w-5 text-blue-400"/>
                                        Projects
                                    </h2>
                                    <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">View
                                        All
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {[1, 2, 3].map((project) => (
                                        <div
                                            key={project}
                                            className="bg-blue-900/20 border border-blue-900/30 rounded-lg p-4 hover:bg-blue-900/30 transition-colors cursor-pointer"
                                        >
                                            <div className="flex justify-between items-center">
                                                <h3 className="font-medium text-white">Project {project}</h3>
                                                <ChevronRight size={16} className="text-blue-400"/>
                                            </div>
                                            <p className="text-sm text-gray-400 mt-1">
                                                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                                            </p>
                                            <div className="flex items-center gap-2 mt-3">
                                                <div
                                                    className="text-xs bg-blue-900/40 text-blue-300 px-2 py-0.5 rounded">Active
                                                </div>
                                                <div className="text-xs text-gray-400">Updated 3 days ago</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        {/* Sidebar - right side */}
                        <div className="space-y-8">
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
                                        <Tag className="h-5 w-5 text-blue-400 mt-0.5"/>
                                        <div>
                                            <p className="text-sm text-gray-400">Type</p>
                                            <p className="text-white">{organization.orgType}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Calendar className="h-5 w-5 text-blue-400 mt-0.5"/>
                                        <div>
                                            <p className="text-sm text-gray-400">Established</p>
                                            <p className="text-white">January 2023</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Team Members Preview */}
                            <motion.div
                                initial="hidden"
                                animate="visible"
                                custom={1}
                                variants={fadeInUp}
                                className="bg-gradient-to-b from-blue-900/10 to-transparent border border-blue-900/30 rounded-lg p-6"
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold text-white">Team</h2>
                                    <button
                                        onClick={() => setActiveTab("team")}
                                        className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                                    >
                                        View All
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {teamMembers.map((member) => (
                                        <div key={member.id} className="flex items-center gap-3">
                                            <div
                                                className="w-10 h-10 rounded-full bg-blue-900/30 border border-blue-800/50 overflow-hidden">
                                                <img
                                                    src={member.avatar || "/placeholder.svg"}
                                                    alt={member.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">{member.name}</p>
                                                <p className="text-sm text-gray-400">{member.role}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Security Status */}
                            <motion.div
                                initial="hidden"
                                animate="visible"
                                custom={2}
                                variants={fadeInUp}
                                className="bg-gradient-to-b from-blue-900/10 to-transparent border border-blue-900/30 rounded-lg p-6"
                            >
                                <h2 className="text-xl font-semibold flex items-center gap-2 mb-4 text-white">
                                    <Shield className="h-5 w-5 text-blue-400"/>
                                    Security Status
                                </h2>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <p className="text-gray-300">2FA Enabled</p>
                                        <div className="w-4 h-4 rounded-full bg-green-500"></div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-gray-300">SSL Certificate</p>
                                        <div className="w-4 h-4 rounded-full bg-green-500"></div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-gray-300">Data Encryption</p>
                                        <div className="w-4 h-4 rounded-full bg-green-500"></div>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-blue-900/30">
                                    <div className="flex items-center justify-between">
                                        <p className="text-white font-medium">Security Score</p>
                                        <p className="text-green-400 font-bold">A+</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                )}

                {/* Team Tab */}
                {activeTab === "team" && (
                    <motion.div
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        transition={{duration: 0.5}}
                        className="bg-gradient-to-b from-blue-900/10 to-transparent border border-blue-900/30 rounded-lg overflow-hidden shadow-lg p-6"
                    >
                        <h2 className="text-xl font-semibold flex items-center gap-2 mb-6 text-white">
                            <Users className="h-5 w-5 text-blue-400"/>
                            Team Members
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...teamMembers, ...teamMembers, ...teamMembers].map((member, index) => (
                                <motion.div
                                    key={`${member.id}-${index}`}
                                    initial="hidden"
                                    animate="visible"
                                    custom={index}
                                    variants={fadeInUp}
                                    className="bg-blue-900/20 border border-blue-900/30 rounded-lg p-4 hover:bg-blue-900/30 transition-all hover:scale-[1.02] cursor-pointer"
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="w-14 h-14 rounded-full bg-blue-900/30 border border-blue-800/50 overflow-hidden">
                                            <img
                                                src={member.avatar || "/placeholder.svg"}
                                                alt={member.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-white font-medium text-lg">{member.name}</p>
                                            <p className="text-blue-300">{member.role}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-blue-900/30">
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-blue-400"/>
                                            <p className="text-sm text-gray-300">member{index}@example.com</p>
                                        </div>
                                        <div className="flex justify-between mt-3">
                                            <div
                                                className="text-xs bg-blue-900/40 text-blue-300 px-2 py-0.5 rounded">Active
                                            </div>
                                            <button
                                                className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                                                View Profile
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Activity Tab */}
                {activeTab === "activity" && (
                    <motion.div
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        transition={{duration: 0.5}}
                        className="bg-gradient-to-b from-blue-900/10 to-transparent border border-blue-900/30 rounded-lg overflow-hidden shadow-lg p-6"
                    >
                        <h2 className="text-xl font-semibold flex items-center gap-2 mb-6 text-white">
                            <Clock className="h-5 w-5 text-blue-400"/>
                            Recent Activity
                        </h2>

                        <div className="relative pl-6 border-l border-blue-900/50">
                            {[...recentActivities, ...recentActivities, ...recentActivities].map((activity, index) => (
                                <motion.div
                                    key={`${activity.id}-${index}`}
                                    initial="hidden"
                                    animate="visible"
                                    custom={index}
                                    variants={fadeInUp}
                                    className="mb-8 relative"
                                >
                                    <div
                                        className="absolute -left-[29px] w-4 h-4 rounded-full bg-blue-500 border-4 border-[#040410]"></div>
                                    <div className="bg-blue-900/20 border border-blue-900/30 rounded-lg p-4">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-medium text-white">{activity.action}</h3>
                                            <span className="text-xs text-gray-400">{activity.date}</span>
                                        </div>
                                        <p className="text-sm text-gray-300 mt-2">
                                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
                                            tempor incididunt ut
                                            labore.
                                        </p>
                                        <div className="mt-3 flex items-center gap-2">
                                            <div
                                                className="w-6 h-6 rounded-full bg-blue-900/30 border border-blue-800/50 overflow-hidden">
                                                <img
                                                    src="/placeholder.svg?height=24&width=24"
                                                    alt="User"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <span className="text-xs text-blue-300">John Doe</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Settings Tab */}
                {activeTab === "settings" && (
                    <motion.div
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        transition={{duration: 0.5}}
                        className="bg-gradient-to-b from-blue-900/10 to-transparent border border-blue-900/30 rounded-lg overflow-hidden shadow-lg p-6"
                    >
                        <h2 className="text-xl font-semibold flex items-center gap-2 mb-6 text-white">
                            <Settings className="h-5 w-5 text-blue-400"/>
                            Organization Settings
                        </h2>

                        <div className="space-y-6">
                            <div className="bg-blue-900/20 border border-blue-900/30 rounded-lg p-4">
                                <h3 className="font-medium text-white mb-2">Connection String</h3>
                                <p className="text-sm text-gray-300 mb-4">
                                    Use this connection string to join this organization or connect your applications.
                                </p>
                                <div className="flex items-center gap-2">
                                    <div
                                        className="bg-blue-900/40 border border-blue-800/50 rounded px-3 py-2 text-blue-300 font-mono text-sm flex-1 truncate">
                                        org_{orgId.substring(0, 16)}...
                                    </div>
                                    <button
                                        className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded transition-colors">
                                        Copy
                                    </button>
                                </div>
                            </div>

                            <div className="bg-blue-900/20 border border-blue-900/30 rounded-lg p-4">
                                <h3 className="font-medium text-white mb-2">API Access</h3>
                                <p className="text-sm text-gray-300 mb-4">Manage API keys and access tokens for this
                                    organization.</p>
                                <button
                                    className="bg-blue-900/30 hover:bg-blue-900/50 text-blue-300 border border-blue-800/50 px-4 py-2 rounded transition-colors flex items-center gap-2">
                                    <ExternalLink size={16}/>
                                    <span>Manage API Keys</span>
                                </button>
                            </div>

                            <div className="bg-blue-900/20 border border-blue-900/30 rounded-lg p-4">
                                <h3 className="font-medium text-white mb-2">Danger Zone</h3>
                                <p className="text-sm text-gray-300 mb-4">These actions are destructive and cannot be
                                    undone.</p>
                                <div className="space-y-3">
                                    <button
                                        className="bg-red-900/20 hover:bg-red-900/30 text-red-400 border border-red-900/30 px-4 py-2 rounded w-full text-left transition-colors">
                                        Leave Organization
                                    </button>
                                    <button
                                        className="bg-red-900/20 hover:bg-red-900/30 text-red-400 border border-red-900/30 px-4 py-2 rounded w-full text-left transition-colors">
                                        Delete Organization
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
