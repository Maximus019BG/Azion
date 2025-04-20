"use client"
import React, {type FC, use, useEffect, useState} from "react"
import {getTasks} from "@/app/func/org"
import Loading from "@/app/components/Loading"
import SideMenu from "@/app/components/Side-menu"
import {apiUrl} from "@/app/api/config"
import axios from "axios"
import Cookies from "js-cookie"
import AzionEditor from "./_editor/AzionEditor"
import type {Task} from "@/app/types/types"
import {Poppins} from "next/font/google"
import {sessionCheck, UserData, UserHasRight} from "@/app/func/funcs"
import Link from "next/link"
import ProgressComponent from "@/app/components/ProgressComponent"
import {Calendar, CheckCircle2, ExternalLink, FileText, Info, LinkIcon, Maximize, Minimize, Upload,} from "lucide-react"

const HeaderText = Poppins({subsets: ["latin"], weight: "600"})

interface PageProps {
    params: Promise<{
        taskId: string | null
    }>
}

const TaskView: FC<PageProps> = ({params}) => {
    const {taskId} = use(params)
    const [task, setTask] = useState<Task | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [file, setFile] = useState<File | null>(null)
    const [inputMethod, setInputMethod] = useState<string>("file")
    const [link, setLink] = useState<string>("")
    const [editorContent, setEditorContent] = useState<string>("")
    const [doneByUser, setDoneByUser] = useState<boolean>(false)
    const [admin, setAdmin] = useState<boolean>(false)
    const [isFullScreen, setIsFullScreen] = useState<boolean>(false)
    const [isUser, setIsUser] = useState<boolean>(false)
    const [submitting, setSubmitting] = useState<boolean>(false)
    const [showSubmissionsModal, setShowSubmissionsModal] = useState<boolean>(false)

    const SubmitTask = (taskId: string, file: File | null, link: string, editorContent: string) => {
        setSubmitting(true)
        const formData = new FormData()
        formData.append("taskId", taskId)
        formData.append("text", editorContent)

        if (file) {
            formData.append("file", file)
        } else if (editorContent) {
            const defaultFileContent = editorContent
            const blob = new Blob([defaultFileContent], {type: "text/plain"})
            formData.append("file", blob, "AzionEditorFile.txt")
        } else if (link) {
            const defaultFileContent = link
            const blob = new Blob([defaultFileContent], {type: "text/plain"})
            formData.append("file", blob, "AzionLink.txt")
        }

        axios
            .put(`${apiUrl}/tasks/submit/${taskId}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    authorization: Cookies.get("azionAccessToken"),
                },
            })
            .then((response) => {
                alert("Task submitted successfully")
                window.location.reload()
            })
            .catch((error) => {
                console.error(error)
                alert("Failed to submit task")
            })
            .finally(() => {
                setSubmitting(false)
            })
    }

    const ReturnTask = (taskId: string | null, userEmail: string) => {
        const data = {
            email: userEmail,
        }
        axios
            .put(`${apiUrl}/tasks/return/task/${taskId}`, data, {
                headers: {
                    "Content-Type": "application/json",
                    authorization: Cookies.get("azionAccessToken"),
                },
            })
            .then((response: any) => {
                alert(response.data + "\nTo see changes reload")
            })
            .catch((error: any) => {
                alert(error.response.data)
            })
    }

    useEffect(() => {
        if (Cookies.get("azionAccessToken") && Cookies.get("azionRefreshToken")) {
            sessionCheck()
            UserHasRight("tasks:read")
        } else {
            window.location.href = "/login"
        }
    }, [])

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setFile(event.target.files[0])
        }
    }

    const handleSubmit = () => {
        if (taskId) {
            if (editorContent) {
                SubmitTask(taskId, null, "", editorContent)
            } else if (inputMethod === "file" && file) {
                SubmitTask(taskId, file, "", "")
            } else if (inputMethod === "link" && link) {
                SubmitTask(taskId, null, link, "")
            } else {
                alert("Please provide the required input.")
            }
        }
    }

    useEffect(() => {
        if (taskId) {
            getTasks(taskId).then((taskData) => {
                console.log(taskData)
                setTask(taskData)
                setLoading(false)
            })
        }
    }, [taskId])

    useEffect(() => {
        const getUser = async () => {
            const result = await UserData()
            const uEmail = result.email

            // Set who can see the submitted files
            if (task?.createdBy?.email === uEmail) {
                setAdmin(true)
            }

            UserData().then((r) => {
                if (r.role.name === "owner") {
                    setAdmin(true)
                }
            })

            if (task?.doneBy?.some((doneUser) => doneUser.email === uEmail)) {
                setDoneByUser(true)
            } else {
                setDoneByUser(false)
            }

            if (task?.users?.some((user) => user.email === uEmail)) {
                setIsUser(true)
            } else if (!task?.doneBy?.some((doneUser) => doneUser.email === uEmail)) {
                setIsUser(true)
            } else {
                setIsUser(false)
            }
        }

        if (task) {
            getUser()
        }
    }, [task])

    if (loading) {
        return (
            <div className="w-screen h-screen flex justify-center items-center">
                <Loading/>
            </div>
        )
    }

    if (!task) {
        return (
            <div className="w-screen h-screen flex justify-center items-center">
                <div className="card w-full max-w-md bg-base-200">
                    <div className="card-body">
                        <h2 className="card-title">Task Not Found</h2>
                        <p>The requested task could not be found.</p>
                        <div className="card-actions justify-end mt-4">
                            <Link href="/tasks" className="btn btn-primary">
                                Go Back to Tasks
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const getStatusColor = (status: string) => {
        status = status.toLowerCase()
        if (status.includes("done")) return "badge-success"
        if (status.includes("progress")) return "badge-info"
        if (status.includes("review")) return "badge-warning"
        return "badge-ghost"
    }

    return (
        <div className="flex flex-col lg:flex-row w-full h-screen bg-[#090909] text-white">
            {/* Side Menu - Hidden on mobile, visible on larger screens */}
            <div className="w-full lg:w-1/4 h-fit lg:h-full">
                <SideMenu/>
            </div>

            {/* Main Content */}
            <div className="w-full lg:flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col gap-6">
                        {/* Task Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div>
                                <h1 className={`text-xl sm:text-2xl md:text-3xl font-bold ${HeaderText.className} text-gray-300`}>
                                    {task.name}
                                </h1>
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                    <div className={`badge ${getStatusColor(task.status)}`}>{task.status}</div>
                                    <span className="text-xs sm:text-sm text-gray-400">
                                        Created by {task.createdBy?.name || "Unknown"}
                                    </span>
                                </div>
                            </div>

                            {/* Admin File View Button */}
                            {admin && task.files && task.files.length > 0 && (
                                <button
                                    className="btn btn-outline btn-sm mt-2 sm:mt-0 sm:absolute sm:right-4"
                                    onClick={() => setShowSubmissionsModal(true)}>
                                    <FileText className="mr-2 h-4 w-4"/>
                                    <span className="hidden sm:inline">View Submissions ({task.files.length})</span>
                                    <span className="inline sm:hidden">Submissions ({task.files.length})</span>
                                </button>
                            )}
                        </div>

                        {/* Task Progress */}
                        <div className="card bg-base-200 shadow-xl">
                            <div className="card-body pb-3">
                                <h2 className="card-title text-base sm:text-lg">Progress</h2>
                                <ProgressComponent progress={task.progress}/>
                            </div>
                        </div>

                        {/* Task Details */}
                        <div className="card bg-base-200 shadow-xl">
                            <div className="card-body">
                                <h2 className="card-title text-base sm:text-lg">Task Details</h2>
                                <div className="space-y-4 sm:space-y-6 mt-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                        {/* Date */}
                                        <div className="space-y-2">
                                            <div
                                                className="flex items-center text-xs sm:text-sm font-medium text-gray-400">
                                                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2"/>
                                                Date
                                            </div>
                                            <div
                                                className="p-2 sm:p-3 bg-base-300 rounded-md text-xs sm:text-sm">{task.date}</div>
                                        </div>

                                        {/* Source */}
                                        <div className="space-y-2">
                                            <div
                                                className="flex items-center text-xs sm:text-sm font-medium text-gray-400">
                                                <LinkIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-2"/>
                                                Source
                                            </div>
                                            <Link
                                                href={task.source}
                                                target="_blank"
                                                className="p-2 sm:p-3 bg-base-300 rounded-md text-xs sm:text-sm flex items-center text-accent hover:underline break-all"
                                            >
                                                {task.source}
                                                <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0"/>
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-2">
                                        <div className="flex items-center text-xs sm:text-sm font-medium text-gray-400">
                                            <Info className="h-3 w-3 sm:h-4 sm:w-4 mr-2"/>
                                            Description
                                        </div>
                                        <div
                                            className="p-3 sm:p-4 bg-base-300 rounded-md whitespace-pre-wrap text-xs sm:text-sm">
                                            {task.description}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Task Submission Section */}
                        {!task.status.toLowerCase().includes("done") && (isUser || admin) && !doneByUser && (
                            <div className="card bg-base-200 shadow-xl">
                                <div className="card-body">
                                    <h2 className="card-title text-base sm:text-lg">Submit Your Work</h2>
                                    <p className="text-xs sm:text-sm text-gray-400">
                                        Choose how you want to submit your work for this task
                                    </p>

                                    <div className="tabs tabs-boxed bg-base-300 mt-4 sm:mt-6 mb-4 sm:mb-6">
                                        <a
                                            className={`tab tab-sm sm:tab-md ${inputMethod === "file" ? "tab-active" : ""}`}
                                            onClick={() => setInputMethod("file")}
                                        >
                                            <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2"/>
                                            File Upload
                                        </a>
                                        <a
                                            className={`tab tab-sm sm:tab-md ${inputMethod === "editor" ? "tab-active" : ""}`}
                                            onClick={() => setInputMethod("editor")}
                                        >
                                            <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2"/>
                                            Editor
                                        </a>
                                        <a
                                            className={`tab tab-sm sm:tab-md ${inputMethod === "link" ? "tab-active" : ""}`}
                                            onClick={() => setInputMethod("link")}
                                        >
                                            <LinkIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2"/>
                                            Link
                                        </a>
                                    </div>

                                    {inputMethod === "file" && (
                                        <div className="space-y-4">
                                            <input
                                                type="file"
                                                onChange={handleFileChange}
                                                className="file-input file-input-bordered w-full text-xs sm:text-sm cursor-pointer"
                                            />
                                            {file && (
                                                <div className="p-2 sm:p-3 bg-base-300 rounded-md flex items-center">
                                                    <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-accent"/>
                                                    <span className="text-xs sm:text-sm">{file.name}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {inputMethod === "editor" && (
                                        <div className="space-y-4">
                                            {isFullScreen ? (
                                                <div className="fixed inset-0 z-50 bg-[#090909] p-4 flex flex-col">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <button className="btn btn-outline btn-sm"
                                                                onClick={() => setIsFullScreen(false)}>
                                                            <Minimize className="h-3 w-3 sm:h-4 sm:w-4 mr-2"/>
                                                            Exit Fullscreen
                                                        </button>
                                                    </div>
                                                    <div className="flex-1">
                                                        <AzionEditor value={editorContent} onChange={setEditorContent}/>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="relative">
                                                    <div className="absolute right-2 top-2 z-10">
                                                        <div className="tooltip tooltip-left" data-tip="Fullscreen">
                                                            <button className="btn btn-ghost btn-sm btn-circle"
                                                                    onClick={() => setIsFullScreen(true)}>
                                                                <Maximize className="h-3 w-3 sm:h-4 sm:w-4"/>
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="h-[300px] sm:h-[400px]">
                                                        <AzionEditor value={editorContent} onChange={setEditorContent}/>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {inputMethod === "link" && (
                                        <div className="space-y-4">
                                            <input
                                                type="url"
                                                placeholder="Enter URL to your work"
                                                value={link}
                                                onChange={(e) => setLink(e.target.value)}
                                                className="input input-bordered w-full text-xs sm:text-sm"
                                            />
                                        </div>
                                    )}

                                    <div className="card-actions justify-end mt-4 sm:mt-6">
                                        <button
                                            className={`btn btn-accent btn-sm sm:btn-md ${submitting ? "loading" : ""}`}
                                            onClick={handleSubmit}
                                            disabled={submitting}
                                        >
                                            {submitting ? (
                                                "Submitting..."
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2"/>
                                                    Submit Task
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Task Already Submitted MessageDTO */}
                        {doneByUser && (
                            <div className="card bg-base-200 shadow-xl">
                                <div className="card-body">
                                    <div className="alert alert-success text-xs sm:text-sm">
                                        <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2"/>
                                        <span>You have already submitted this task</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Task Completed MessageDTO */}
                        {task.status.toLowerCase().includes("done") && (
                            <div className="card bg-base-200 shadow-xl">
                                <div className="card-body">
                                    <div className="alert alert-success text-xs sm:text-sm">
                                        <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2"/>
                                        <span>This task has been completed</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Submissions Modal */}
            {showSubmissionsModal && (
                <div className="modal modal-open">
                    <div className="modal-box max-w-3xl">
                        <h3 className="font-bold text-base sm:text-lg">Task Submissions</h3>
                        <p className="py-2 text-xs sm:text-sm text-gray-400">Review submissions from team members</p>

                        <div className="max-h-[60vh] overflow-y-auto mt-4">
                            {task.files &&
                                task.files.map((file, index) => (
                                    <div key={index} className="mb-4 p-3 sm:p-4 border border-base-300 rounded-lg">
                                        {file.submitType === "LINK" ? (
                                            <>
                                                <div
                                                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                                                    <div>
                                                        <div
                                                            className="font-medium text-xs sm:text-sm flex items-center">{file.user.name}</div>
                                                        <div className="text-xs text-gray-400">{file.user.email}</div>
                                                        <div className="text-xs text-gray-500 mt-1">{file.date}</div>
                                                        <div
                                                            className="text-xs text-gray-500 mt-1">{file.submitType}</div>
                                                    </div>
                                                    <button className="btn btn-outline btn-xs"
                                                            onClick={() => ReturnTask(taskId, file.user.email)}>
                                                        Return
                                                    </button>
                                                </div>
                                                <div className="divider my-2"></div>
                                                <div className="mt-2">
                                                    <a
                                                        href={file.link}
                                                        className="flex items-center text-accent hover:underline text-xs sm:text-sm"
                                                    >
                                                        {file.link}
                                                        <ExternalLink className="h-2 w-2 sm:h-3 sm:w-3 ml-1"/>
                                                    </a>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div
                                                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                                                    <div>
                                                        <div
                                                            className="font-medium text-xs sm:text-sm flex items-center">{file.user.name}</div>
                                                        <div className="text-xs text-gray-400">{file.user.email}</div>
                                                        <div className="text-xs text-gray-500 mt-1">{file.date}</div>
                                                        <div
                                                            className="text-xs text-gray-500 mt-1">{file.submitType}</div>
                                                    </div>
                                                    <button className="btn btn-outline btn-xs"
                                                            onClick={() => ReturnTask(taskId, file.user.email)}>
                                                        Return
                                                    </button>
                                                </div>
                                                <div className="divider my-2"></div>
                                                <div className="mt-2">
                                                    <a
                                                        href={URL.createObjectURL(new Blob([atob(file.fileData || "")], {type: file.contentType}))}
                                                        download={file.fileName}
                                                        className="flex items-center text-accent hover:underline text-xs sm:text-sm"
                                                    >
                                                        <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-2"/>
                                                        {file.fileName}
                                                        <ExternalLink className="h-2 w-2 sm:h-3 sm:w-3 ml-1"/>
                                                    </a>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                        </div>

                        <div className="modal-action">
                            <button className="btn btn-sm sm:btn-md" onClick={() => setShowSubmissionsModal(false)}>
                                Close
                            </button>
                        </div>
                    </div>
                    <div className="modal-backdrop" onClick={() => setShowSubmissionsModal(false)}></div>
                </div>
            )}
        </div>
    )
}

export default TaskView
