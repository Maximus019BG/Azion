"use client"
import {useEffect, useState} from "react"
import {Poppins} from "next/font/google"
import Cookies from "js-cookie"
import {sessionCheck, UserData} from "@/app/func/funcs"
import {BarChart3, CalendarIcon, CheckSquare, LayoutDashboard, Loader2, Users, Wifi} from "lucide-react"
import DashboardTasks from "@/components/_dashboard/dashboard-tasks"
import DashboardCalendar from "@/components/_dashboard/dashboard-calendar"
import {Dialog, DialogContent} from "@/components/ui/dialog"
import {motion} from "framer-motion"
import Link from "next/link"

const headerText = Poppins({subsets: ["latin"], weight: "900"})

const Dashboard = () => {
    const [displayName, setDisplayName] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(true)
    const [isCalendarExpanded, setIsCalendarExpanded] = useState<boolean>(false)
    const [calendarView, setCalendarView] = useState<"month" | "week" | "day">("month")

    useEffect(() => {
        const fetchData = async () => {
            try {
                const refreshToken = Cookies.get("azionRefreshToken")
                const accessToken = Cookies.get("azionAccessToken")
                if (refreshToken && accessToken) {
                    await sessionCheck()
                    const userData = await UserData()
                    setDisplayName(userData.name)
                    setLoading(false)
                } else {
                    window.location.href = "/login"
                }
            } catch (error) {
                console.error("Error fetching data:", error)
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    if (loading) {
        return (
            <div
                className="w-full h-screen flex justify-center items-center bg-gradient-to-br from-[#050505] to-[#0c0c0c]">
                <div className="flex flex-col items-center">
                    <Loader2 className="h-10 w-10 animate-spin text-[#0ea5e9] mb-4"/>
                    <span className="text-gray-400">Loading dashboard...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-[#050505] to-[#0c0c0c] text-white">
            <div className="container mx-auto px-4 py-6 md:py-8">
                {/* Dashboard Header */}
                <motion.div
                    initial={{opacity: 0, y: -20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.5}}
                    className="mb-8"
                >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1
                                className={`${headerText.className} text-3xl md:text-4xl lg:text-5xl bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] bg-clip-text text-transparent`}
                            >
                                Dashboard
                            </h1>
                            <p className="text-gray-400 mt-2">
                                Welcome back, <span className="text-[#0ea5e9]">{displayName}</span>
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <div className="bg-[#0c4a6e]/30 text-[#0ea5e9] px-4 py-2 rounded-lg flex items-center">
                                <LayoutDashboard className="h-5 w-5 mr-2"/>
                                <span>Dashboard</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Quick Access Cards */}
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.5, delay: 0.1}}
                    className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6"
                >
                    <Link href="/dashboard/task" className="block">
                        <div
                            className="bg-[#0a0a0a] border-2 border-blue-800/50 rounded-xl p-4 hover:border-[#0ea5e9] transition-colors duration-200 h-full">
                            <div className="flex flex-col h-full">
                                <div
                                    className="rounded-full bg-[#0c4a6e]/30 w-10 h-10 flex items-center justify-center mb-3">
                                    <CheckSquare className="h-5 w-5 text-[#0ea5e9]"/>
                                </div>
                                <h3 className="font-medium mb-1">Tasks</h3>
                                <p className="text-xs text-gray-400 mt-auto">View all tasks</p>
                            </div>
                        </div>
                    </Link>

                    <Link href="/dashboard/network" className="block">
                        <div
                            className="bg-[#0a0a0a] border-2 border-blue-800/50 rounded-xl p-4 hover:border-[#0ea5e9] transition-colors duration-200 h-full">
                            <div className="flex flex-col h-full">
                                <div
                                    className="rounded-full bg-[#0c4a6e]/30 w-10 h-10 flex items-center justify-center mb-3">
                                    <Wifi className="h-5 w-5 text-[#0ea5e9]"/>
                                </div>
                                <h3 className="font-medium mb-1">Network</h3>
                                <p className="text-xs text-gray-400 mt-auto">Monitor networks</p>
                            </div>
                        </div>
                    </Link>

                    <Link href="/chat" className="block">
                        <div
                            className="bg-[#0a0a0a] border-2 border-blue-800/50 rounded-xl p-4 hover:border-[#0ea5e9] transition-colors duration-200 h-full">
                            <div className="flex flex-col h-full">
                                <div
                                    className="rounded-full bg-[#0c4a6e]/30 w-10 h-10 flex items-center justify-center mb-3">
                                    <Users className="h-5 w-5 text-[#0ea5e9]"/>
                                </div>
                                <h3 className="font-medium mb-1">Chat</h3>
                                <p className="text-xs text-gray-400 mt-auto">Message colleagues</p>
                            </div>
                        </div>
                    </Link>

                    <Link href="/billing" className="block">
                        <div
                            className="bg-[#0a0a0a] border-2 border-blue-800/50 rounded-xl p-4 hover:border-[#0ea5e9] transition-colors duration-200 h-full">
                            <div className="flex flex-col h-full">
                                <div
                                    className="rounded-full bg-[#0c4a6e]/30 w-10 h-10 flex items-center justify-center mb-3">
                                    <BarChart3 className="h-5 w-5 text-[#0ea5e9]"/>
                                </div>
                                <h3 className="font-medium mb-1">Billing</h3>
                                <p className="text-xs text-gray-400 mt-auto">Manage subscription</p>
                            </div>
                        </div>
                    </Link>
                </motion.div>

                {/* Dashboard Content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Tasks Section */}
                    <motion.div
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.5, delay: 0.2}}
                        className="lg:col-span-5 xl:col-span-4"
                    >
                        <div
                            className="bg-[#0a0a0a] border-2 border-blue-800/50 rounded-xl shadow-lg overflow-hidden h-full">
                            <div className="p-4 border-b border-blue-800/50 bg-[#111]">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold flex items-center">
                                        <CheckSquare className="h-5 w-5 mr-2 text-[#0ea5e9]"/>
                                        Tasks
                                    </h2>
                                    <span className="text-xs bg-[#0c4a6e]/50 text-[#0ea5e9] px-2 py-1 rounded">Priority Tasks</span>
                                </div>
                            </div>
                            <div className="p-4">
                                <DashboardTasks/>
                            </div>
                        </div>
                    </motion.div>

                    {/* Calendar Section */}
                    <motion.div
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.5, delay: 0.3}}
                        className="lg:col-span-7 xl:col-span-8"
                    >
                        <div
                            className="bg-[#0a0a0a] border-2 border-blue-800/50 rounded-xl shadow-lg overflow-hidden h-full">
                            <div className="p-4 border-b border-[#222] bg-[#111]">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold flex items-center">
                                        <CalendarIcon className="h-5 w-5 mr-2 text-[#0ea5e9]"/>
                                        Calendar
                                    </h2>
                                    <button
                                        onClick={() => setIsCalendarExpanded(true)}
                                        className="text-xs bg-[#0c4a6e]/50 text-[#0ea5e9] px-2 py-1 rounded hover:bg-[#0c4a6e] transition-colors"
                                    >
                                        Expand View
                                    </button>
                                </div>
                            </div>
                            <div className="p-4 h-[500px] overflow-hidden">
                                <DashboardCalendar compact={true}/>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Expanded Calendar Dialog */}
                <Dialog open={isCalendarExpanded} onOpenChange={setIsCalendarExpanded}>
                    <DialogContent
                        className="bg-[#0a0a0a] border-[#222] text-white max-w-6xl w-[95vw] h-[90vh] p-0 overflow-hidden">
                        <div className="flex flex-col h-full">
                            <div className="flex items-center justify-between p-4 border-b border-[#222]">
                                <h2 className="text-2xl font-semibold text-[#0ea5e9]">Calendar</h2>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setCalendarView("month")}
                                        className={`px-3 py-1 rounded-md text-sm ${
                                            calendarView === "month"
                                                ? "bg-[#0c4a6e] text-white"
                                                : "bg-[#111] text-gray-400 hover:bg-[#161616]"
                                        }`}
                                    >
                                        Month
                                    </button>
                                    <button
                                        onClick={() => setCalendarView("week")}
                                        className={`px-3 py-1 rounded-md text-sm ${
                                            calendarView === "week" ? "bg-[#0c4a6e] text-white" : "bg-[#111] text-gray-400 hover:bg-[#161616]"
                                        }`}
                                    >
                                        Week
                                    </button>
                                    <button
                                        onClick={() => setCalendarView("day")}
                                        className={`px-3 py-1 rounded-md text-sm ${
                                            calendarView === "day" ? "bg-[#0c4a6e] text-white" : "bg-[#111] text-gray-400 hover:bg-[#161616]"
                                        }`}
                                    >
                                        Day
                                    </button>
                                </div>
                            </div>
                            <div className="flex-grow overflow-auto p-4">
                                <DashboardCalendar compact={false} view={calendarView}/>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}

export default Dashboard
