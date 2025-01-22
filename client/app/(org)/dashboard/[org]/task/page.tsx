"use client";

import React, {FC, useEffect, useMemo, useState} from "react";
import axios from "axios";
import {apiUrl} from "@/app/api/config";
import {Poppins} from "next/font/google";
import Cookies from "js-cookie";
import {sessionCheck, UserData, UserHasRight} from "@/app/func/funcs";
import Link from "next/link";
import SideMenu from "@/app/components/Side-menu";
import TasksCard from "@/app/layouts/TasksCard";
import {getOrgName} from "@/app/func/org";
import Loading from "@/app/components/Loading";
import SortMenu from "@/app/components/_task/sort-menu";
import {Task} from "@/app/types/types";
import {CiSquarePlus} from "react-icons/ci";

const headerText = Poppins({subsets: ["latin"], weight: "900"});

interface PageProps {
    params: {
        org: string;
    };
}

const Tasks: FC<PageProps> = ({params}) => {
    const [admin, setAdmin] = useState(false);
    const [tasks, setTasks] = useState<Task[] | null>(null);
    const [orgNameCheck, setOrgNameCheck] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [sortCriteria, setSortCriteria] = useState<string>("date");
    const [sortOrder, setSortOrder] = useState<string>("asc");
    const [currentUserEmail, setCurrentUserEmail] = useState<string>("");
    const orgName = params.org;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const refreshToken = Cookies.get("azionRefreshToken");
                const accessToken = Cookies.get("azionAccessToken");
                if (refreshToken && accessToken) {
                    await sessionCheck();
                    const [userData, orgNameResult, tasksResponse] = await Promise.all([
                        UserData(),
                        getOrgName(),
                        axios.get(`${apiUrl}/projects/list`, {
                            headers: {
                                "Content-Type": "application/json",
                                authorization: accessToken,
                            },
                        }),
                    ]);

                    UserHasRight(5);

                    setCurrentUserEmail(userData.email);
                    setOrgNameCheck(orgNameResult);
                    setTasks(tasksResponse.data.message === "no projects" ? null : tasksResponse.data);
                    setLoading(false);
                } else {
                    window.location.href = "/login";
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, [orgName]);

    useEffect(() => {
        if (orgNameCheck && orgNameCheck !== orgName) {
            window.location.href = `/dashboard/${orgNameCheck}/task`;
        }
    }, [orgNameCheck, orgName]);

    const sortedTasks = useMemo(() => {
        if (Array.isArray(tasks)) {
            return tasks.sort((a, b) => {
                if (sortCriteria === "date") {
                    return sortOrder === "asc" ? new Date(a.date).getTime() - new Date(b.date).getTime() : new Date(b.date).getTime() - new Date(a.date).getTime();
                } else if (sortCriteria === "priority") {
                    const priorityOrder = ["low", "medium", "high", "very_high"];
                    return sortOrder === "asc" ? priorityOrder.indexOf(a.priority.toLowerCase()) - priorityOrder.indexOf(b.priority.toLowerCase()) : priorityOrder.indexOf(b.priority.toLowerCase()) - priorityOrder.indexOf(a.priority.toLowerCase());
                } else if (sortCriteria === "status") {
                    return sortOrder === "asc" ? a.status.localeCompare(b.status) : b.status.localeCompare(a.status);
                }
                return 0;
            });
        } else {
            return [];
        }
    }, [tasks, sortCriteria, sortOrder]);

    if (loading) {
        return (
            <div className="w-screen h-screen flex justify-center items-center">
                <Loading/>
            </div>
        );
    }

    return (
        <div className="w-full h-dvh flex flex-col lg:flex-row justify-start items-start overflow-hidden">
            <div className="lg:w-1/4 h-fit">
                <SideMenu/>
            </div>
            <div className="w-full h-full overflow-auto flex flex-col justify-start items-center p-6 lg:p-10">
                <div className="flex flex-col justify-around items-center gap-10 w-full max-w-4xl mx-auto">
                    <h1 className="text-5xl font-black mt-16 text-center">Your tasks:</h1>
                    <SortMenu
                        sortCriteria={sortCriteria}
                        sortOrder={sortOrder}
                        setSortCriteria={setSortCriteria}
                        setSortOrder={setSortOrder}
                    />
                    <div className="w-full flex flex-wrap justify-center items-center gap-5">
                        {admin && (
                            <Link
                                className="w-full max-w-xs h-60 rounded-lg flex flex-col justify-center items-center overflow-hidden shadow-lg p-6 bg-base-100 cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 relative"
                                href={`/dashboard/${orgNameCheck}/task/create`}
                            >
                                <CiSquarePlus className="text-8xl mb-2"/>
                                <span className="text-lg font-semibold">Create Task</span>
                            </Link>
                        )}
                        {sortedTasks.map((task: Task) => (
                            <TasksCard
                                key={task.id}
                                title={task.name}
                                description={task.description}
                                status={task.status}
                                data={task.date}
                                createdBy={task.createdBy?.name}
                                priority={task.priority}
                                onClick={() => window.location.href = `/dashboard/${orgNameCheck}/task/view/${task.id}`}
                                isCreator={task.createdBy?.email === currentUserEmail}
                                id={task.id}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Tasks;