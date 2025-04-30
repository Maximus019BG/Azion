"use client"

import type React from "react"
import {Calendar, Clock, Tag, Trash2, User} from "lucide-react"
import axios, {type AxiosResponse} from "axios"
import {apiUrl} from "@/app/api/config"
import Cookies from "js-cookie"
import {format} from "date-fns"

interface Task {
    title: string
    description: string
    status: string
    data: string
    createdBy?: string
    priority: string
    onClick: () => void
    isCreator: boolean
    id: string
}

const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
        case "very_high":
            return "from-red-600 to-red-400"
        case "high":
            return "from-orange-600 to-orange-400"
        case "medium":
            return "from-yellow-600 to-yellow-400"
        case "low":
            return "from-green-600 to-green-400"
        default:
            return "from-gray-600 to-gray-400"
    }
}

const getPriorityBgColor = (priority: string) => {
    switch (priority.toLowerCase()) {
        case "very_high":
            return "bg-red-500/10 text-red-400 border-red-500/20"
        case "high":
            return "bg-orange-500/10 text-orange-400 border-orange-500/20"
        case "medium":
            return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
        case "low":
            return "bg-green-500/10 text-green-400 border-green-500/20"
        default:
            return "bg-gray-500/10 text-gray-400 border-gray-500/20"
    }
}

const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case "completed":
            return "bg-green-500/10 text-green-400 border-green-500/20"
        case "in progress":
            return "bg-blue-500/10 text-blue-400 border-blue-500/20"
        case "pending":
            return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
        case "cancelled":
            return "bg-red-500/10 text-red-400 border-red-500/20"
        default:
            return "bg-gray-500/10 text-gray-400 border-gray-500/20"
    }
}

const TasksCard: React.FC<Task> = ({
                                       title,
                                       description,
                                       status,
                                       data,
                                       priority,
                                       createdBy,
                                       onClick,
                                       isCreator,
                                       id,
                                   }) => {
    const deleteTask = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation()
        if (window.confirm("Are you sure you want to delete this task?")) {
            axios
                .delete(`${apiUrl}/tasks/delete/task/${id}`, {
                    headers: {
                        "Content-Type": "application/json",
                        authorization: Cookies.get("azionAccessToken"),
                    },
                })
                .then((response: AxiosResponse) => {
                    alert("Task deleted successfully. Reloading...")
                    window.location.reload()
                })
                .catch((error: any) => {
                    alert("Error: " + error)
                })
        }
    }

    // Format date if it's a valid date string
    const formattedDate = (() => {
        try {
            const date = new Date(data)
            return isNaN(date.getTime()) ? data : format(date, "MMM d, yyyy")
        } catch (e) {
            return data
        }
    })()

    return (
        <div
            className="bg-[#0a0a0a] rounded-xl border border-[#222] shadow-[0_0_10px_rgba(14,165,233,0.1)] overflow-hidden transition duration-300 ease-in-out transform hover:scale-102 hover:shadow-[0_0_20px_rgba(14,165,233,0.3)] cursor-pointer"
            onClick={onClick}
        >
            <div className={`h-1.5 bg-gradient-to-r ${getPriorityColor(priority)}`}/>
            <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white truncate">{title}</h3>
                    <span
                        className={`text-xs font-medium px-2 py-1 rounded-full border ${getPriorityBgColor(priority)}`}>
            {priority.replace("_", " ").toUpperCase()}
          </span>
                </div>

                <p className="text-gray-400 text-sm line-clamp-2">{description}</p>

                <div className="grid grid-cols-1 gap-2 pt-2">
                    <div className="flex items-center text-xs text-gray-400">
                        <Tag className="h-3.5 w-3.5 mr-2 text-[#0ea5e9]"/>
                        <span className={`px-2 py-0.5 rounded-full border ${getStatusColor(status)}`}>{status}</span>
                    </div>

                    <div className="flex items-center text-xs text-gray-400">
                        <Calendar className="h-3.5 w-3.5 mr-2 text-[#0ea5e9]"/>
                        {formattedDate}
                    </div>

                    <div className="flex items-center text-xs text-gray-400">
                        <User className="h-3.5 w-3.5 mr-2 text-[#0ea5e9]"/>
                        {createdBy}
                        {isCreator && <span className="ml-1 text-[#0ea5e9]">(you)</span>}
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#222]">
                    <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3.5 w-3.5 mr-1"/>
                        Updated recently
                    </div>

                    {isCreator && (
                        <button
                            onClick={deleteTask}
                            className="text-gray-400 hover:text-red-400 transition-colors duration-200 p-1 rounded-full hover:bg-red-500/10"
                            aria-label="Delete task"
                        >
                            <Trash2 className="h-4 w-4"/>
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default TasksCard
