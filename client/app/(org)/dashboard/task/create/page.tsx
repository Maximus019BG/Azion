"use client"

import {type FC, useCallback, useEffect, useState} from "react"
import axios from "axios"
import {apiUrl} from "@/app/api/config"
import Cookies from "js-cookie"
import {sessionCheck, UserData, UserHasRight} from "@/app/func/funcs"
import {Poppins} from "next/font/google"
import Loading from "@/app/components/Loading"
import {Card, CardContent} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Textarea} from "@/components/ui/textarea"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Button} from "@/components/ui/button"
import {Checkbox} from "@/components/ui/checkbox"
import {Label} from "@/components/ui/label"
import {ScrollArea} from "@/components/ui/scroll-area"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {Calendar} from "@/components/ui/calendar"
import {format} from "date-fns"
import {ArrowLeft, ArrowRight, CalendarIcon, CheckCircle2, Users} from "lucide-react"
import {toast} from "@/components/ui/use-toast"

const HeaderText = Poppins({subsets: ["latin"], weight: "600"})

interface User {
    name: string
    email: string
    age: number
    role: string
    id: string
}

const CreateTask: FC = () => {
    const [title, setTitle] = useState("")
    const [uEmail, setUEmail] = useState("")
    const [description, setDescription] = useState("")
    const [priority, setPriority] = useState("LOW")
    const [loading, setLoading] = useState<boolean>(true)
    const [source, setSource] = useState("")
    const [users, setUsers] = useState<User[]>([])
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
    const [dueDate, setDueDate] = useState<Date | undefined>(new Date())
    const [submitting, setSubmitting] = useState(false)
    const progress = 0
    const status = "Due"
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState("details")

    const GetUsers = useCallback(async () => {
        setError(null)
        try {
            const response = await axios.get(`${apiUrl}/org/list/employees`, {
                headers: {
                    "Content-Type": "application/json",
                    authorization: Cookies.get("azionAccessToken"),
                },
            })
            setUsers(response.data)
        } catch (error) {
            console.error(error)
            setError("Failed to fetch users. Please try again.")
        }
    }, [])

    useEffect(() => {
        const checkSession = async () => {
            const refreshToken = Cookies.get("azionRefreshToken")
            const accessToken = Cookies.get("azionAccessToken")

            if (refreshToken && accessToken) {
                try {
                    await sessionCheck()
                    await UserHasRight("tasks:write")
                    await GetUsers()

                    const userData = await UserData()
                    setUEmail(userData.email)
                    // Auto-select current user
                    setSelectedUsers(new Set([userData.email]))

                    setLoading(false)
                } catch (error) {
                    console.error("Session check failed:", error)
                    window.location.href = "/login"
                }
            } else {
                window.location.href = "/login"
            }
        }

        checkSession()
    }, [GetUsers])

    const handleCheckboxChange = (email: string) => {
        setSelectedUsers((prevSelectedUsers) => {
            const newSelectedUsers = new Set(prevSelectedUsers)
            if (newSelectedUsers.has(email)) {
                newSelectedUsers.delete(email)
            } else {
                newSelectedUsers.add(email)
            }
            return newSelectedUsers
        })
    }

    const validateForm = () => {
        const missingFields = []
        if (!title.trim()) missingFields.push("Title")
        if (!description.trim()) missingFields.push("Description")
        if (!dueDate) missingFields.push("Due Date")
        if (selectedUsers.size === 0) missingFields.push("Assigned Users")

        if (description.length > 255) {
            setError("Description must be 255 characters or less")
            return
        }

        if (missingFields.length > 0) {
            setError(`Please fill in the following fields: ${missingFields.join(", ")}`)
            return false
        }

        return true
    }

    const TaskData = async () => {
        setError(null)

        if (!validateForm()) {
            return
        }

        setSubmitting(true)

        const data = {
            accessToken: Cookies.get("azionAccessToken"),
            title,
            description,
            dueDate: dueDate ? format(dueDate, "MM/dd/yyyy") : "",
            priority,
            status,
            progress,
            source,
            users: Array.from(selectedUsers),
        }

        try {
            await axios.post(`${apiUrl}/tasks/create/new`, data, {
                headers: {
                    "Content-Type": "application/json",
                },
            })

            toast({
                title: "Success",
                description: "Task created successfully!",
                variant: "default",
            })

            // Reset form
            setTitle("")
            setDescription("")
            setPriority("LOW")
            setDueDate(new Date())
            setSelectedUsers(new Set([uEmail]))
            setActiveTab("details")
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setError(`Error creating task: ${error.response?.data || "Unknown error"}`)
            } else {
                setError("An unexpected error occurred")
            }
        } finally {
            setSubmitting(false)
        }
    }

    const userList = Array.isArray(users) ? users : []
    const priorities = ["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]

    const tabOrder = ["details", "users", "review"]

    const handleNextTab = () => {
        // Validate current tab before proceeding
        if (activeTab === "details") {
            const detailsFields = []
            if (!title.trim()) detailsFields.push("Title")
            if (!description.trim()) detailsFields.push("Description")
            if (!dueDate) detailsFields.push("Due Date")

            if (description.length > 255) {
                setError("Description must be 255 characters or less")
                return
            }

            if (detailsFields.length > 0) {
                setError(`Please fill in the following fields: ${detailsFields.join(", ")}`)
                return
            }
        }

        if (activeTab === "users" && selectedUsers.size === 0) {
            setError("Please select at least one user")
            return
        }

        setError(null)
        const currentIndex = tabOrder.indexOf(activeTab)
        if (currentIndex < tabOrder.length - 1) {
            setActiveTab(tabOrder[currentIndex + 1])
        }
    }

    const handlePreviousTab = () => {
        setError(null)
        const currentIndex = tabOrder.indexOf(activeTab)
        if (currentIndex > 0) {
            setActiveTab(tabOrder[currentIndex - 1])
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "LOW":
                return "bg-green-500"
            case "MEDIUM":
                return "bg-yellow-500"
            case "HIGH":
                return "bg-orange-500"
            case "VERY_HIGH":
                return "bg-red-500"
            default:
                return "bg-blue-500"
        }
    }

    return (
        <div className="w-full flex flex-col lg:flex-row min-h-screen text-white">
            {loading ? (
                <div className="flex w-full h-full items-center justify-center">
                    <Loading/>
                </div>
            ) : (
                <>
                    <div className="w-full h-screen flex flex-col justify-center items-center p-4 lg:p-8 overflow-auto">
                        <h1
                            className={`text-4xl font-bold bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] bg-clip-text p-10 text-transparent ${HeaderText.className}`}
                        >
                            Create New Task
                        </h1>
                        {error && <div
                            className="bg-red-500/80 text-white p-4 rounded-md mb-4 w-full max-w-4xl">{error}</div>}
                        <Card className="w-full bg-[#0a0a0a] border-2 border-[#222] max-w-4xl mx-auto">
                            <CardContent className="p-6">
                                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                    <TabsList className="w-full text-white bg-base-100 mb-6">
                                        <TabsTrigger
                                            value="details"
                                            className="w-full h-full data-[state=active]:bg-accent text-xs sm:text-base hover:bg-accent/80 transition duration-200 rounded-md"
                                        >
                                            Task Details
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="users"
                                            className="w-full h-full data-[state=active]:bg-accent text-xs sm:text-base hover:bg-accent/80 transition duration-200 rounded-md"
                                        >
                                            Assign Users
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="review"
                                            className="w-full h-full data-[state=active]:bg-accent text-xs sm:text-base hover:bg-accent/80 transition duration-200 rounded-md"
                                        >
                                            Review & Create
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="details" className="space-y-6">
                                        <form className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6"
                                              onSubmit={(e) => e.preventDefault()}>
                                            <div className="space-y-6">
                                                <div className="space-y-2">
                                                    <Label htmlFor="title">
                                                        Title <span className="text-red-500">*</span>
                                                    </Label>
                                                    <Input
                                                        id="title"
                                                        value={title}
                                                        onChange={(e) => setTitle(e.target.value)}
                                                        placeholder="Enter task title"
                                                        className="border-2 break-words border-base-100 bg-[#080808]"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="description">
                                                        Description <span className="text-red-500">*</span>
                                                    </Label>
                                                    <Textarea
                                                        id="description"
                                                        value={description}
                                                        onChange={(e) => setDescription(e.target.value)}
                                                        placeholder="Enter task description"
                                                        rows={4}
                                                        maxLength={255}
                                                        className="border-2 border-base-100 bg-[#080808]"
                                                    />
                                                    <div
                                                        className={`text-xs ${description.length > 255 ? "text-red-500 font-medium" : "text-muted-foreground"} text-right`}
                                                    >
                                                        {description.length}/255 characters
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="priority">Priority</Label>
                                                    <Select value={priority} onValueChange={setPriority}>
                                                        <SelectTrigger
                                                            className="border-2 border-base-100 bg-[#080808]">
                                                            <SelectValue placeholder="Select priority"/>
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-base-300 border-2 border-base-100">
                                                            {priorities.map((prio) => (
                                                                <SelectItem key={prio} value={prio}
                                                                            className="cursor-pointer">
                                                                    <div className="flex items-center">
                                                                        <span
                                                                            className={`w-3 h-3 rounded-full mr-2 ${getPriorityColor(prio)}`}></span>
                                                                        {prio}
                                                                    </div>
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="source">Source</Label>
                                                    <Input
                                                        id="source"
                                                        value={source}
                                                        onChange={(e) => setSource(e.target.value)}
                                                        placeholder="Enter task source"
                                                        className="border-2 border-base-100 bg-[#080808]"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2 flex flex-col">
                                                <Label>
                                                    Due Date <span className="text-red-500">*</span>
                                                </Label>
                                                <div className="flex items-center">
                                                    <Button
                                                        variant="outline"
                                                        className={`w-full justify-start text-left font-normal ${!dueDate && "text-muted-foreground"} border-2 border-base-100 bg-[#080808]`}
                                                        onClick={(e) => e.preventDefault()}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4"/>
                                                        {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                                                    </Button>
                                                </div>
                                                <Calendar
                                                    mode="single"
                                                    selected={dueDate}
                                                    onSelect={setDueDate}
                                                    className="flex justify-center self-center items-center w-fit rounded-md border-2 mt-2 border-base-100"
                                                    initialFocus
                                                />
                                            </div>
                                        </form>
                                        <div className="flex justify-between mt-5">
                                            <Button
                                                onClick={handlePreviousTab}
                                                disabled={activeTab === "details"}
                                                className="bg-accent hover:bg-accent/80"
                                            >
                                                <ArrowLeft className="mr-2 h-4 w-4"/>
                                                Back
                                            </Button>
                                            <Button onClick={handleNextTab} className="bg-accent hover:bg-accent/80">
                                                Next
                                                <ArrowRight className="ml-2 h-4 w-4"/>
                                            </Button>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="users" className="space-y-4">
                                        <div className="space-y-4">
                                            <div className="flex items-center space-x-2">
                                                <Users className="h-5 w-5"/>
                                                <h3 className="text-lg font-semibold">Assign Team Members</h3>
                                            </div>

                                            {userList.length === 0 ? (
                                                <div className="p-4 text-center">
                                                    <p>No users found. Please try refreshing the page.</p>
                                                    <Button onClick={GetUsers}
                                                            className="mt-2 bg-accent hover:bg-accent/80">
                                                        Refresh Users
                                                    </Button>
                                                </div>
                                            ) : (
                                                <ScrollArea
                                                    className="h-[300px] rounded-md p-4 shadow-2xl border border-base-100">
                                                    <div className="space-y-4">
                                                        {userList.map((user, index) => (
                                                            <div
                                                                key={index}
                                                                className="flex items-center space-x-2 p-2 hover:bg-base-100/20 rounded-md"
                                                            >
                                                                <Checkbox
                                                                    id={`user-${user.email}`}
                                                                    checked={selectedUsers.has(user.email)}
                                                                    onCheckedChange={() => handleCheckboxChange(user.email)}
                                                                    className="border-base-100"
                                                                />
                                                                <Label
                                                                    htmlFor={`user-${user.email}`}
                                                                    className="flex items-center space-x-2 cursor-pointer w-full"
                                                                >
                                                                    <div className="flex flex-col">
                                                                        <span className="font-medium">{user.name}</span>
                                                                        <span
                                                                            className="text-xs text-muted-foreground">{user.email}</span>
                                                                    </div>
                                                                    {user.email === uEmail && (
                                                                        <span
                                                                            className="text-xs bg-accent px-2 py-1 rounded-full ml-auto">You</span>
                                                                    )}
                                                                </Label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </ScrollArea>
                                            )}

                                            <div className="mt-4 p-4 bg-base-100/20 rounded-md">
                                                <p className="text-sm">
                                                    <span className="font-semibold">Selected: </span>
                                                    {selectedUsers.size} user{selectedUsers.size !== 1 ? "s" : ""}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between mt-4">
                                            <Button onClick={handlePreviousTab}
                                                    className="bg-accent hover:bg-accent/80">
                                                <ArrowLeft className="mr-2 h-4 w-4"/>
                                                Back
                                            </Button>
                                            <Button onClick={handleNextTab} className="bg-accent hover:bg-accent/80">
                                                Next
                                                <ArrowRight className="ml-2 h-4 w-4"/>
                                            </Button>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="review" className="space-y-6">
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <h3 className="text-lg font-semibold flex items-center">
                                                    <CheckCircle2 className="mr-2 h-5 w-5"/>
                                                    Task Summary
                                                </h3>
                                                <div
                                                    className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-base-100/20 p-4 rounded-md">
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Title</p>
                                                        <p className="font-medium">{title || "Not set"}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Priority</p>
                                                        <p className="flex items-center">
                                                            <span
                                                                className={`w-3 h-3 rounded-full mr-2 ${getPriorityColor(priority)}`}></span>
                                                            {priority}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Due Date</p>
                                                        <p className="font-medium">{dueDate ? format(dueDate, "PPP") : "Not set"}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Source</p>
                                                        <p className="font-medium truncate">{source || "Not set"}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-2 bg-base-100/20 p-4 rounded-md">
                                                <h4 className="text-sm font-semibold">Description</h4>
                                                <p className="text-sm whitespace-pre-wrap break-words">
                                                    {description || "No description provided"}
                                                </p>
                                            </div>
                                            <div className="space-y-2 bg-base-100/20 p-4 rounded-md">
                                                <h4 className="text-sm font-semibold">Assigned Users
                                                    ({selectedUsers.size})</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {Array.from(selectedUsers).map((email) => {
                                                        const user = userList.find((u) => u.email === email)
                                                        return (
                                                            <span
                                                                key={email}
                                                                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-accent"
                                                            >
                                {user ? user.name : email}
                                                                {email === uEmail && " (You)"}
                              </span>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                            <div className="flex justify-between mt-4">
                                                <Button onClick={handlePreviousTab}
                                                        className="bg-accent hover:bg-accent/80">
                                                    <ArrowLeft className="mr-2 h-4 w-4"/>
                                                    Back
                                                </Button>
                                                <Button onClick={TaskData} className="bg-accent hover:bg-accent/80"
                                                        disabled={submitting}>
                                                    {submitting ? (
                                                        <>
                                                            <svg
                                                                className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
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
                                                            Creating...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle2 className="mr-2 h-4 w-4"/>
                                                            Create Task
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </div>
    )
}

export default CreateTask
