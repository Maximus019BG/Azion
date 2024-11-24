"use client";

import React, {FC, useEffect, useState} from "react";
import axios, {AxiosResponse} from "axios";
import {apiUrl} from "@/app/api/config";
import {Poppins} from "next/font/google";
import Cookies from "js-cookie";
import {sessionCheck, UserData} from "@/app/func/funcs";
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
    const [task, setTask] = useState<Task[] | null>(null);
    const [orgNameCheck, setOrgNameCheck] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [sortCriteria, setSortCriteria] = useState<string>("date");
    const [sortOrder, setSortOrder] = useState<string>("asc");
    const [currentUserEmail, setCurrentUserEmail] = useState<string>("");
    const orgName = params.org;

    const GetTasks = () => {
        axios
            .get(`${apiUrl}/projects/list`, {
                headers: {
                    "Content-Type": "application/json",
                    authorization: Cookies.get("azionAccessToken"),
                },
            })
            .then((response: AxiosResponse) => {
                setTask(response.data);
                if (response.data.message.toString() === "no projects") {
                    setTask(null);
                }
                setLoading(false);
            })
            .catch((error) => {
                console.error(error.response ? error.response : error);
                setLoading(false);
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
        GetTasks();
    }, []);

    UserData().then((data) => {
        if (data.roleLevel >= 1 && data.roleLevel <= 3) {
            setAdmin(true);
        }
        setCurrentUserEmail(data.email);
    });

    useEffect(() => {
        const fetchOrgName = async () => {
            const result: string = await getOrgName();
            setOrgNameCheck(result);
        };

        fetchOrgName();
    }, [orgName]);

    useEffect(() => {
        if (orgNameCheck && orgNameCheck !== orgName) {
            window.location.href = `/dashboard/${orgNameCheck}/task`;
        }
    }, [orgNameCheck, orgName]);

    const goToTask = (id: any) => {
        window.location.href = `/dashboard/${orgNameCheck}/task/view/${id}`;
    };

    const sortTasks = (tasks: Task[] | null) => {
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
    };

    if (loading) {
        return (
            <div className="w-screen h-screen flex justify-center items-center">
                <Loading/>
            </div>
        );
    }

    return (
        <div className="w-screen h-screen flex overflow-hidden">
            <div className="lg:w-1/4 h-full">
                <SideMenu/>
            </div>
            <div className="w-full h-full overflow-auto flex flex-col items-center">
                <div className="flex flex-col justify-around items-center gap-10 ">
                    <h1 className="text-5xl font-black mt-16">Your tasks:</h1>
                    <SortMenu
                        sortCriteria={sortCriteria}
                        sortOrder={sortOrder}
                        setSortCriteria={setSortCriteria}
                        setSortOrder={setSortOrder}
                    />
                    <div className="w-full flex flex-wrap justify-center items-center gap-5">

                        {admin && (
                            <Link
                                className="w-96 h-[25.6vh] flex flex-col justify-center items-center rounded-lg overflow-hidden shadow-lg p-6 bg-base-100 text-white cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-2xl relative"
                                href={`/dashboard/${orgNameCheck}/task/create`}
                            >
                                <CiSquarePlus className="text-8xl mb-2"/>
                                <span className="text-lg font-semibold">Create Task</span>
                            </Link>
                        )}
                        {task !== null && sortTasks(task).map((task: Task) => (
                            <TasksCard
                                key={task.id}
                                title={task.name}
                                description={task.description}
                                status={task.status}
                                data={task.date}
                                createdBy={task.createdBy?.name}
                                priority={task.priority}
                                onClick={() => goToTask(task.id)}
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