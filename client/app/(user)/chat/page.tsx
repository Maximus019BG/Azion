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
import ReturnButton from "@/app/components/ReturnButton"
import {ArrowLeft, Edit, Info, MessageSquare, MoreVertical, Phone, Search, Send, Trash2, Video,} from "lucide-react"

const ChatPage = () => {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState<string>("")
    const [client, setClient] = useState<Client | null>(null)
    const [userEmail, setUserEmail] = useState("")
    const [users, setUsers] = useState<User[]>([])
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [profilePictureSrcs, setProfilePictureSrcs] = useState<{ [key: string]: string }>({})
    const [editingMessage, setEditingMessage] = useState<{ id: string; content: string } | null>(null)
    const [searchTerm, setSearchTerm] = useState<string>("")
    const [isMobileView, setIsMobileView] = useState<boolean>(false)
    const [showUserList, setShowUserList] = useState<boolean>(true)
    const messagesEndRef = useRef<HTMLDivElement>(null)
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
            setIsMobileView(window.innerWidth < 768)
            if (window.innerWidth < 768) {
                setShowUserList(true)
            } else {
                setShowUserList(true)
            }
        }

        handleResize()
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
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

    const sendPrivateMessage = () => {
        if (client && client.connected && selectedUser && input.trim()) {
            const messageDTO = {content: Encrypt(input), from: userEmail, to: selectedUser.email}
            client.publish({destination: "/app/privateMessage", body: JSON.stringify(messageDTO)})
            setMessages((prevMessages) => {
                const updatedMessages = [...prevMessages, {content: input, from: userEmail, to: selectedUser.email}]
                if (updatedMessages.length > 100) {
                    updatedMessages.shift()
                }
                localStorage.setItem("chatMessages", JSON.stringify(updatedMessages))
                return updatedMessages
            })
            setInput("")
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
                (msg: { id: string; content: string; from: string; to: string; edited: boolean }) => ({
                    ...msg,
                    content: Decrypt(msg.content),
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
    }

    return (
        <div
            className="flex flex-col md:flex-row bg-gradient-to-br from-[#050505] to-[#0c0c0c] text-white w-full min-h-screen">
            {/* Mobile Header */}
            {isMobileView && (
                <div className="flex items-center justify-between p-4 bg-[#0a0a0a] border-b border-[#222] shadow-lg">
                    <ReturnButton to="/dashboard"/>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] bg-clip-text text-transparent">
                        Messages
                    </h1>
                    <Button variant="ghost" size="icon" onClick={toggleUserList}
                            className="text-gray-400 hover:text-[#0ea5e9]">
                        {showUserList ? <Send className="h-5 w-5"/> : <ArrowLeft className="h-5 w-5"/>}
                    </Button>
                </div>
            )}

            {/* User List */}
            {(showUserList || !isMobileView) && (
                <div
                    className="w-full md:w-1/3 lg:w-1/4 border-r border-[#222] bg-[#0a0a0a] flex flex-col h-screen shadow-xl">
                    {!isMobileView && (
                        <div className="p-4 flex justify-center items-center border-b border-[#222]">
                            <h2 className="text-2xl font-bold ml-2 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] bg-clip-text text-transparent">
                                Messages
                            </h2>
                        </div>
                    )}

                    <div className="p-4">
                        <div className="relative">
                            <Search
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"/>
                            <Input
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 bg-[#111] border-[#333] focus:border-[#0ea5e9] text-white rounded-full shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="flex px-4 py-2 border-b border-[#222]">
                        <Button variant="ghost" className="flex-1 text-[#0ea5e9]" size="sm">
                            <MessageSquare className="h-4 w-4 mr-2"/>
                            Chats
                        </Button>
                    </div>

                    <ScrollArea className="flex-1 px-2">
                        <div className="space-y-1 py-2">
                            {filteredUsers.map((user) => (
                                <div
                                    key={user.email}
                                    className={`flex items-center space-x-3 cursor-pointer rounded-xl p-3 transition-all duration-200 ${
                                        selectedUser?.email === user.email
                                            ? "bg-gradient-to-r from-[#0c4a6e] to-[#0c4a6e]/50 shadow-[0_0_10px_rgba(14,165,233,0.2)]"
                                            : "hover:bg-[#111]"
                                    }`}
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
                                                className="rounded-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.src = defaultImageSrc
                                                }}
                                            />
                                        </div>
                                        <span
                                            className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0a0a0a]"></span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{user.name}</p>
                                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            )}

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col h-screen ${isMobileView && showUserList ? "hidden" : "block"}`}>
                {selectedUser ? (
                    <>
                        {/* Chat Header */}
                        <div className="flex items-center p-4 border-b border-[#222] bg-[#0a0a0a] shadow-md">
                            {isMobileView && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={toggleUserList}
                                    className="mr-2 text-gray-400 hover:text-[#0ea5e9]"
                                >
                                    <ArrowLeft className="h-5 w-5"/>
                                </Button>
                            )}
                            <div className="relative">
                                <Image
                                    src={profilePictureSrcs[selectedUser.email] || defaultImageSrc}
                                    alt={`${selectedUser.name}'s profile`}
                                    width={44}
                                    height={44}
                                    className="rounded-full mr-3 object-cover ring-2 ring-[#0ea5e9]/30 p-0.5"
                                    onError={(e) => {
                                        e.currentTarget.src = defaultImageSrc
                                    }}
                                />
                                <span
                                    className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0a0a0a]"></span>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold">{selectedUser.name}</h3>
                                <p className="text-xs text-gray-400">{selectedUser.email}</p>
                            </div>
                            <div className="flex space-x-1">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon"
                                                    className="text-gray-400 hover:text-[#0ea5e9]">
                                                <Phone className="h-5 w-5"/>
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
                                            <Button variant="ghost" size="icon"
                                                    className="text-gray-400 hover:text-[#0ea5e9]">
                                                <Video className="h-5 w-5"/>
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
                                                    className="text-gray-400 hover:text-[#0ea5e9]">
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
                        <ScrollArea className="flex-1 p-4 bg-gradient-to-b from-[#080808] to-[#0a0a0a]">
                            <div className="flex flex-col space-y-4">
                                {messages
                                    .filter(
                                        (msg) =>
                                            (msg.from === selectedUser.email || msg.from === userEmail) &&
                                            (msg.to === selectedUser.email || msg.to === userEmail),
                                    )
                                    .map((msg, index) => (
                                        <div key={index}
                                             className={`flex ${msg.from === userEmail ? "justify-end" : "justify-start"}`}>
                                            <div className="max-w-[80%] group">
                                                <div
                                                    className={`relative rounded-2xl px-4 py-2 shadow-lg ${
                                                        msg.from === userEmail
                                                            ? "bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] text-white rounded-tr-none"
                                                            : "bg-[#1a1a1a] text-white rounded-tl-none border border-[#222]"
                                                    }`}
                                                >
                                                    <p className="break-words">{msg.content}</p>
                                                    {msg.edited && (
                                                        <span
                                                            className="text-xs opacity-70 ml-2 inline-flex items-center">
                              <Edit className="h-3 w-3 mr-1"/>
                              edited
                            </span>
                                                    )}

                                                    {msg.from === userEmail && msg.id && (
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="absolute -right-10 top-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                >
                                                                    <MoreVertical className="h-4 w-4 text-gray-400"/>
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
                                                                    }}
                                                                    className="flex items-center cursor-pointer hover:bg-[#222]"
                                                                >
                                                                    <Edit className="h-4 w-4 mr-2"/>
                                                                    Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => deleteMessage(msg.id!)}
                                                                    className="flex items-center cursor-pointer text-red-500 hover:bg-[#222]"
                                                                >
                                                                    <Trash2 className="h-4 w-4 mr-2"/>
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1 px-2">
                                                    {new Date().toLocaleTimeString([], {
                                                        hour: "2-digit",
                                                        minute: "2-digit"
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                <div ref={messagesEndRef}/>
                            </div>
                        </ScrollArea>

                        {/* Message Input */}
                        <div className="p-4 border-t border-[#222] bg-[#0a0a0a]">
                            <div className="flex items-center">
                                <Input
                                    className="flex-grow bg-[#111] border-[#333] focus:border-[#0ea5e9] text-white rounded-full shadow-inner"
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={onEnter}
                                    placeholder={editingMessage ? "Edit message..." : "Type a message..."}
                                />
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                onClick={editingMessage ? () => updateMessage(editingMessage.id, input) : sendPrivateMessage}
                                                className="ml-2 bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] hover:from-[#0284c7] hover:to-[#0369a1] rounded-full shadow-[0_0_10px_rgba(14,165,233,0.3)]"
                                                disabled={!input.trim()}
                                            >
                                                {editingMessage ? <Edit className="h-5 w-5"/> :
                                                    <Send className="h-5 w-5"/>}
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
                                                    className="ml-2 text-gray-400 hover:text-[#0ea5e9]"
                                                >
                                                    <ArrowLeft className="h-5 w-5"/>
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
                            className="w-24 h-24 bg-gradient-to-br from-[#0c4a6e] to-[#0c4a6e]/30 rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(14,165,233,0.2)]">
                            <Send className="h-12 w-12 text-[#0ea5e9]"/>
                        </div>
                        <h3 className="text-2xl font-semibold mb-3 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] bg-clip-text text-transparent">
                            Your Messages
                        </h3>
                        <p className="text-gray-400 max-w-md">
                            Select a user from the list to start a conversation or continue where you left off.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ChatPage
