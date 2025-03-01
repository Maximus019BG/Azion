"use client"

import {type FC, useCallback, useEffect, useState} from "react"
import axios, {type AxiosResponse} from "axios"
import {apiUrl} from "@/app/api/config"
import Cookies from "js-cookie"
import {sessionCheck, UserData, UserHasRight} from "@/app/func/funcs"
import {Poppins} from "next/font/google"
import SideMenu from "@/app/components/Side-menu"
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
    const progress = 0
    const status = "Due"
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState("details")

    const GetUsers = useCallback(() => {
        setError(null)
        axios
            .get(`${apiUrl}/org/list/employees`, {
                headers: {
                    "Content-Type": "application/json",
                    authorization: Cookies.get("azionAccessToken"),
                },
            })
            .then((response: AxiosResponse) => {
                setUsers(response.data)
            })
            .catch((error) => {
                console.error(error.response ? error.response : error)
                setError("Failed to fetch users. Please try again.")
            })
    }, [])

    useEffect(() => {
        const refreshToken = Cookies.get("azionRefreshToken")
        const accessToken = Cookies.get("azionAccessToken")
        if (refreshToken && accessToken) {
            sessionCheck()
        } else if (!accessToken && !refreshToken) {
            window.location.href = "/login"
        }

        UserHasRight("tasks:write")

        GetUsers()
        UserData().then((data) => {
            setUEmail(data.email)
            setLoading(false)
        })
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

    const TaskData = async () => {
        setError(null)
        const missingFields = []
        if (!title) missingFields.push("Title")
        if (!description) missingFields.push("Description")
        if (!source) missingFields.push("Source")
        if (!dueDate) missingFields.push("Due Date")

        if (missingFields.length > 0) {
            setError(`Please fill in the following fields: ${missingFields.join(", ")}`)
            return
        }
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
            await axios.post(`${apiUrl}/projects/create/new`, data, {
                headers: {
                    "Content-Type": "application/json",
                },
            })
            alert("Task created successfully!")
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setError(`Error creating task: ${error.response?.data || "Unknown error"}`)
            } else {
                setError("An unexpected error occurred")
            }
        }
    }

    const userList = Array.isArray(users) ? users : []
    const priorities = ["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]

    const tabOrder = ["details", "users", "review"]

    const handleNextTab = () => {
        const currentIndex = tabOrder.indexOf(activeTab)
        if (currentIndex < tabOrder.length - 1) {
            setActiveTab(tabOrder[currentIndex + 1])
        }
    }

    const handlePreviousTab = () => {
        const currentIndex = tabOrder.indexOf(activeTab)
        if (currentIndex > 0) {
            setActiveTab(tabOrder[currentIndex - 1])
        }
    }

    return (
        <div className="w-full flex flex-col lg:flex-row min-h-screen bg-base-300 text-white">
            {loading ? (
                <div className="flex w-full h-full items-center justify-center">
                    <Loading/>
                </div>
            ) : (
                <>
                    <div className="w-full lg:w-1/4 lg:h-full">
                        <SideMenu/>
                    </div>
                    <div className="w-full h-full flex-1 justify-center items-center p-4 lg:p-8 overflow-auto">
                        <h1 className={`text-4xl font-bold text-center mb-8 ${HeaderText.className}`}>Create New
                            Task</h1>
                        {error && <div className="bg-accent text-white p-4 rounded-md mb-4">{error}</div>}
                        <Card className="w-full max-w-4xl mx-auto border-accent">
                            <CardContent className="p-6">
                                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                    <TabsList className="w-full text-white bg-base-100">
                                        <TabsTrigger
                                            value="details"
                                            className={"w-full h-full data-[state=active]:bg-accent text-xs sm:text-base hover:bg-accent transition duration-200 rounded-md"}
                                            onClick={() => setActiveTab("details")}

                                        >
                                            Task Details
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="users"
                                            className={"w-full h-full data-[state=active]:bg-accent text-xs sm:text-base hover:bg-accent transition duration-200 rounded-md"}
                                            onClick={() => setActiveTab("users")}

                                        >
                                            Assign Users
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="review"
                                            className={"w-full h-full data-[state=active]:bg-accent text-xs sm:text-base hover:bg-accent transition duration-200 rounded-md"}
                                            onClick={() => setActiveTab("review")}

                                        >
                                            Review & Create
                                        </TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="details" className="space-y-6">
                                        <form className="space-y-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="title">
                                                    Title <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="title"
                                                    value={title}
                                                    onChange={(e) => setTitle(e.target.value)}
                                                    placeholder="Enter task title"
                                                    className="border-2 border-base-100"
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
                                                    className=" border-2 border-base-100"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="priority">Priority</Label>
                                                    <Select value={priority} onValueChange={setPriority}>
                                                        <SelectTrigger className="border-2 border-base-100">
                                                            <SelectValue placeholder="Select priority"/>
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-base-300 border-2 border-base-100">
                                                            {priorities.map((prio) => (
                                                                <SelectItem key={prio} value={prio}
                                                                            className="cursor-pointer">
                                                                    {prio}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="source">
                                                        Source <span className="text-red-500">*</span>
                                                    </Label>
                                                    <Input
                                                        id="source"
                                                        value={source}
                                                        onChange={(e) => setSource(e.target.value)}
                                                        placeholder="Enter task source"
                                                        className="border-2 border-base-100"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2 flex flex-col ">
                                                <Label>
                                                    Due Date <span className="text-red-500">*</span>
                                                </Label>
                                                <div className="flex items-center">
                                                    <Button
                                                        variant="outline"
                                                        className={`w-full justify-start text-left font-normal ${!dueDate && "text-muted-foreground"} border-2 border-base-100`}
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
                                                    className="flex justify-center items-center w-fit rounded-md border-2 mt-2 border-base-100"
                                                />
                                            </div>
                                        </form>
                                        <div className="flex justify-between mt-4">
                                            <Button onClick={handlePreviousTab} disabled={activeTab === "details"}
                                                    className="bg-accent">
                                                <ArrowLeft className="mr-2 h-4 w-4"/>
                                                Back
                                            </Button>
                                            <Button onClick={handleNextTab} className="bg-accent">
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
                                            <ScrollArea className="h-[300px] rounded-md p-4 shadow-2xl">
                                                <div className="space-y-4">
                                                    {userList.map((user, index) => (
                                                        <div key={index} className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id={`user-${user.email}`}
                                                                checked={selectedUsers.has(user.email)}
                                                                onCheckedChange={() => handleCheckboxChange(user.email)}
                                                                className="border-base-100"
                                                            />
                                                            <Label htmlFor={`user-${user.email}`}
                                                                   className="flex items-center space-x-2">
                                                                <span>{user.email === uEmail ? `${user.name} (You)` : user.name}</span>
                                                                {user.email === uEmail && (
                                                                    <span
                                                                        className="text-xs bg-accent px-2 py-1 rounded-full">You</span>
                                                                )}
                                                            </Label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </ScrollArea>
                                        </div>
                                        <div className="flex justify-between mt-4">
                                            <Button onClick={handlePreviousTab} className="bg-accent">
                                                <ArrowLeft className="mr-2 h-4 w-4"/>
                                                Back
                                            </Button>
                                            <Button onClick={handleNextTab} className="bg-accent">
                                                Next
                                                <ArrowRight className="ml-2 h-4 w-4"/>
                                            </Button>
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="review" className="space-y-6">
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <h3 className="text-lg font-semibold">Task Summary</h3>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Title</p>
                                                        <p>{title || "Not set"}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Priority</p>
                                                        <p>{priority}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Due Date</p>
                                                        <p>{dueDate ? format(dueDate, "PPP") : "Not set"}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Source</p>
                                                        <p>{source || "Not set"}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="text-sm font-semibold">Description</h4>
                                                <p className="text-sm">{description || "No description provided"}</p>
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="text-sm font-semibold">Assigned Users</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {Array.from(selectedUsers).map((email) => (
                                                        <span
                                                            key={email}
                                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent"
                                                        >
                              {email}
                            </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex justify-between mt-4">
                                                <Button onClick={handlePreviousTab} className="bg-accent">
                                                    <ArrowLeft className="mr-2 h-4 w-4"/>
                                                    Back
                                                </Button>
                                                <Button onClick={TaskData} className="bg-accent">
                                                    <CheckCircle2 className="mr-2 h-4 w-4"/>
                                                    Create Task
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

