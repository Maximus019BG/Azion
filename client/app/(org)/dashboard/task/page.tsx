"use client"

import {type FC, useEffect, useMemo, useState} from "react"
import axios from "axios"
import {apiUrl} from "@/app/api/config"
import {Poppins} from 'next/font/google'
import Cookies from "js-cookie"
import {sessionCheck, UserData, UserHasRight} from "@/app/func/funcs"
import Link from "next/link"
import TasksCard from "@/app/layouts/TasksCard"
import {getOrgName} from "@/app/func/org"
import Loading from "@/app/components/Loading"
import SortMenu from "@/app/components/_task/sort-menu"
import type {Task} from "@/app/types/types"
import {PlusCircle} from 'lucide-react'

const headerText = Poppins({subsets: ["latin"], weight: "900"})

const Tasks: FC = () => {
    const [admin, setAdmin] = useState(false)
    const [tasks, setTasks] = useState<Task[] | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [sortCriteria, setSortCriteria] = useState<string>("date")
    const [sortOrder, setSortOrder] = useState<string>("asc")
    const [currentUserEmail, setCurrentUserEmail] = useState<string>("")

    useEffect(() => {
        const fetchData = async () => {
            try {
                const refreshToken = Cookies.get("azionRefreshToken")
                const accessToken = Cookies.get("azionAccessToken")
                if (refreshToken && accessToken) {
                    await sessionCheck()
                    const [userData, orgNameResult, tasksResponse] = await Promise.all([
                        UserData(),
                        getOrgName(),
                        axios.get(`${apiUrl}/tasks/list`, {
                            headers: {
                                "Content-Type": "application/json",
                                authorization: accessToken,
                            },
                        }),
                    ])

                    UserHasRight("tasks:read")
                    setCurrentUserEmail(userData.email)
                    setTasks(tasksResponse.data.message === "no projects" ? null : tasksResponse.data)
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

    const sortedTasks = useMemo(() => {
        if (Array.isArray(tasks)) {
            return tasks.sort((a, b) => {
                if (sortCriteria === "date") {
                    return sortOrder === "asc"
                        ? new Date(a.date).getTime() - new Date(b.date).getTime()
                        : new Date(b.date).getTime() - new Date(a.date).getTime()
                } else if (sortCriteria === "priority") {
                    const priorityOrder = ["low", "medium", "high", "very_high"]
                    return sortOrder === "asc"
                        ? priorityOrder.indexOf(a.priority.toLowerCase()) - priorityOrder.indexOf(b.priority.toLowerCase())
                        : priorityOrder.indexOf(b.priority.toLowerCase()) - priorityOrder.indexOf(a.priority.toLowerCase())
                } else if (sortCriteria === "status") {
                    return sortOrder === "asc" ? a.status.localeCompare(b.status) : b.status.localeCompare(a.status)
                }
                return 0
            })
        } else {
            return []
        }
    }, [tasks, sortCriteria, sortOrder])

    if (loading) {
        return (
            <div
                className="w-screen h-screen flex justify-center items-center bg-gradient-to-br from-[#050505] to-[#0c0c0c]">
                <Loading/>
            </div>
        )
    }

    return (
        <div
            className="w-full flex flex-col lg:flex-row min-h-screen text-white bg-gradient-to-br from-[#050505] to-[#0c0c0c]">
            <div className="w-full flex-grow p-4 md:p-6 lg:p-10 overflow-auto">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-8 text-center">
                        <h1 className={`${headerText.className} text-3xl md:text-4xl lg:text-5xl font-black bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] bg-clip-text text-transparent`}>
                            Your Tasks
                        </h1>
                        <div
                            className="h-1 w-20 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] mx-auto mt-2 rounded-full"></div>
                    </div>

                    <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <SortMenu
                            sortCriteria={sortCriteria}
                            sortOrder={sortOrder}
                            setSortCriteria={setSortCriteria}
                            setSortOrder={setSortOrder}
                        />

                        {admin && (
                            <Link
                                href="/dashboard/task/create"
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] text-white rounded-lg shadow-[0_0_15px_rgba(14,165,233,0.3)] hover:shadow-[0_0_20px_rgba(14,165,233,0.5)] transition duration-300 ease-in-out"
                            >
                                <PlusCircle className="h-5 w-5"/>
                                <span className="font-medium">Create Task</span>
                            </Link>
                        )}
                    </div>

                    {sortedTasks.length === 0 ? (
                        <div
                            className="flex flex-col items-center justify-center p-10 bg-[#0a0a0a] rounded-xl border border-[#222] shadow-lg">
                            <div
                                className="w-20 h-20 bg-[#111] rounded-full flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(14,165,233,0.2)]">
                                <PlusCircle className="h-10 w-10 text-[#0ea5e9]"/>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">No Tasks Found</h3>
                            <p className="text-gray-400 text-center">
                                You don&lsquo;border-2 border-blue-800/50t have any tasks
                                yet. {admin && "Create a new task to get started."}
                            </p>
                            {admin && (
                                <Link
                                    href="/dashboard/task/create"
                                    className="mt-6 px-6 py-2 bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] text-white rounded-lg shadow-[0_0_15px_rgba(14,165,233,0.3)] hover:shadow-[0_0_20px_rgba(14,165,233,0.5)] transition duration-300"
                                >
                                    Create Task
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sortedTasks.map((task: Task) => (
                                <TasksCard
                                    key={task.id}
                                    title={task.name}
                                    description={task.description}
                                    status={task.status}
                                    data={task.date}
                                    createdBy={task.createdBy?.name}
                                    priority={task.priority}
                                    onClick={() => (window.location.href = `/dashboard/task/view/${task.id}`)}
                                    isCreator={task.createdBy?.email === currentUserEmail}
                                    id={task.id}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Tasks
