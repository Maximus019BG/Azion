"use client"
import type React from "react"
import {useEffect, useRef, useState} from "react"
import {Client} from "@stomp/stompjs"
import SockJS from "sockjs-client"
import {byteArrayToBase64, sessionCheck, UserData} from "@/app/func/funcs"
import {apiUrl, chatUrl} from "@/app/api/config"
import type {Message, User} from "@/app/types/types"
import axios, {type AxiosResponse} from "axios"
import DefaultPic from "@/public/user.png"
import Cookies from "js-cookie"
import Image from "next/image"
import {Decrypt, Encrypt} from "@/app/func/msg"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {ScrollArea} from "@/components/ui/scroll-area"
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu"
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip"
import {
    ChevronLeft,
    Download,
    Edit,
    File,
    ImageIcon,
    Info,
    Menu,
    MessageSquare,
    Mic,
    MoreVertical,
    Paperclip,
    Phone,
    Search,
    Send,
    Smile,
    Trash2,
    Users,
    Video,
    X,
} from "lucide-react"
import VideoCall from "@/app/components/chat/VideoCall"

// Extend the Message type to include timestamp and file properties
interface ExtendedMessage extends Message {
    timestamp?: string
    file?: {
        name: string
        url: string
        type: string
        size: number
    }
}

const ChatPage = () => {
    const [messages, setMessages] = useState<ExtendedMessage[]>([])
    const [input, setInput] = useState<string>("")
    const [client, setClient] = useState<Client | null>(null)
    const [userEmail, setUserEmail] = useState("")
    const [users, setUsers] = useState<User[]>([])
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [profilePictureSrcs, setProfilePictureSrcs] = useState<{ [key: string]: string }>({})
    const [editingMessage, setEditingMessage] = useState<{ id: string; content: string } | null>(null)
    const [searchTerm, setSearchTerm] = useState<string>("")
    const [isMobileView, setIsMobileView] = useState<boolean>(false)
    const [isTabletView, setIsTabletView] = useState<boolean>(false)
    const [showUserList, setShowUserList] = useState<boolean>(true)
    const [showVoiceCall, setShowVoiceCall] = useState<boolean>(false)
    const [showVideoCall, setShowVideoCall] = useState<boolean>(false)
    const [isTyping, setIsTyping] = useState<boolean>(false)
    const [isUploading, setIsUploading] = useState<boolean>(false)
    const [showAttachmentMenu, setShowAttachmentMenu] = useState<boolean>(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const attachmentMenuRef = useRef<HTMLDivElement>(null)
    const defaultImageSrc = typeof DefaultPic === "string" ? DefaultPic : DefaultPic.src

    const getProfilePictureSrc = async (profilePicture: string | null): Promise<string | null> => {
        if (profilePicture) {
            const byteArray = JSON.parse(profilePicture)
            return await byteArrayToBase64(byteArray)
        }
        return null
    }

    useEffect(() => {
        sessionCheck()
        UserData().then((data) => {
            setUserEmail(data.email)
        })

        const handleResize = () => {
            const width = window.innerWidth
            setIsMobileView(width < 640)
            setIsTabletView(width >= 640 && width < 1024)

            // On mobile, start with user list visible if no user is selected
            if (width < 640) {
                setShowUserList(!selectedUser)
            } else {
                // On larger screens, always show both panels
                setShowUserList(true)
            }
        }

        handleResize()
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [selectedUser])

    // Close attachment menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (attachmentMenuRef.current && !attachmentMenuRef.current.contains(event.target as Node)) {
                setShowAttachmentMenu(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    useEffect(() => {
        if (!userEmail) return

        const GetUsers = async () => {
            try {
                const response: AxiosResponse = await axios.get(`${apiUrl}/org/list/employees`, {
                    headers: {
                        "Content-Type": "application/json",
                        authorization: Cookies.get("azionAccessToken"),
                    },
                })

                const filteredUsers = response.data.filter((user: User) => user.email !== userEmail)
                setUsers(filteredUsers)

                const picturePromises = filteredUsers.map(async (user: User) => {
                    const src = await getProfilePictureSrc(user.profilePicture)
                    return {email: user.email, src}
                })

                const pictures = await Promise.all(picturePromises)
                const pictureMap = pictures.reduce(
                    (acc, {email, src}) => {
                        acc[email] = src
                        return acc
                    },
                    {} as { [key: string]: string },
                )

                setProfilePictureSrcs(pictureMap)
            } catch (error: any) {
                console.error(error.response ? error.response : error)
            }
        }

        const socket = new SockJS(`${chatUrl}`)
        const stompClient = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            onConnect: () => {
                stompClient.subscribe(`/user/${userEmail}/private`, (messageDTO) => {
                    if (messageDTO.body) {
                        const newMessage = JSON.parse(messageDTO.body)
                        const decryptedContent = Decrypt(newMessage.content)
                        setMessages((prevMessages) => {
                            const updatedMessages = [
                                ...prevMessages,
                                {
                                    id: newMessage.id,
                                    content: decryptedContent,
                                    from: newMessage.from,
                                    to: newMessage.to,
                                    edited: newMessage.edited,
                                    timestamp: new Date().toISOString(),
                                    file: newMessage.file,
                                },
                            ]
                            if (updatedMessages.length > 100) {
                                updatedMessages.shift()
                            }
                            localStorage.setItem("chatMessages", JSON.stringify(updatedMessages))
                            return updatedMessages
                        })
                    }
                })
            },
            onStompError: (frame) => {
                console.error("Broker reported error: " + frame.headers["messageDTO"])
                console.error("Additional details: " + frame.body)
            },
        })

        stompClient.activate()
        setClient(stompClient)
        GetUsers()

        // Load messages from local storage
        const savedMessages = localStorage.getItem("chatMessages")
        if (savedMessages) {
            setMessages(JSON.parse(savedMessages))
        }

        return () => {
            if (stompClient) stompClient.deactivate()
        }
    }, [userEmail])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({behavior: "smooth"})
    }

    const sendPrivateMessage = (fileData?: { name: string; url: string; type: string; size: number }) => {
        if (client && client.connected && selectedUser && (input.trim() || fileData)) {
            const messageContent = fileData ? `Sent a file: ${fileData.name}` : input
            const messageDTO = {
                content: Encrypt(messageContent),
                from: userEmail,
                to: selectedUser.email,
                file: fileData,
            }

            client.publish({destination: "/app/privateMessage", body: JSON.stringify(messageDTO)})

            setMessages((prevMessages) => {
                const newMessage: ExtendedMessage = {
                    content: messageContent,
                    from: userEmail,
                    to: selectedUser.email,
                    timestamp: new Date().toISOString(),
                }

                if (fileData) {
                    newMessage.file = fileData
                }

                const updatedMessages = [...prevMessages, newMessage]
                if (updatedMessages.length > 100) {
                    updatedMessages.shift()
                }
                localStorage.setItem("chatMessages", JSON.stringify(updatedMessages))
                return updatedMessages
            })

            setInput("")
            setIsTyping(false)
        }
    }

    const fetchOldMessages = async (to: string, from: string) => {
        try {
            const response: AxiosResponse = await axios.get(`${apiUrl}/getOldMessages/${to}/${from}`, {
                headers: {
                    "Content-Type": "application/json",
                    authorization: Cookies.get("azionAccessToken"),
                },
            })

            const oldMessages = response.data.map(
                (msg: {
                    id: string
                    content: string
                    from: string
                    to: string
                    edited: boolean
                    timestamp?: string
                    file?: any
                }) => ({
                    ...msg,
                    content: Decrypt(msg.content),
                    timestamp: msg.timestamp || new Date().toISOString(),
                }),
            )

            setMessages((prevMessages) => [...oldMessages, ...prevMessages])
        } catch (error: any) {
            console.error(error.response ? error.response : error)
        }
    }

    const openChatWindow = (user: User) => {
        setSelectedUser(user)
        setMessages([])
        fetchOldMessages(user.email, userEmail)
        if (isMobileView) {
            setShowUserList(false)
        }
        // Focus the input field when opening a chat
        setTimeout(() => {
            inputRef.current?.focus()
        }, 100)
    }

    const onEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            if (editingMessage) {
                updateMessage(editingMessage.id, input)
            } else {
                sendPrivateMessage()
            }
        }
    }

    const deleteMessage = async (id: string) => {
        try {
            await axios.delete(`${apiUrl}/deleteMessage/${id}`, {
                headers: {
                    authorization: Cookies.get("azionAccessToken"),
                },
            })
            setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== id))
        } catch (error: any) {
            console.error(error.response ? error.response : error)
        }
    }

    const updateMessage = async (id: string, content: string) => {
        try {
            await axios.put(
                `${apiUrl}/updateMessage/${id}`,
                {content: Encrypt(content)},
                {
                    headers: {
                        "Content-Type": "application/json",
                        authorization: Cookies.get("azionAccessToken"),
                    },
                },
            )
            setMessages((prevMessages) =>
                prevMessages.map((msg) => (msg.id === id ? {...msg, content, edited: true} : msg)),
            )
            setEditingMessage(null)
            setInput("")
        } catch (error: any) {
            console.error(error.response ? error.response : error)
        }
    }

    const filteredUsers = users.filter(
        (user) =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    const toggleUserList = () => {
        setShowUserList(!showUserList)
        // If on mobile and a user is selected, this helps with navigation
        if (isMobileView && selectedUser && showUserList) {
            // We're closing the user list to show the chat
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = ""
        }
    }

    const handleVoiceCall = () => {
        if (selectedUser) {
            setShowVoiceCall(true)
        }
    }

    const handleVideoCall = () => {
        if (selectedUser) {
            setShowVideoCall(true)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value)
        if (e.target.value.length > 0 && !isTyping) {
            setIsTyping(true)
        } else if (e.target.value.length === 0 && isTyping) {
            setIsTyping(false)
        }
    }

    const formatMessageTime = (timestamp: string | undefined) => {
        if (!timestamp) return new Date().toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"})

        try {
            return new Date(timestamp).toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"})
        } catch (e) {
            return new Date().toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"})
        }
    }

    const toggleAttachmentMenu = () => {
        setShowAttachmentMenu(!showAttachmentMenu)
    }

    const handleFileUpload = (acceptType = "*/*") => {
        if (fileInputRef.current) {
            fileInputRef.current.accept = acceptType
            fileInputRef.current.click()
        }
        setShowAttachmentMenu(false)
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !selectedUser) return

        setIsUploading(true)

        try {
            // Create form data for file upload
            const formData = new FormData()
            formData.append("file", file)
            formData.append("from", userEmail)
            formData.append("to", selectedUser.email)

            // Upload file to server
            const response = await axios.post(`${apiUrl}/upload`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    authorization: Cookies.get("azionAccessToken"),
                },
            })

            // Get file URL from response
            const fileData = {
                name: file.name,
                url: response.data.url || `${apiUrl}/files/${response.data.id}`,
                type: file.type,
                size: file.size,
            }

            // Send message with file
            sendPrivateMessage(fileData)
        } catch (error) {
            console.error("Error uploading file:", error)
            // Show error notification to user
            alert("Failed to upload file. Please try again.")
        } finally {
            setIsUploading(false)
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = ""
            }
        }
    }

    const getFileIcon = (fileType: string) => {
        if (fileType.startsWith("image/")) {
            return <ImageIcon className="h-5 w-5"/>
        }
        return <File className="h-5 w-5"/>
    }

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + " B"
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
        else return (bytes / 1048576).toFixed(1) + " MB"
    }

    return (
        <div
            className="flex flex-col sm:flex-row bg-gradient-to-br from-[#050505] to-[#0c0c0c] text-white w-full min-h-screen h-screen overflow-hidden">
            {/* Hidden file input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            />

            {/* Mobile Header - Only visible on small screens */}
            {isMobileView && (
                <div
                    className="flex items-center justify-between p-3 bg-[#0a0a0a] border-b border-[#222] shadow-lg z-10">
                    <div className="w-full flex justify-center items-center">
                        <h1 className="text-lg font-bold bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] bg-clip-text text-transparent">Messages</h1>
                    </div>
                    {selectedUser && !showUserList && (
                        <Button variant="ghost" size="icon" onClick={toggleUserList}
                                className="text-gray-400 hover:text-[#0ea5e9]">
                            <ChevronLeft className="h-5 w-5"/>
                        </Button>
                    )}
                    {!selectedUser && (
                        <Button variant="ghost" size="icon" onClick={toggleUserList}
                                className="text-gray-400 hover:text-[#0ea5e9]">
                            <Menu className="h-5 w-5"/>
                        </Button>
                    )}
                </div>
            )}

            {/* User List Panel */}
            <div
                className={`
          ${isMobileView ? (showUserList ? "flex" : "hidden") : "flex"}
          ${isTabletView ? "w-1/3" : "sm:w-1/4 lg:w-1/5"}
          flex-col h-full border-r border-[#222] bg-[#0a0a0a] shadow-xl
          transition-all duration-300 ease-in-out
          ${isMobileView ? "fixed inset-0 z-30" : "relative"}
        `}
            >
                {/* Desktop Header */}
                {!isMobileView ? (
                    <div className="p-4 flex items-center justify-center border-b border-[#222]">
                        <h2 className="text-lg font-bold bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] bg-clip-text text-transparent">Messages</h2>
                    </div>
                ) : (
                    <div className="p-4 flex items-center justify-between border-b border-[#222]">
                        <h2 className="text-lg font-bold bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] bg-clip-text text-transparent">Messages</h2>
                        <Button variant="ghost" size="icon" onClick={toggleUserList}
                                className="text-gray-400 hover:text-[#0ea5e9]">
                            <X className="h-5 w-5"/>
                        </Button>
                    </div>
                )}

                {/* Search Bar */}
                <div className="p-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"/>
                        <Input
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-[#111] border-[#333] focus:border-[#0ea5e9] text-white rounded-full shadow-inner text-sm"
                        />
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex px-3 py-2 border-b border-[#222]">
                    <Button variant="ghost" className="flex-1 text-[#0ea5e9]" size="sm">
                        <MessageSquare className="h-4 w-4 mr-2"/>
                        Chats
                    </Button>
                </div>

                {/* User List */}
                <ScrollArea className="flex-1 px-2">
                    <div className="space-y-1 py-2">
                        {filteredUsers.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                                <Users className="h-12 w-12 mx-auto mb-3 opacity-30"/>
                                <p className="text-sm">No users found</p>
                                {searchTerm && (
                                    <Button variant="ghost" size="sm" onClick={() => setSearchTerm("")}
                                            className="mt-2 text-[#0ea5e9]">
                                        Clear search
                                    </Button>
                                )}
                            </div>
                        ) : (
                            filteredUsers.map((user) => (
                                <div
                                    key={user.email}
                                    className={`
                    flex items-center space-x-3 cursor-pointer rounded-xl p-3 transition-all duration-200
                    ${
                                        selectedUser?.email === user.email
                                            ? "bg-gradient-to-r from-[#0c4a6e] to-[#0c4a6e]/50 shadow-[0_0_10px_rgba(14,165,233,0.2)]"
                                            : "hover:bg-[#111]"
                                    }
                  `}
                                    onClick={() => openChatWindow(user)}
                                >
                                    <div className="relative">
                                        <div
                                            className={`${selectedUser?.email === user.email ? "ring-2 ring-[#0ea5e9] p-0.5 rounded-full" : ""}`}
                                        >
                                            <Image
                                                src={profilePictureSrcs[user.email] || defaultImageSrc}
                                                alt={`${user.name}'s profile`}
                                                width={40}
                                                height={40}
                                                className="rounded-full object-cover w-10 h-10"
                                                onError={(e) => {
                                                    e.currentTarget.src = defaultImageSrc
                                                }}
                                            />
                                        </div>
                                        <span
                                            className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0a0a0a]"></span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate text-sm">{user.name}</p>
                                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Chat Area */}
            <div
                className={`
          flex-1 flex flex-col h-full
          ${isMobileView && showUserList ? "hidden" : "flex"}
          ${isMobileView ? "absolute inset-0 z-10" : "relative"}
        `}
            >
                {selectedUser ? (
                    <>
                        {/* Chat Header */}
                        <div className="flex items-center p-3 border-b border-[#222] bg-[#0a0a0a] shadow-md">
                            {isMobileView && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={toggleUserList}
                                    className="mr-2 text-gray-400 hover:text-[#0ea5e9]"
                                >
                                    <ChevronLeft className="h-5 w-5"/>
                                </Button>
                            )}
                            <div className="relative">
                                <Image
                                    src={profilePictureSrcs[selectedUser.email] || defaultImageSrc}
                                    alt={`${selectedUser.name}'s profile`}
                                    width={40}
                                    height={40}
                                    className="rounded-full mr-3 object-cover w-10 h-10 ring-2 ring-[#0ea5e9]/30 p-0.5"
                                    onError={(e) => {
                                        e.currentTarget.src = defaultImageSrc
                                    }}
                                />
                                <span
                                    className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0a0a0a]"></span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold truncate text-sm sm:text-base">{selectedUser.name}</h3>
                                <p className="text-xs text-gray-400 truncate">{selectedUser.email}</p>
                            </div>
                            <div className="flex space-x-1">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={handleVoiceCall}
                                                className="text-gray-400 hover:text-[#0ea5e9] relative overflow-hidden group hidden sm:flex"
                                            >
                                                <span
                                                    className="absolute inset-0 bg-blue-500/10 scale-0 group-hover:scale-100 rounded-full transition-transform duration-300"></span>
                                                <Phone className="h-5 w-5 relative z-10"/>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Voice call</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={handleVideoCall}
                                                className="text-gray-400 hover:text-[#0ea5e9] relative overflow-hidden group"
                                            >
                                                <span
                                                    className="absolute inset-0 bg-blue-500/10 scale-0 group-hover:scale-100 rounded-full transition-transform duration-300"></span>
                                                <Video className="h-5 w-5 relative z-10"/>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Video call</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon"
                                                    className="text-gray-400 hover:text-[#0ea5e9] hidden sm:flex">
                                                <Info className="h-5 w-5"/>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Info</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>

                        {/* Messages */}
                        <ScrollArea className="flex-1 p-3 sm:p-4 bg-gradient-to-b from-[#080808] to-[#0a0a0a]">
                            <div className="flex flex-col space-y-3">
                                {messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full py-10">
                                        <div
                                            className="w-16 h-16 bg-gradient-to-br from-[#0c4a6e] to-[#0c4a6e]/30 rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(14,165,233,0.2)]">
                                            <MessageSquare className="h-8 w-8 text-[#0ea5e9]"/>
                                        </div>
                                        <p className="text-gray-400 text-sm text-center max-w-xs">
                                            No messages yet. Start the conversation with {selectedUser.name}.
                                        </p>
                                    </div>
                                ) : (
                                    messages
                                        .filter(
                                            (msg) =>
                                                (msg.from === selectedUser.email || msg.from === userEmail) &&
                                                (msg.to === selectedUser.email || msg.to === userEmail),
                                        )
                                        .map((msg, index, filteredMessages) => {
                                            const isFirstInGroup = index === 0 || filteredMessages[index - 1].from !== msg.from
                                            const isLastInGroup =
                                                index === filteredMessages.length - 1 || filteredMessages[index + 1].from !== msg.from

                                            return (
                                                <div
                                                    key={index}
                                                    className={`
                            flex ${msg.from === userEmail ? "justify-end" : "justify-start"}
                            ${!isLastInGroup ? "mb-1" : "mb-3"}
                            ${isFirstInGroup ? "mt-2" : ""}
                          `}
                                                >
                                                    {/* Show avatar only for first message in group from others */}
                                                    {msg.from !== userEmail && isFirstInGroup && (
                                                        <div className="flex-shrink-0 mr-2">
                                                            <Image
                                                                src={profilePictureSrcs[msg.from] || defaultImageSrc}
                                                                alt="User avatar"
                                                                width={28}
                                                                height={28}
                                                                className="rounded-full w-7 h-7"
                                                                onError={(e) => {
                                                                    e.currentTarget.src = defaultImageSrc
                                                                }}
                                                            />
                                                        </div>
                                                    )}

                                                    {/* Message content */}
                                                    <div
                                                        className={`max-w-[75%] sm:max-w-[70%] group ${msg.from !== userEmail && isFirstInGroup ? "" : msg.from !== userEmail ? "ml-9" : ""}`}
                                                    >
                                                        <div
                                                            className={`
                                relative rounded-2xl px-3 py-2 shadow-lg
                                ${
                                                                msg.from === userEmail
                                                                    ? "bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] text-white rounded-tr-none"
                                                                    : "bg-[#1a1a1a] text-white rounded-tl-none border border-[#222]"
                                                            }
                              `}
                                                        >
                                                            {/* File attachment */}
                                                            {msg.file && (
                                                                <div
                                                                    className="mb-2 bg-black/20 rounded-lg p-2 flex items-center">
                                                                    <div
                                                                        className="mr-2 bg-black/30 rounded-lg p-2">{getFileIcon(msg.file.type)}</div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-xs font-medium truncate">{msg.file.name}</p>
                                                                        <p className="text-xs opacity-70">{formatFileSize(msg.file.size)}</p>
                                                                    </div>
                                                                    <a
                                                                        href={msg.file.url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        download={msg.file.name}
                                                                        className="ml-2 p-1.5 rounded-full bg-black/20 hover:bg-black/30 transition-colors"
                                                                    >
                                                                        <Download className="h-4 w-4"/>
                                                                    </a>
                                                                </div>
                                                            )}

                                                            {/* Message text */}
                                                            <p className="break-words text-sm">
                                                                {msg.file ? (msg.content.startsWith("Sent a file:") ? "" : msg.content) : msg.content}
                                                            </p>

                                                            {msg.edited && (
                                                                <span
                                                                    className="text-xs opacity-70 ml-1 inline-flex items-center">
                                  <Edit className="h-2.5 w-2.5 mr-0.5"/>
                                  edited
                                </span>
                                                            )}

                                                            {msg.from === userEmail && msg.id && (
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="absolute -right-8 top-0 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                                                                        >
                                                                            <MoreVertical
                                                                                className="h-3.5 w-3.5 text-gray-400"/>
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end"
                                                                                         className="bg-[#1a1a1a] border-[#333] text-white">
                                                                        <DropdownMenuItem
                                                                            onClick={() => {
                                                                                setEditingMessage({
                                                                                    id: msg.id!,
                                                                                    content: msg.content
                                                                                })
                                                                                setInput(msg.content)
                                                                                inputRef.current?.focus()
                                                                            }}
                                                                            className="flex items-center cursor-pointer hover:bg-[#222] text-xs"
                                                                        >
                                                                            <Edit className="h-3.5 w-3.5 mr-2"/>
                                                                            Edit
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem
                                                                            onClick={() => deleteMessage(msg.id!)}
                                                                            className="flex items-center cursor-pointer text-red-500 hover:bg-[#222] text-xs"
                                                                        >
                                                                            <Trash2 className="h-3.5 w-3.5 mr-2"/>
                                                                            Delete
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            )}
                                                        </div>

                                                        {/* Only show timestamp for last message in group */}
                                                        {isLastInGroup && (
                                                            <div
                                                                className="text-xs text-gray-500 mt-1 px-1">{formatMessageTime(msg.timestamp)}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })
                                )}
                                <div ref={messagesEndRef}/>

                                {/* Typing indicator */}
                                {isTyping && (
                                    <div className="flex items-center text-xs text-gray-400 animate-pulse">
                                        <span className="mr-2">●</span>
                                        <span>Typing...</span>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>

                        {/* Message Input */}
                        <div className="p-3 border-t border-[#222] bg-[#0a0a0a]">
                            <div className="flex items-center">
                                {/* Attachment button with dropdown menu */}
                                <div className="relative flex-shrink-0 mr-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-gray-400 hover:text-[#0ea5e9] h-8 w-8"
                                        onClick={toggleAttachmentMenu}
                                        disabled={isUploading}
                                    >
                                        {isUploading ? (
                                            <div
                                                className="h-4 w-4 border-2 border-t-transparent border-[#0ea5e9] rounded-full animate-spin"/>
                                        ) : (
                                            <Paperclip className="h-4 w-4"/>
                                        )}
                                    </Button>

                                    {/* Attachment menu */}
                                    {showAttachmentMenu && (
                                        <div
                                            ref={attachmentMenuRef}
                                            className="absolute bottom-full left-0 mb-2 bg-[#1a1a1a] border border-[#333] rounded-lg shadow-lg z-50 w-48 overflow-hidden"
                                        >
                                            <div className="p-1">
                                                <button
                                                    onClick={() => handleFileUpload("image/*")}
                                                    className="flex items-center w-full px-3 py-2 text-sm text-white hover:bg-[#222] rounded-md"
                                                >
                                                    <ImageIcon className="h-4 w-4 mr-2 text-[#0ea5e9]"/>
                                                    <span>Image</span>
                                                </button>
                                                <button
                                                    onClick={() => handleFileUpload("application/pdf")}
                                                    className="flex items-center w-full px-3 py-2 text-sm text-white hover:bg-[#222] rounded-md"
                                                >
                                                    <File className="h-4 w-4 mr-2 text-[#0ea5e9]"/>
                                                    <span>Document</span>
                                                </button>
                                                <button
                                                    onClick={() => handleFileUpload()}
                                                    className="flex items-center w-full px-3 py-2 text-sm text-white hover:bg-[#222] rounded-md"
                                                >
                                                    <Paperclip className="h-4 w-4 mr-2 text-[#0ea5e9]"/>
                                                    <span>Other files</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="relative flex-grow">
                                    <Input
                                        ref={inputRef}
                                        className="flex-grow bg-[#111] border-[#333] focus:border-[#0ea5e9] text-white rounded-full shadow-inner pr-10 text-sm"
                                        type="text"
                                        value={input}
                                        onChange={handleInputChange}
                                        onKeyDown={onEnter}
                                        placeholder={
                                            editingMessage ? "Edit message..." : isUploading ? "Uploading file..." : "Type a message..."
                                        }
                                        disabled={isUploading}
                                    />

                                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                                        <Button variant="ghost" size="icon"
                                                className="text-gray-400 hover:text-[#0ea5e9] h-6 w-6">
                                            <Smile className="h-4 w-4"/>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-gray-400 hover:text-[#0ea5e9] h-6 w-6 sm:hidden"
                                        >
                                            <Mic className="h-4 w-4"/>
                                        </Button>
                                    </div>
                                </div>

                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                onClick={() => {
                                                    if (editingMessage) {
                                                        updateMessage(editingMessage.id, input)
                                                    } else {
                                                        sendPrivateMessage()
                                                    }
                                                }}
                                                className="ml-2 bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] hover:from-[#0284c7] hover:to-[#0369a1] rounded-full shadow-[0_0_10px_rgba(14,165,233,0.3)] h-9 w-9 flex-shrink-0"
                                                disabled={(!input.trim() && !editingMessage) || isUploading}
                                            >
                                                {editingMessage ? <Edit className="h-4 w-4"/> :
                                                    <Send className="h-4 w-4"/>}
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{editingMessage ? "Save edit" : "Send message"}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                {editingMessage && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => {
                                                        setEditingMessage(null)
                                                        setInput("")
                                                    }}
                                                    className="ml-1 text-gray-400 hover:text-[#0ea5e9] h-9 w-9 flex-shrink-0"
                                                >
                                                    <X className="h-4 w-4"/>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Cancel editing</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div
                        className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#080808] to-[#0a0a0a]">
                        <div
                            className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-[#0c4a6e] to-[#0c4a6e]/30 rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(14,165,233,0.2)]">
                            <MessageSquare className="h-10 w-10 sm:h-12 sm:w-12 text-[#0ea5e9]"/>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-semibold mb-3 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] bg-clip-text text-transparent">
                            Your Messages
                        </h3>
                        <p className="text-gray-400 max-w-md text-sm sm:text-base">
                            Select a user from the list to start a conversation or continue where you left off.
                        </p>
                        {isMobileView && (
                            <Button
                                variant="outline"
                                className="mt-6 border-[#333] hover:border-[#0ea5e9] text-gray-300 hover:text-[#0ea5e9]"
                                onClick={toggleUserList}
                            >
                                <Users className="h-4 w-4 mr-2"/>
                                Browse Users
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Voice Call Component */}
            {showVoiceCall && selectedUser && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="bg-[#0a0a0a] rounded-lg shadow-2xl max-w-md w-full p-4 border border-[#222]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Voice Call</h3>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowVoiceCall(false)}
                                className="text-gray-400 hover:text-red-500"
                            >
                                <X className="h-5 w-5"/>
                            </Button>
                        </div>
                        <div className="text-center py-6">
                            <div
                                className="w-20 h-20 mx-auto bg-[#0c4a6e] rounded-full flex items-center justify-center mb-4">
                                <Image
                                    src={profilePictureSrcs[selectedUser.email] || defaultImageSrc}
                                    alt={selectedUser.name}
                                    width={70}
                                    height={70}
                                    className="rounded-full"
                                />
                            </div>
                            <h4 className="text-lg font-medium">{selectedUser.name}</h4>
                            <p className="text-gray-400 text-sm">Calling...</p>

                            <div className="flex justify-center space-x-4 mt-8">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="bg-red-500/10 hover:bg-red-500/20 text-red-500 h-12 w-12 rounded-full"
                                    onClick={() => setShowVoiceCall(false)}
                                >
                                    <Phone className="h-6 w-6"/>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Video Call Component */}
            {showVideoCall && selectedUser && (
                <div className="fixed inset-0 z-50">
                    <VideoCall remoteUserId={selectedUser.email} onClose={() => setShowVideoCall(false)}/>
                </div>
            )}
        </div>
    )
}

export default ChatPage
