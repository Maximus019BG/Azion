"use client"

import type React from "react"
import {MdAccessTime, MdAssignment, MdDescription, MdPerson, MdTitle} from "react-icons/md"
import {RiDeleteBin5Fill} from "react-icons/ri"
import axios, {type AxiosResponse} from "axios"
import {apiUrl} from "@/app/api/config"
import Cookies from "js-cookie"

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
            return "bg-red-500"
        case "high":
            return "bg-orange-500"
        case "medium":
            return "bg-yellow-500"
        case "low":
            return "bg-green-500"
        default:
            return "bg-gray-500"
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

    return (
        <div
            className="bg-base-300 rounded-lg shadow-lg overflow-hidden transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl cursor-pointer"
            onClick={onClick}
        >
            <div className={`h-2 ${getPriorityColor(priority)}`}/>
            <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center text-lg font-semibold">
                        <MdTitle className="mr-2 text-teal-400"/>
                        <h3 className="truncate">{title}</h3>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${getPriorityColor(priority)} text-white`}>
            {priority.toUpperCase()}
          </span>
                </div>
                <div className="flex items-center text-sm text-gray-400">
                    <MdPerson className="mr-2 text-purple-400"/>
                    {createdBy}
                    {isCreator && <span className="ml-1 text-xs">(you)</span>}
                </div>
                <div className="flex items-start text-sm text-gray-400">
                    <MdDescription className="mr-2 mt-1 text-blue-400"/>
                    <p className="line-clamp-2">{description}</p>
                </div>
                <div className="flex items-center text-sm text-gray-400">
                    <MdAssignment className="mr-2 text-amber-400"/>
                    {status}
                </div>
                <div className="flex items-center text-sm text-gray-400">
                    <MdAccessTime className="mr-2 text-green-400"/>
                    {data}
                </div>
                <div className="flex items-center justify-end">
                    {isCreator && (
                        <button
                            onClick={deleteTask}
                            className="text-red-400 hover:text-red-300 transition-colors duration-200"
                            aria-label="Delete task"
                        >
                            <RiDeleteBin5Fill className="text-xl"/>
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default TasksCard

