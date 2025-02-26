"use client"

import {type FC, useEffect, useMemo, useState} from "react"
import axios from "axios"
import {apiUrl} from "@/app/api/config"
import {Poppins} from "next/font/google"
import Cookies from "js-cookie"
import {sessionCheck, UserData, UserHasRight} from "@/app/func/funcs"
import Link from "next/link"
import SideMenu from "@/app/components/Side-menu"
import TasksCard from "@/app/layouts/TasksCard"
import {getOrgName} from "@/app/func/org"
import Loading from "@/app/components/Loading"
import SortMenu from "@/app/components/_task/sort-menu"
import type {Task} from "@/app/types/types"
import {CiSquarePlus} from "react-icons/ci"

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
                        axios.get(`${apiUrl}/projects/list`, {
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
            <div className="w-screen h-screen flex justify-center items-center">
                <Loading/>
            </div>
        )
    }

    return (
        <div className="flex flex-col lg:flex-row min-h-screen">
            <div className="lg:w-1/4 lg:min-h-screen">
                <SideMenu/>
            </div>
            <div className="flex-grow p-6 lg:p-10 overflow-auto">
                <div className="max-w-6xl mx-auto">
                    <h1 className={`${headerText.className} text-4xl md:text-5xl font-black text-center mb-8`}>Your
                        Tasks</h1>
                    <div className="mb-6">
                        <SortMenu
                            sortCriteria={sortCriteria}
                            sortOrder={sortOrder}
                            setSortCriteria={setSortCriteria}
                            setSortOrder={setSortOrder}
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {admin && (
                            <Link
                                href="/dashboard/task/create"
                                className="flex flex-col justify-center items-center p-6 bg-base-200 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl"
                            >
                                <CiSquarePlus className="text-6xl mb-2"/>
                                <span className="text-lg font-semibold">Create Task</span>
                            </Link>
                        )}
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
                </div>
            </div>
        </div>
    )
}

export default Tasks

