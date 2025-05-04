"use client"
import type React from "react"
import {type FC, use, useEffect, useState} from "react"
import {getTasks} from "@/app/func/org"
import Loading from "@/app/components/Loading"
import {apiUrl} from "@/app/api/config"
import axios from "axios"
import Cookies from "js-cookie"
import AzionEditor from "./_editor/AzionEditor"
import type {Task} from "@/app/types/types"
import {Poppins} from "next/font/google"
import {sessionCheck, UserData, UserHasRight} from "@/app/func/funcs"
import Link from "next/link"
import ProgressComponent from "@/app/components/ProgressComponent"
import {
    AlertCircle,
    ArrowLeft,
    CheckCircle2,
    Clock,
    ExternalLink,
    FileText,
    Info,
    LinkIcon,
    Maximize,
    Minimize,
    Upload,
    Users,
} from "lucide-react"

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
                if (r.role?.name === "owner") {
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
            <div
                className="w-full h-screen flex justify-center items-center">
                <Loading/>
            </div>
        )
    }

    if (!task) {
        return (
            <div
                className="w-full h-screen flex justify-center items-center ">
                <div
                    className="bg-[#0a0a0a] border border-[#222] rounded-xl p-8  max-w-md w-full">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4"/>
                    <h2 className="text-xl font-semibold text-center mb-4">Task Not Found</h2>
                    <p className="text-gray-400 text-center mb-6">The requested task could not be found.</p>
                    <div className="flex justify-center">
                        <Link
                            href="/dashboard/tasks"
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] text-white rounded-lg shadow-[0_0_15px_rgba(14,165,233,0.3)] hover:shadow-[0_0_20px_rgba(14,165,233,0.5)] transition-all duration-300"
                        >
                            <ArrowLeft className="h-4 w-4"/>
                            Go Back to Tasks
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    const getStatusColor = (status: string) => {
        status = status.toLowerCase()
        if (status.includes("done")) return "bg-green-500/20 text-green-400 border-green-500/30"
        if (status.includes("progress")) return "bg-blue-500/20 text-blue-400 border-blue-500/30"
        if (status.includes("review")) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }

    const getPriorityColor = (priority: string) => {
        switch (priority?.toLowerCase()) {
            case "very_high":
                return "bg-red-500/20 text-red-400 border-red-500/30"
            case "high":
                return "bg-orange-500/20 text-orange-400 border-orange-500/30"
            case "medium":
                return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
            case "low":
                return "bg-green-500/20 text-green-400 border-green-500/30"
            default:
                return "bg-gray-500/20 text-gray-400 border-gray-500/30"
        }
    }

    return (
        <div
            className="flex flex-col lg:flex-row w-full min-h-screen text-white">
            {/* Main Content */}
            <div className="w-full lg:flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col gap-6">
                        {/* Task Header */}
                        <div
                            className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6 ">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                <div>
                                    <Link
                                        href="/dashboard/tasks"
                                        className="inline-flex items-center text-sm text-gray-400 hover:text-[#0ea5e9] mb-4 transition-colors"
                                    >
                                        <ArrowLeft className="h-4 w-4 mr-1"/>
                                        Back to Tasks
                                    </Link>
                                    <h1
                                        className={`text-2xl sm:text-3xl font-bold ${HeaderText.className} bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] bg-clip-text text-transparent`}
                                    >
                                        {task.name}
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-3 mt-3">
                                        <div
                                            className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(task.status)}`}>
                                            {task.status}
                                        </div>
                                        <div
                                            className={`px-3 py-1 rounded-full text-sm border ${getPriorityColor(task.priority)}`}>
                                            {task.priority?.replace("_", " ")}
                                        </div>
                                        <div className="flex items-center text-gray-400 text-sm">
                                            <Clock className="h-4 w-4 mr-1"/>
                                            {task.date}
                                        </div>
                                    </div>
                                </div>

                                {/* Admin File View Button */}
                                {admin && task.files && task.files.length > 0 && (
                                    <button
                                        className="px-4 py-2 bg-[#111] border border-[#333] hover:border-[#0ea5e9] text-gray-300 hover:text-[#0ea5e9] rounded-lg transition-colors flex items-center gap-2"
                                        onClick={() => setShowSubmissionsModal(true)}
                                    >
                                        <FileText className="h-4 w-4"/>
                                        <span className="hidden sm:inline">View Submissions</span>
                                        <span className="inline sm:hidden">Submissions</span>
                                        <span className="bg-[#0c4a6e] text-[#0ea5e9] text-xs px-2 py-0.5 rounded-full">
                      {task.files.length}
                    </span>
                                    </button>
                                )}
                            </div>

                            <div className="mt-6">
                                <div className="flex items-center text-sm font-medium text-gray-400 mb-2">
                                    <Users className="h-4 w-4 mr-2"/>
                                    Created by {task.createdBy?.name || "Unknown"}
                                </div>
                                <div className="mt-4">
                                    <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center">
                                        <Info className="h-4 w-4 mr-2"/>
                                        Progress
                                    </h3>
                                    <ProgressComponent progress={task.progress}/>
                                </div>
                            </div>
                        </div>

                        {/* Task Details */}
                        <div
                            className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6 ">
                            <h2 className="text-xl font-semibold mb-4 flex items-center">
                                <Info className="h-5 w-5 mr-2 text-[#0ea5e9]"/>
                                Task Details
                            </h2>
                            <div className="space-y-6">
                                {/* Source */}
                                {task.source && (
                                    <div className="space-y-2">
                                        <div className="flex items-center text-sm font-medium text-gray-400">
                                            <LinkIcon className="h-4 w-4 mr-2 text-[#0ea5e9]"/>
                                            Source
                                        </div>
                                        <Link
                                            href={task.source}
                                            target="_blank"
                                            className="inline-flex items-center px-4 py-2 bg-[#111] border border-[#222] hover:border-[#0ea5e9] rounded-lg text-[#0ea5e9] hover:text-[#38bdf8] transition-colors"
                                        >
                                            <span className="truncate max-w-md">{task.source}</span>
                                            <ExternalLink className="h-4 w-4 ml-2 flex-shrink-0"/>
                                        </Link>
                                    </div>
                                )}

                                {/* Description */}
                                <div className="space-y-2">
                                    <div className="flex items-center text-sm font-medium text-gray-400">
                                        <Info className="h-4 w-4 mr-2 text-[#0ea5e9]"/>
                                        Description
                                    </div>
                                    <div className="p-4 bg-[#111] border border-[#222] rounded-lg whitespace-pre-wrap">
                                        {task.description}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Task Submission Section */}
                        {!task.status.toLowerCase().includes("done") && (isUser || admin) && !doneByUser && (
                            <div
                                className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6 ">
                                <h2 className="text-xl font-semibold mb-2 flex items-center">
                                    <Upload className="h-5 w-5 mr-2 text-[#0ea5e9]"/>
                                    Submit Your Work
                                </h2>
                                <p className="text-sm text-gray-400 mb-6">Choose how you want to submit your work for
                                    this task</p>

                                <div className="flex flex-wrap gap-2 mb-6">
                                    <button
                                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                                            inputMethod === "file"
                                                ? "bg-[#0c4a6e] text-white"
                                                : "bg-[#111] border border-[#222] hover:border-[#0ea5e9] text-gray-400 hover:text-[#0ea5e9]"
                                        }`}
                                        onClick={() => setInputMethod("file")}
                                    >
                                        <Upload className="h-4 w-4"/>
                                        File Upload
                                    </button>
                                    <button
                                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                                            inputMethod === "editor"
                                                ? "bg-[#0c4a6e] text-white"
                                                : "bg-[#111] border border-[#222] hover:border-[#0ea5e9] text-gray-400 hover:text-[#0ea5e9]"
                                        }`}
                                        onClick={() => setInputMethod("editor")}
                                    >
                                        <FileText className="h-4 w-4"/>
                                        Editor
                                    </button>
                                    <button
                                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                                            inputMethod === "link"
                                                ? "bg-[#0c4a6e] text-white"
                                                : "bg-[#111] border border-[#222] hover:border-[#0ea5e9] text-gray-400 hover:text-[#0ea5e9]"
                                        }`}
                                        onClick={() => setInputMethod("link")}
                                    >
                                        <LinkIcon className="h-4 w-4"/>
                                        Link
                                    </button>
                                </div>

                                {inputMethod === "file" && (
                                    <div className="space-y-4">
                                        <div
                                            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#333] hover:border-[#0ea5e9] rounded-lg transition-colors bg-[#111]/50 cursor-pointer">
                                            <input type="file" onChange={handleFileChange} className="hidden"
                                                   id="file-upload"/>
                                            <label htmlFor="file-upload" className="cursor-pointer w-full text-center">
                                                <Upload className="h-8 w-8 mx-auto mb-2 text-[#0ea5e9]"/>
                                                <p className="text-sm font-medium">Click to upload or drag and drop</p>
                                                <p className="text-xs text-gray-400 mt-1">Any file type up to 10MB</p>
                                            </label>
                                        </div>
                                        {file && (
                                            <div
                                                className="p-3 bg-[#111] border border-[#222] rounded-lg flex items-center">
                                                <FileText className="h-4 w-4 mr-2 text-[#0ea5e9]"/>
                                                <span className="text-sm truncate flex-1">{file.name}</span>
                                                <button className="text-gray-400 hover:text-red-400 ml-2"
                                                        onClick={() => setFile(null)}>
                                                    &times;
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {inputMethod === "editor" && (
                                    <div className="space-y-4">
                                        {isFullScreen ? (
                                            <div className="fixed inset-0 z-50 bg-[#090909] p-4 flex flex-col">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className="text-lg font-medium">Code Editor</h3>
                                                    <button
                                                        className="px-3 py-1 bg-[#111] border border-[#222] hover:border-[#0ea5e9] text-gray-300 hover:text-[#0ea5e9] rounded-lg transition-colors flex items-center gap-2"
                                                        onClick={() => setIsFullScreen(false)}
                                                    >
                                                        <Minimize className="h-4 w-4"/>
                                                        Exit Fullscreen
                                                    </button>
                                                </div>
                                                <div className="flex-1 border border-[#222] rounded-lg overflow-hidden">
                                                    <AzionEditor value={editorContent} onChange={setEditorContent}/>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="relative">
                                                <div className="absolute right-2 top-2 z-10">
                                                    <button
                                                        className="p-1 bg-[#111] border border-[#222] hover:border-[#0ea5e9] text-gray-300 hover:text-[#0ea5e9] rounded-lg transition-colors"
                                                        onClick={() => setIsFullScreen(true)}
                                                        title="Fullscreen"
                                                    >
                                                        <Maximize className="h-4 w-4"/>
                                                    </button>
                                                </div>
                                                <div
                                                    className="h-[300px] sm:h-[400px] border border-[#222] rounded-lg overflow-hidden">
                                                    <AzionEditor value={editorContent} onChange={setEditorContent}/>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {inputMethod === "link" && (
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <LinkIcon
                                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"/>
                                            <input
                                                type="url"
                                                placeholder="Enter URL to your work"
                                                value={link}
                                                onChange={(e) => setLink(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 bg-[#111] border border-[#222] focus:border-[#0ea5e9] rounded-lg text-white outline-none transition-colors"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="mt-6 flex justify-end">
                                    <button
                                        className={`px-6 py-2 bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] hover:from-[#0284c7] hover:to-[#0369a1] text-white rounded-lg shadow-[0_0_15px_rgba(14,165,233,0.3)] hover:shadow-[0_0_20px_rgba(14,165,233,0.5)] transition-all duration-300 flex items-center gap-2 ${
                                            submitting ? "opacity-70 cursor-not-allowed" : ""
                                        }`}
                                        onClick={handleSubmit}
                                        disabled={submitting}
                                    >
                                        {submitting ? (
                                            <>
                                                <svg
                                                    className="animate-spin h-4 w-4 text-white"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    ></circle>
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    ></path>
                                                </svg>
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="h-4 w-4"/>
                                                Submit Task
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Task Already Submitted Message */}
                        {doneByUser && (
                            <div
                                className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6 ">
                                <div
                                    className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                                    <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0"/>
                                    <span className="text-green-400">You have already submitted this task</span>
                                </div>
                            </div>
                        )}

                        {/* Task Completed Message */}
                        {task.status.toLowerCase().includes("done") && (
                            <div
                                className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6 ">
                                <div
                                    className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                                    <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0"/>
                                    <span className="text-green-400">This task has been completed</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Submissions Modal */}
            {showSubmissionsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
                    <div
                        className="bg-[#0a0a0a] border border-[#222] rounded-xl shadow-[0_0_30px_rgba(14,165,233,0.2)] max-w-3xl w-full max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-[#222]">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-semibold">Task Submissions</h3>
                                <button
                                    className="text-gray-400 hover:text-white transition-colors"
                                    onClick={() => setShowSubmissionsModal(false)}
                                >
                                    &times;
                                </button>
                            </div>
                            <p className="text-sm text-gray-400 mt-1">Review submissions from team members</p>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {task.files && task.files.length > 0 ? (
                                <div className="space-y-4">
                                    {task.files.map((file, index) => (
                                        <div key={index}
                                             className="bg-[#111] border border-[#222] rounded-lg overflow-hidden">
                                            <div className="p-4 border-b border-[#222] bg-[#0c0c0c]">
                                                <div
                                                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                    <div>
                                                        <div className="font-medium">{file.user.name}</div>
                                                        <div className="text-xs text-gray-400">{file.user.email}</div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-xs text-gray-400">{file.date}</div>
                                                        <div
                                                            className="px-2 py-1 bg-[#0c4a6e]/30 text-[#0ea5e9] text-xs rounded-full">
                                                            {file.submitType}
                                                        </div>
                                                        <button
                                                            className="px-3 py-1 bg-[#111] border border-[#222] hover:border-red-500 text-gray-300 hover:text-red-400 rounded-lg text-xs transition-colors"
                                                            onClick={() => ReturnTask(taskId, file.user.email)}
                                                        >
                                                            Return
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                {file.submitType === "LINK" ? (
                                                    <a
                                                        href={file.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center text-[#0ea5e9] hover:text-[#38bdf8] transition-colors"
                                                    >
                                                        <LinkIcon className="h-4 w-4 mr-2"/>
                                                        <span className="truncate">{file.link}</span>
                                                        <ExternalLink className="h-3 w-3 ml-2 flex-shrink-0"/>
                                                    </a>
                                                ) : (
                                                    <a
                                                        href={URL.createObjectURL(
                                                            new Blob([atob(file.fileData || "")], {type: file.contentType}),
                                                        )}
                                                        download={file.fileName}
                                                        className="flex items-center text-[#0ea5e9] hover:text-[#38bdf8] transition-colors"
                                                    >
                                                        <FileText className="h-4 w-4 mr-2"/>
                                                        <span className="truncate">{file.fileName}</span>
                                                        <ExternalLink className="h-3 w-3 ml-2 flex-shrink-0"/>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-400">No submissions yet</div>
                            )}
                        </div>

                        <div className="p-4 border-t border-[#222] flex justify-end">
                            <button
                                className="px-6 py-2 bg-[#111] border border-[#222] hover:border-[#0ea5e9] text-gray-300 hover:text-[#0ea5e9] rounded-lg transition-colors"
                                onClick={() => setShowSubmissionsModal(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default TaskView
