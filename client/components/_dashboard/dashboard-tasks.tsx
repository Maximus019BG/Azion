"use client"
import {useEffect, useState} from "react"
import axios from "axios"
import {apiUrl} from "@/app/api/config"
import Cookies from "js-cookie"
import {getOrgName} from "@/app/func/org"
import type {Task} from "@/app/types/types"
import {AlertCircle, ArrowRight, Loader2} from "lucide-react"
import {motion} from "framer-motion"
import Link from "next/link"

const DashboardTasks = () => {
    const [tasks, setTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [orgName, setOrgName] = useState<string>("")

    useEffect(() => {
        // Fetch tasks
        const GetTopProject = async () => {
            try {
                setLoading(true)
                setError(null)
                const response = await axios.get(`${apiUrl}/tasks/top/${Cookies.get("azionAccessToken")}`, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                })
                setTasks(response.data)
            } catch (error) {
                console.error("Error fetching top projects:", error)
                setError("Failed to load tasks. Please try again later.")
            } finally {
                setLoading(false)
            }
        }

        // Fetch organization name
        const fetchOrgName = async () => {
            try {
                const name = await getOrgName()
                setOrgName(name)
            } catch (error) {
                console.error("Error fetching organization name:", error)
            }
        }

        GetTopProject()
        fetchOrgName()
    }, [])

    const getPriorityColor = (priority: string) => {
        switch (priority.toLowerCase()) {
            case "high":
                return "text-orange-400 bg-orange-400/10 border-orange-400/20"
            case "very_high":
                return "text-red-400 bg-red-400/10 border-red-400/20"
            case "low":
                return "text-green-400 bg-green-400/10 border-green-400/20"
            case "medium":
                return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
            default:
                return "text-gray-400 bg-gray-400/10 border-gray-400/20"
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-[#0ea5e9]"/>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <AlertCircle className="h-10 w-10 text-red-400 mb-2"/>
                <p className="text-red-400">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-[#111] border border-[#333] hover:border-red-400 rounded-md text-gray-300 hover:text-red-400 transition-colors"
                >
                    Retry
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {tasks.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                    <p className="mb-2">No tasks available</p>
                    <p className="text-sm">Create new tasks to see them here</p>
                    <Link
                        href="/dashboard/tasks"
                        className="inline-block mt-4 px-4 py-2 bg-[#111] border border-[#333] hover:border-[#0ea5e9] rounded-md text-gray-300 hover:text-[#0ea5e9] transition-colors"
                    >
                        Go to Tasks
                    </Link>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-3 text-xs text-gray-400 pb-2 border-b border-[#222]">
                        <div>Name</div>
                        <div className="hidden sm:block">Date</div>
                        <div className="text-right sm:text-left">Priority</div>
                    </div>

                    <div className="space-y-3">
                        {tasks.map((task, index) => (
                            <motion.div
                                key={task.id}
                                initial={{opacity: 0, y: 10}}
                                animate={{opacity: 1, y: 0}}
                                transition={{duration: 0.3, delay: index * 0.1}}
                                onClick={() => (window.location.href = `/dashboard/task/view/${task.id}`)}
                                className="grid grid-cols-3 items-center p-3 bg-[#111] rounded-lg border border-[#222] hover:border-[#333] cursor-pointer transition-all duration-200 hover:shadow-[0_0_10px_rgba(14,165,233,0.1)]"
                            >
                                <div className="text-white text-sm truncate">{task.name}</div>
                                <div className="hidden sm:block text-gray-400 text-xs">{task.date}</div>
                                <div className="flex justify-end sm:justify-start">
                  <span
                      className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(task.priority)} font-medium`}
                  >
                    {task.priority.replace("_", " ")}
                  </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="pt-2 flex justify-center">
                        <Link
                            href="/dashboard/tasks"
                            className="text-[#0ea5e9] text-sm flex items-center hover:underline transition-colors"
                        >
                            View all tasks
                            <ArrowRight className="h-4 w-4 ml-1"/>
                        </Link>
                    </div>
                </>
            )}
        </div>
    )
}

export default DashboardTasks
