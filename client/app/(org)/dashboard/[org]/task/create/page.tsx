"use client";
import React, {FC, useCallback, useEffect, useState} from "react";
import axios, {AxiosResponse} from "axios";
import {apiUrl} from "@/app/api/config";
import Cookies from "js-cookie";
import {sessionCheck, UserData, UserHasRight} from "@/app/func/funcs";
import {Poppins} from "next/font/google";
import SideMenu from "@/app/components/Side-menu";
import {getOrgName} from "@/app/func/org";
import Loading from "@/app/components/Loading";

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

const CreateTask: FC<PageProps> = ({params}) => {
    const [title, setTitle] = useState("");
    const [uEmail, setUEmail] = useState("")
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("LOW");
    const [loading, setLoading] = useState<boolean>(true)
    const [source, setSource] = useState("");
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
    const [selectedMonth, setSelectedMonth] = useState(
        (new Date().getMonth() + 1).toString().padStart(2, "0")
    );
    const [selectedDay, setSelectedDay] = useState(
        new Date().getDate().toString().padStart(2, "0")
    );
    const [selectedYear, setSelectedYear] = useState(
        new Date().getFullYear().toString()
    );
    const [dueDate, setDueDate] = useState(
        `${selectedMonth}/${selectedDay}/${selectedYear}`
    );
    const [orgNameCheck, setOrgNameCheck] = useState<string>("");
    const orgName = params.org;
    const progress = 0;
    const status = "Due";

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

    useEffect(() => {
        const refreshToken = Cookies.get("azionRefreshToken");
        const accessToken = Cookies.get("azionAccessToken");
        if (refreshToken && accessToken) {
            sessionCheck();
        } else if (!accessToken && !refreshToken) {
            window.location.href = "/login";
        }

        UserHasRight("task:write");


        GetUsers();
        UserData().then((data) => {
                setUEmail(data.email)
                setLoading(false)
        });
    }, [orgName]);

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

    const TaskData = async () => {
        const missingFields = [];
        if (!title) missingFields.push("Title");
        if (!description) missingFields.push("Description");
        if (!source) missingFields.push("Source");

        if (missingFields.length > 0) {
            alert("Please fill in the following fields: " + missingFields.join(", "));
            return;
        }
        const data = {
            accessToken: Cookies.get("azionAccessToken"),
            title,
            description,
            dueDate,
            priority,
            status,
            progress,
            source,
            users: Array.from(selectedUsers),
        };
        axios
            .post(`${apiUrl}/projects/create/new`, data, {
                headers: {
                    "Content-Type": "application/json",
                },
            })
            .then((response: AxiosResponse) => {
                alert("Task created");
            })
            .catch((error) => {
                alert("Error creating task: " + error.response.data);
            });
    };

    const isLeapYear = (year: number): boolean => {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    };

    const isValidDate = useCallback((day: string, month: string, year: string): boolean => {
        const dayInt = parseInt(day);
        const monthInt = parseInt(month);
        const yearInt = parseInt(year);

        if (monthInt === 2) {
            if (isLeapYear(yearInt)) {
                return dayInt <= 29;
            } else {
                return dayInt <= 28;
            }
        }

        const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        return dayInt <= daysInMonth[monthInt - 1];
    }, []);

    const handleDueDateChange = useCallback(() => {
        if (isValidDate(selectedDay, selectedMonth, selectedYear)) {
            setDueDate(`${selectedMonth}/${selectedDay}/${selectedYear}`);
        } else {
            alert("Invalid date");
        }
    }, [selectedDay, selectedMonth, selectedYear, isValidDate]);

    useEffect(() => {
        handleDueDateChange();
    }, [selectedDay, selectedMonth, selectedYear, handleDueDateChange]);

    const months = Array.from({length: 12}, (_, i) =>
        (i + 1).toString().padStart(2, "0")
    ).filter(
        (month) =>
            parseInt(selectedYear) > new Date().getFullYear() ||
            parseInt(month) >= new Date().getMonth() + 1
    );

    const days = Array.from({length: 31}, (_, i) =>
        (i + 1).toString().padStart(2, "0")
    ).filter(
        (day) =>
            isValidDate(day, selectedMonth, selectedYear) &&
            (parseInt(selectedMonth) > new Date().getMonth() + 1 ||
                parseInt(selectedYear) > new Date().getFullYear() ||
                parseInt(day) >= new Date().getDate())
    );

    const years = Array.from({length: 11}, (_, i) =>
        (new Date().getFullYear() + i).toString()
    );

    const userList = Array.isArray(users) ? users : [];
    const priorities = ["LOW", "MEDIUM", "HIGH", "VERY_HIGH"];

    useEffect(() => {
        const fetchOrgName = async () => {
            const result: string = await getOrgName();
            setOrgNameCheck(result);
        };

        fetchOrgName();
    }, [orgName]);

    useEffect(() => {
        if (orgNameCheck && orgNameCheck !== orgName) {
            window.location.href = `/dashboard/${orgNameCheck}/task/create`;
        }
    }, [orgNameCheck, orgName]);


    return (
        <div
            className="w-full h-dvh flex flex-col lg:flex-row justify-start items-start text-white overflow-hidden">
            {loading ? (
                <div className="flex w-screen h-screen items-center justify-center">
                    <Loading/>
                </div>
            ) : (
                <>
                    {/* Sidebar */}
                    <div className=" lg:w-1/4">
                        <SideMenu/>
                    </div>

                    {/* Main Content */}
                    <div className="flex w-full p-6 overflow-auto">


                        <div className="container mx-auto">
                            <h1 className={`text-3xl md:text-5xl font-bold text-center mb-8 ${HeaderText.className}`}>
                                Create Task
                            </h1>

                            <div className="flex flex-col lg:flex-row gap-4">
                                {/* Users Section */}
                                <div className="lg:w-1/2 bg-base-300 rounded-xl p-6 shadow-md">
                                    <h2 className="text-2xl font-semibold mb-4">Select Users</h2>
                                    <ul className="space-y-3">
                                        {userList.map((user, index) => (
                                            <li
                                                key={index}
                                                onClick={() => handleCheckboxChange(user.email)}
                                                className={`p-3 cursor-pointer rounded-lg text-center transition-all ${
                                                    selectedUsers.has(user.email)
                                                        ? "bg-blue-600 text-white cursor-pointer"
                                                        : "bg-base-200 hover:bg-base-100 cursor-pointer"
                                                }`}
                                            >
                                                <label
                                                    className="flex w-fit justify-between items-center">
                                                    {user.email === uEmail ? (
                                                        <>
                                                            <span>{user.name} (You)</span>
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedUsers.has(user.email)}
                                                                onChange={() => handleCheckboxChange(user.email)}
                                                                className="hidden"
                                                            />
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span>{user.name}</span>
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedUsers.has(user.email)}
                                                                onChange={() => handleCheckboxChange(user.email)}
                                                                className="hidden"
                                                            />
                                                        </>
                                                    )}
                                                </label>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Task Form */}
                                <div className="lg:w-1/2 bg-base-300 rounded-xl p-6 shadow-md">
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            TaskData();
                                        }}
                                        className="space-y-6"
                                    >
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Title</label>
                                            <input
                                                type="text"
                                                name="title"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                className="w-full bg-base-100 rounded-md text-white py-2 px-3 focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Description</label>
                                            <textarea
                                                name="description"
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                className="w-full bg-base-100 rounded-md text-white py-2 px-3 focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Due Date</label>
                                            <div className="flex space-x-2">
                                                <select
                                                    value={selectedDay}
                                                    onChange={(e) => setSelectedDay(e.target.value)}
                                                    className="bg-base-100 rounded-md text-white py-2 px-3 focus:ring-2 focus:ring-blue-500"
                                                >
                                                    {days.map((day) => (
                                                        <option key={day} value={day}>
                                                            {day}
                                                        </option>
                                                    ))}
                                                </select>
                                                <select
                                                    value={selectedMonth}
                                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                                    className="bg-base-100 rounded-md text-white py-2 px-3 focus:ring-2 focus:ring-blue-500"
                                                >
                                                    {months.map((month) => (
                                                        <option key={month} value={month}>
                                                            {month}
                                                        </option>
                                                    ))}
                                                </select>
                                                <select
                                                    value={selectedYear}
                                                    onChange={(e) => setSelectedYear(e.target.value)}
                                                    className="bg-base-100 rounded-md text-white py-2 px-3 focus:ring-2 focus:ring-blue-500"
                                                >
                                                    {years.map((year) => (
                                                        <option key={year} value={year}>
                                                            {year}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Priority</label>
                                            <select
                                                value={priority}
                                                onChange={(e) => setPriority(e.target.value)}
                                                className="w-full bg-base-100 rounded-md text-white py-2 px-3 focus:ring-2 focus:ring-blue-500"
                                            >
                                                {priorities.map((prio) => (
                                                    <option key={prio} value={prio}>
                                                        {prio}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Source</label>
                                            <input
                                                type="text"
                                                name="source"
                                                value={source}
                                                onChange={(e) => setSource(e.target.value)}
                                                className="w-full bg-base-100 rounded-md text-white py-2 px-3 focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
                                        >
                                            Create Task
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CreateTask;
