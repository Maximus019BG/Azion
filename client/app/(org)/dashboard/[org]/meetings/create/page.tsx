"use client";
import React, {FC, useEffect, useState} from "react";
import axios, {AxiosResponse} from "axios";
import {apiUrl} from "@/app/api/config";
import Cookies from "js-cookie";
import {Poppins} from "next/font/google";

const HeaderText = Poppins({subsets: ["latin"], weight: "600"});

interface User {
    name: string;
    email: string;
    age: number;
    role: string;
    id: string;
}

interface PageProps {
    params: {
        org: string;
    };
}

const CreateMeeting: FC<PageProps> = ({params}) => {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
    const [topic, setTopic] = useState("");
    const [description, setDescription] = useState("");
    const [day, setDay] = useState("Monday");
    const [startHour, setStartHour] = useState("");
    const [endHour, setEndHour] = useState("");

    // Fetch users when component mounts
    useEffect(() => {
        GetUsers();
    }, []);

    const GetUsers = () => {
        axios
            .get(`${apiUrl}/org/list/employees`, {
                headers: {
                    "Content-Type": "application/json",
                    authorization: Cookies.get("azionAccessToken"),
                },
            })
            .then((response: AxiosResponse) => {
                setUsers(response.data);
            })
            .catch((error) => {
                console.error(error.response ? error.response : error);
            });
    };

    const handleCheckboxChange = (email: string) => {
        setSelectedUsers((prevSelectedUsers) => {
            const newSelectedUsers = new Set(prevSelectedUsers);
            if (newSelectedUsers.has(email)) {
                newSelectedUsers.delete(email);
            } else {
                newSelectedUsers.add(email);
            }
            return newSelectedUsers;
        });
    };

    const AxiosMeeting = () => {
        const data = {
            userEmails: Array.from(selectedUsers),
            topic,
            description,
            dayOfWeek: day,
            startHour,
            endHour
        };
        axios
            .post(`${apiUrl}/schedule/create/meeting`, data, {
                headers: {
                    "Content-Type": "application/json",
                    authorization: Cookies.get("azionAccessToken"),
                },
            })
            .then((response: any) => {
                console.log(response);
            })
            .catch((error: any) => {
                console.log(error);
            });
    };

    return (
        <div className="w-screen h-screen flex justify-center items-center overflow-hidden">
            <div className="flex flex-col justify-center items-center gap-16">
                <h1 className="text-5xl font-extrabold">Create Meeting</h1>
                <div className="flex justify-start items-start gap-48">
                    <div className="flex flex-col justify-start items-center gap-5">
                        <h1 className="text-3xl font-extrabold">Users:</h1>
                        <ul className="flex flex-col justify-center items-center gap-3">
                            {users.map((user, index) => (
                                <li
                                    key={index}
                                    onClick={() => handleCheckboxChange(user.email)}
                                    className={`p-2 cursor-pointer mt-0.5 mb-0.5 ${
                                        selectedUsers.has(user.email)
                                            ? "w-56 flex justify-center items-center cursor-pointer bg-accent rounded-lg"
                                            : "w-56 flex justify-center items-center cursor-pointer rounded-lg border-2 border-gray-800 hover:bg-gray-800"
                                    }`}
                                >
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            value={user.id}
                                            onChange={() => handleCheckboxChange(user.email)}
                                            className="hidden cursor-pointer"
                                        />
                                        <h1>{user.name}</h1>
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            AxiosMeeting();
                        }}
                        className="flex flex-col justify-center items-start gap-10"
                    >
                        <label className="text-xl w-full gap-5 flex justify-between items-center">
                            Topic:
                            <input
                                type="text"
                                name="topic"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                className="bg-base-100 rounded-md text-base text-white p-2"
                            />
                        </label>
                        <label className="text-xl w-full gap-5 flex justify-between items-center">
                            Description:
                            <input
                                type="text"
                                name="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="textarea bg-base-100"
                            />
                        </label>
                        <label className="text-xl w-full gap-5 flex justify-between items-center">
                            Day:
                            <input
                                type="text"
                                name="day"
                                value={day}
                                onChange={(e) => setDay(e.target.value)}
                                className="bg-base-100 rounded-md text-base text-white p-2"
                            />
                        </label>
                        <label className="text-xl w-full gap-5 flex justify-between items-center">
                            Start Hour:
                            <input
                                type="text"
                                name="startHour"
                                value={startHour}
                                onChange={(e) => setStartHour(e.target.value)}
                                className="bg-base-100 rounded-md text-base text-white p-2"
                            />
                        </label>
                        <label className="text-xl w-full gap-5 flex justify-between items-center">
                            End Hour:
                            <input
                                type="text"
                                name="endHour"
                                value={endHour}
                                onChange={(e) => setEndHour(e.target.value)}
                                className="bg-base-100 rounded-md text-base text-white p-2"
                            />
                        </label>
                        <button
                            className={`neon-text w-full h-10 bg-accent rounded-2xl text-base hover:bg-[#106092] ${HeaderText.className}`}
                            type="submit"
                        >
                            Create Meeting
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateMeeting;
