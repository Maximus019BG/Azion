"use client";
import React, {useEffect, useState} from "react";
import {Client} from "@stomp/stompjs";
import SockJS from "sockjs-client";
import {byteArrayToBase64, sessionCheck, UserData} from "@/app/func/funcs";
import {apiUrl, chatUrl} from "@/app/api/config";
import {User} from "@/app/types/types";
import axios, {AxiosResponse} from "axios";
import DefaultPic from "@/public/user.png";
import Cookies from "js-cookie";
import Image from "next/image";
import {Decrypt, Encrypt} from "@/app/func/msg";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleLeft} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

const ChatPage = () => {
    const [messages, setMessages] = useState<{ content: string; from: string }[]>([]);
    const [input, setInput] = useState<string>("");
    const [client, setClient] = useState<Client | null>(null);
    const [userEmail, setUserEmail] = useState("");
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [profilePictureSrcs, setProfilePictureSrcs] = useState<{ [key: string]: string }>({});
    const defaultImageSrc = typeof DefaultPic === 'string' ? DefaultPic : DefaultPic.src;


    const getProfilePictureSrc = async (profilePicture: string | null): Promise<string | null> => {
        if (profilePicture) {
            const byteArray = JSON.parse(profilePicture);
            return await byteArrayToBase64(byteArray);
        }
        return null;
    };

    useEffect(() => {
        sessionCheck();
        UserData().then((data) => {
            setUserEmail(data.email);
        });
    }, []);

    useEffect(() => {
        if (!userEmail) return;

        const GetUsers = async () => {
            try {
                const response: AxiosResponse = await axios.get(`${apiUrl}/org/list/employees`, {
                    headers: {
                        "Content-Type": "application/json",
                        authorization: Cookies.get("azionAccessToken"),
                    },
                });

                const filteredUsers = response.data.filter((user: User) => user.email !== userEmail);
                setUsers(filteredUsers);

                const picturePromises = filteredUsers.map(async (user: User) => {
                    const src = await getProfilePictureSrc(user.profilePicture);
                    return {email: user.email, src};
                });

                const pictures = await Promise.all(picturePromises);
                const pictureMap = pictures.reduce((acc, {email, src}) => {
                    acc[email] = src;
                    return acc;
                }, {} as { [key: string]: string });

                setProfilePictureSrcs(pictureMap);
            } catch (error: any) {
                console.error(error.response ? error.response : error);
            }
        };

        const socket = new SockJS(`${chatUrl}`);
        const stompClient = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            onConnect: () => {
                stompClient.subscribe(`/user/${userEmail}/private`, (message) => {
                    if (message.body) {
                        const newMessage = JSON.parse(message.body);
                        const decryptedContent = Decrypt(newMessage.content);
                        setMessages((prevMessages) => [...prevMessages, {
                            content: decryptedContent,
                            from: newMessage.from
                        }]);
                    }
                });
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            }
        });

        stompClient.activate();
        setClient(stompClient);
        GetUsers();

        return () => {
            if (stompClient) stompClient.deactivate();
        };
    }, [userEmail]);

    const sendPrivateMessage = () => {
        if (client && client.connected && selectedUser) {
            const message = {content: Encrypt(input), from: userEmail, to: selectedUser.email};
            client.publish({destination: "/app/privateMessage", body: JSON.stringify(message)});
            setInput("");
            setMessages((prevMessages) => [...prevMessages, {content: input, from: userEmail}]);
        }
    };

    const openChatWindow = (user: User) => {
        setSelectedUser(user);
    };

    //!Enter as submit
    const onEnter = (e: any) => {
        if (e.key == 'Enter') {
            sendPrivateMessage();
        }
    }

    return (
        <div className="flex text-white min-h-screen">
            {/* User List */}
            <div className="w-1/3 max-w-xs border-r border-gray-600 p-6">
                <Link className="absolute right-6 top-6" href="/dashboard/org">
                    <FontAwesomeIcon
                        className="text-4xl bg-white rounded-full text-lightAccent"
                        icon={faCircleLeft}
                    />
                </Link>
                <h2 className="text-4xl font-bold mb-6 text-center">Direct Messages</h2>
                <h3 className="text-lg font-medium mb-4 text-center">Users to Chat:</h3>
                <div className="space-y-4">
                    {users.map((user) => (
                        <div
                            key={user.email}
                            className="flex items-center space-x-3 cursor-pointer hover:bg-gray-700 rounded-lg p-2 transition"
                            onClick={() => openChatWindow(user)}
                        >
                            <Image
                                src={profilePictureSrcs[user.email] || defaultImageSrc}
                                alt={`${user.name}'s profile`}
                                width={40}
                                height={40}
                                className="w-10 h-10 rounded-full"
                                onError={(e) => {
                                    e.currentTarget.src = defaultImageSrc;
                                }}
                            />
                            <span className="text-base hover:text-blue-400">
                                {user.name} <span className="text-sm text-gray-400">({user.email})</span>
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 p-6">
                {selectedUser ? (
                    <>
                        <div className="flex items-center mb-6">
                            <Image
                                src={profilePictureSrcs[selectedUser.email] || defaultImageSrc}
                                alt={`${selectedUser.name}'s profile`}
                                width={56}
                                height={56}
                                className="rounded-full mr-3"
                                onError={(e) => {
                                    e.currentTarget.src = defaultImageSrc;
                                }}
                            />
                            <h3 className="text-xl font-semibold text-white">{selectedUser.name}</h3>
                        </div>

                        <div
                            className="h-[77vh] mb-4 border border-gray-600 p-4 rounded-lg bg-gray-800">
                            <div className="flex flex-col space-y-3">
                                {messages
                                    .filter((msg) => msg.from === selectedUser.email || msg.from === userEmail)
                                    .map((msg, index) => (
                                        <div
                                            key={index}
                                            className={`flex ${msg.from === userEmail ? "justify-end" : "justify-start"}`}
                                        >
                                            {msg.from === userEmail && (
                                                <div
                                                    className={`chat chat-end`}
                                                    style={{wordBreak: "break-word", overflowWrap: "break-word"}}
                                                >
                                                    <div
                                                        className="chat-bubble chat-bubble-accent text-white shadow-lg w-36 flex justify-center items-center rounded-br-none">
                                                        {msg.content}
                                                    </div>
                                                </div>)}
                                            {msg.from !== userEmail && (
                                                <div
                                                    className={`chat chat-start`}
                                                    style={{wordBreak: "break-word", overflowWrap: "break-word"}}
                                                >
                                                    <div
                                                        className="chat-bubble text-white shadow-lg w-36 flex justify-center items-center rounded-br-none">
                                                        {msg.content}
                                                    </div>
                                                </div>)}
                                        </div>

                                    ))}
                            </div>
                        </div>

                        <div className="flex items-center border-t border-gray-600 pt-4">
                            <input
                                className="flex-grow border border-gray-500 rounded-lg p-3 text-sm bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => onEnter(e)}
                                placeholder="Type a message..."
                            />
                            <button
                                onClick={sendPrivateMessage}
                                className="ml-3 bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-600 transition"
                            >
                                Send
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="text-center text-gray-400 text-lg">Select a user to start chatting.</div>
                )}
            </div>
        </div>
    );
};

export default ChatPage;