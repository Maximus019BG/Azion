"use client"
import type React from "react"
import {useEffect, useState} from "react"

import {Poppins} from "next/font/google"
import Cookies from "js-cookie"
import {sessionCheck, UserData} from "@/app/func/funcs"
import {
    BarChart3,
    CalendarIcon,
    CheckSquare,
    Columns,
    Grid,
    GripVertical,
    LayoutGrid,
    List,
    Loader2,
    Users,
    Wifi,
} from "lucide-react"
import DashboardTasks from "@/components/_dashboard/dashboard-tasks"
import DashboardCalendar from "@/components/_dashboard/dashboard-calendar"
import {Dialog, DialogContent} from "@/components/ui/dialog"
import {motion} from "framer-motion"
import Link from "next/link"
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group"

const headerText = Poppins({subsets: ["latin"], weight: "900"})

type LayoutMode = "grid" | "list" | "masonry" | "columns"
type WidgetId = "tasks" | "calendar"
type WidgetLayout = {
    id: WidgetId
    title: string
    icon: React.ReactNode
    size: "small" | "medium" | "large"
}

const Dashboard = () => {
    const [displayName, setDisplayName] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(true)
    const [isCalendarExpanded, setIsCalendarExpanded] = useState<boolean>(false)
    const [calendarView, setCalendarView] = useState<"month" | "week" | "day">("month")
    const [layoutMode, setLayoutMode] = useState<LayoutMode>("grid")
    const [widgets, setWidgets] = useState<WidgetLayout[]>([
        {id: "tasks", title: "Tasks", icon: <CheckSquare className="h-5 w-5 mr-2 text-[#0ea5e9]"/>, size: "medium"},
        {
            id: "calendar",
            title: "Calendar",
            icon: <CalendarIcon className="h-5 w-5 mr-2 text-[#0ea5e9]"/>,
            size: "large",
        },
    ])

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

    // Simple widget reordering without react-beautiful-dnd
    const moveWidget = (fromIndex: number, toIndex: number) => {
        const updatedWidgets = [...widgets]
        const [movedWidget] = updatedWidgets.splice(fromIndex, 1)
        updatedWidgets.splice(toIndex, 0, movedWidget)
        setWidgets(updatedWidgets)
    }

    const getLayoutClasses = () => {
        switch (layoutMode) {
            case "grid":
                return "grid grid-cols-1 lg:grid-cols-12 gap-6"
            case "list":
                return "flex flex-col gap-6"
            case "masonry":
                return "columns-1 md:columns-2 gap-6 space-y-6"
            case "columns":
                return "grid grid-cols-1 md:grid-cols-2 gap-6"
            default:
                return "grid grid-cols-1 lg:grid-cols-12 gap-6"
        }
    }

    const getWidgetClasses = (widget: WidgetLayout) => {
        if (layoutMode === "list" || layoutMode === "masonry") {
            return "break-inside-avoid"
        }

        if (layoutMode === "columns") {
            return ""
        }

        // For grid layout
        switch (widget.id) {
            case "tasks":
                return "lg:col-span-5 xl:col-span-4"
            case "calendar":
                return "lg:col-span-7 xl:col-span-8"
            default:
                return "lg:col-span-6"
        }
    }

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
        <div className="w-full min-h-screen  text-white">
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
                        {/*<div className="flex flex-wrap gap-2">*/}
                        {/*    <div className="bg-[#0c4a6e]/30 text-[#0ea5e9] px-4 py-2 rounded-lg flex items-center">*/}
                        {/*        <LayoutDashboard className="h-5 w-5 mr-2"/>*/}
                        {/*        <span>Dashboard</span>*/}
                        {/*    </div>*/}
                        {/*</div>*/}
                    </div>
                </motion.div>

                {/* Layout Controls */}
                <motion.div
                    initial={{opacity: 0, y: 10}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.3}}
                    className="mb-6 flex justify-end"
                >
                    <ToggleGroup
                        type="single"
                        value={layoutMode}
                        onValueChange={(value: string) => value && setLayoutMode(value as LayoutMode)}
                    >
                        <ToggleGroupItem value="grid" aria-label="Grid layout">
                            <Grid className="h-4 w-4 mr-2"/>
                            <span className="hidden sm:inline">Grid</span>
                        </ToggleGroupItem>
                        <ToggleGroupItem value="list" aria-label="List layout">
                            <List className="h-4 w-4 mr-2"/>
                            <span className="hidden sm:inline">List</span>
                        </ToggleGroupItem>
                        <ToggleGroupItem value="masonry" aria-label="Masonry layout">
                            <LayoutGrid className="h-4 w-4 mr-2"/>
                            <span className="hidden sm:inline">Masonry</span>
                        </ToggleGroupItem>
                        <ToggleGroupItem value="columns" aria-label="Columns layout">
                            <Columns className="h-4 w-4 mr-2"/>
                            <span className="hidden sm:inline">Columns</span>
                        </ToggleGroupItem>
                    </ToggleGroup>
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
                            className="bg-[#0a0a0a] border-2 border-blue-800/50 rounded-xl p-4 hover:border-[#0ea5e9] transition-colors duration-200 h-full shadow-[0_0_15px_rgba(14,165,233,0.15)]">
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
                            className="bg-[#0a0a0a] border-2 border-blue-800/50 rounded-xl p-4 hover:border-[#0ea5e9] transition-colors duration-200 h-full shadow-[0_0_15px_rgba(14,165,233,0.15)]">
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
                            className="bg-[#0a0a0a] border-2 border-blue-800/50 rounded-xl p-4 hover:border-[#0ea5e9] transition-colors duration-200 h-full shadow-[0_0_15px_rgba(14,165,233,0.15)]">
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
                            className="bg-[#0a0a0a] border-2 border-blue-800/50 rounded-xl p-4 hover:border-[#0ea5e9] transition-colors duration-200 h-full shadow-[0_0_15px_rgba(14,165,233,0.15)]">
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
                <div className={getLayoutClasses()}>
                    {widgets.map((widget, index) => (
                        <motion.div
                            key={widget.id}
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            transition={{duration: 0.5, delay: 0.2 + index * 0.1}}
                            className={getWidgetClasses(widget)}
                        >
                            <div
                                className="bg-[#0a0a0a] border-2 border-blue-800/50 rounded-xl shadow-lg overflow-hidden h-full shadow-[0_0_15px_rgba(14,165,233,0.15)]">
                                <div
                                    className="p-4 border-b border-blue-800/50 bg-[#111] flex items-center justify-between">
                                    <h2 className="text-xl font-semibold flex items-center">
                                        {widget.icon}
                                        {widget.title}
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        {widget.id === "calendar" && (
                                            <button
                                                onClick={() => setIsCalendarExpanded(true)}
                                                className="text-xs bg-[#0c4a6e]/50 text-[#0ea5e9] px-2 py-1 rounded hover:bg-[#0c4a6e] transition-colors"
                                            >
                                                Expand View
                                            </button>
                                        )}
                                        <div className="flex items-center gap-1">
                                            {index > 0 && (
                                                <button
                                                    onClick={() => moveWidget(index, index - 1)}
                                                    className="p-1 text-gray-400 hover:text-[#0ea5e9] transition-colors"
                                                    aria-label="Move up"
                                                >
                                                    <GripVertical className="h-5 w-5"/>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className={`p-4 ${widget.id === "calendar" ? "h-[500px] overflow-hidden" : ""}`}>
                                    {widget.id === "tasks" && <DashboardTasks/>}
                                    {widget.id === "calendar" && <DashboardCalendar compact={true}/>}
                                </div>
                            </div>
                        </motion.div>
                    ))}
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
