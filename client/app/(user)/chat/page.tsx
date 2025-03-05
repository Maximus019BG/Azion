"use client"
import type React from "react"
import {useEffect, useState} from "react"

import {Client} from "@stomp/stompjs"
import SockJS from "sockjs-client"
import {byteArrayToBase64, sessionCheck, UserData} from "@/app/func/funcs"
import {apiUrl, chatUrl} from "@/app/api/config"
import type {User} from "@/app/types/types"
import axios, {type AxiosResponse} from "axios"
import DefaultPic from "@/public/user.png"
import Cookies from "js-cookie"
import Image from "next/image"
import {Decrypt, Encrypt} from "@/app/func/msg"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faPaperPlane} from "@fortawesome/free-solid-svg-icons"
import ReturnButton from "@/app/components/ReturnButton";

const ChatPage = () => {
    const [messages, setMessages] = useState<{ content: string; from: string; to: string }[]>([])
    const [input, setInput] = useState<string>("")
    const [client, setClient] = useState<Client | null>(null)
    const [userEmail, setUserEmail] = useState("")
    const [users, setUsers] = useState<User[]>([])
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [profilePictureSrcs, setProfilePictureSrcs] = useState<{ [key: string]: string }>({})
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
                stompClient.subscribe(`/user/${userEmail}/private`, (message) => {
                    if (message.body) {
                        const newMessage = JSON.parse(message.body)
                        const decryptedContent = Decrypt(newMessage.content)
                        setMessages((prevMessages) => {
                            const updatedMessages = [
                                ...prevMessages,
                                {content: decryptedContent, from: newMessage.from, to: newMessage.to},
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
                console.error("Broker reported error: " + frame.headers["message"])
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

    const sendPrivateMessage = () => {
        if (client && client.connected && selectedUser) {
            const message = {content: Encrypt(input), from: userEmail, to: selectedUser.email}
            client.publish({destination: "/app/privateMessage", body: JSON.stringify(message)})
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

    const openChatWindow = (user: User) => {
        setSelectedUser(user)
    }

    const onEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            sendPrivateMessage()
        }
    }

    return (
        <div className="flex flex-col md:flex-row bg-base-300 text-white min-h-screen">
            {/* User List */}
            <div className="w-full md:w-1/3 lg:w-1/4 border-b md:border-r border-base-100 p-4 md:p-6 overflow-y-auto">
                <ReturnButton to={"/dashboard"}/>

                <h2 className="text-2xl md:text-4xl font-bold py-5 mb-4 md:mb-6 text-center text-lightAccent">Messages</h2>

                <div className="space-y-3 p-3 h-full border-2 border-base-100">
                    <h3 className="text-lg font-medium mb-4 text-left text-gray-300">Users to Chat</h3>
                    {users.map((user) => (
                        <div
                            key={user.email}
                            className={`flex items-center space-x-3 cursor-pointer hover:bg-base-200 rounded-lg p-2 transition-colors duration-200 ${
                                selectedUser?.email === user.email ? "bg-base-100" : ""
                            }`}
                            onClick={() => openChatWindow(user)}
                        >
                            <Image
                                src={profilePictureSrcs[user.email] || defaultImageSrc}
                                alt={`${user.name}'s profile`}
                                width={40}
                                height={40}
                                className="w-10 h-10 rounded-full"
                                onError={(e) => {
                                    e.currentTarget.src = defaultImageSrc
                                }}
                            />
                            <span className="text-sm md:text-base hover:text-blue-400 transition-colors duration-200">
                                 {user.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 p-4 md:p-6 flex flex-col">
                {selectedUser ? (
                    <>
                        <div className="flex items-center mb-4 md:mb-6 p-3 rounded-lg">
                            <Image
                                src={profilePictureSrcs[selectedUser.email] || defaultImageSrc}
                                alt={`${selectedUser.name}'s profile`}
                                width={48}
                                height={48}
                                className="rounded-full mr-3"
                                onError={(e) => {
                                    e.currentTarget.src = defaultImageSrc
                                }}
                            />
                            <h3 className="text-lg md:text-xl font-semibold text-slate-200">{selectedUser.name}</h3>
                        </div>

                        <div
                            className="flex-grow mb-4 border-2 border-base-100 p-4 rounded-lg bg-base-300 overflow-y-auto">
                            <div className="flex flex-col space-y-3">
                                {messages
                                    .filter(
                                        (msg) =>
                                            (msg.from === selectedUser.email || msg.from === userEmail) &&
                                            (msg.to === selectedUser.email || msg.to === userEmail),
                                    )
                                    .map((msg, index) => (
                                        <div key={index}
                                             className={`flex ${msg.from === userEmail ? "justify-end" : "justify-start"}`}>
                                            <div
                                                className={`chat ${msg.from === userEmail ? "chat-end" : "chat-start"}`}
                                                style={{wordBreak: "break-word", overflowWrap: "break-word"}}
                                            >
                                                <div
                                                    className={`chat-bubble ${
                                                        msg.from === userEmail ? "chat-bubble-accent" : ""
                                                    } text-white shadow-lg max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg`}
                                                >
                                                    {msg.content}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        <div className="flex items-center border-t border-base-100 pt-4">
                            <input
                                className="flex-grow rounded-l-lg p-3 text-sm bg-base-100 border-2 border-gray-600 focus:border-none text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={onEnter}
                                placeholder="Type a message..."
                            />
                            <button
                                onClick={sendPrivateMessage}
                                className="bg-blue-500 text-white px-4 py-3 rounded-r-lg hover:bg-blue-600 transition-colors duration-200"
                            >
                                <FontAwesomeIcon icon={faPaperPlane}/>
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex-grow flex items-center justify-center text-center text-gray-400 text-lg">
                        Select a user to start chatting.
                    </div>
                )}
            </div>
        </div>
    )
}

export default ChatPage

