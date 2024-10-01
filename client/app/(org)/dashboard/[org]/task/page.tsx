"use client";
import React, {FC, useEffect, useState} from "react";
import axios, {AxiosResponse} from "axios";
import {apiUrl} from "@/app/api/config";
import {Poppins} from "next/font/google";
import Cookies from "js-cookie";
import {sessionCheck, UserData} from "@/app/func/funcs";
import Link from "next/link";
import SideMenu from "@/app/components/Side-menu";
import OrgDetailsCard from "@/app/layouts/OrgDetailsCard";
import {getOrgName} from "@/app/func/org";
import Loading from "@/app/components/Loading";
import SortMenu from "@/app/components/_task/sort-menu";

const headerText = Poppins({subsets: ["latin"], weight: "900"});

interface User {
    name: string;
    email: string;
    age: string;
    role: string;
    orgid: string;
    projects: any;
}

interface Task {
    id: string;
    name: string;
    description: string;
    email: string;
    status: string;
    date: string;
    priority: string;
    createdBy: User;
}

interface PageProps {
    params: {
        org: string;
    };
}

const Tasks: FC<PageProps> = ({params}) => {
    const [admin, setAdmin] = useState(false);
    const [task, setTask] = useState<Task[]>([]);
    const [orgNameCheck, setOrgNameCheck] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [sortCriteria, setSortCriteria] = useState<string>("date");
    const [sortOrder, setSortOrder] = useState<string>("asc");
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
                setLoading(false);
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
        GetTasks();
    }, []);

    UserData().then((data) => {
        if (data.roleLevel >= 1 && data.roleLevel <= 3) {
            setAdmin(true);
        }
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

    const sortTasks = (tasks: Task[]) => {
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
            <div className="w-1/4 min-w-[250px] h-full">
                <SideMenu/>
            </div>
            <div className="w-full p-6 overflow-auto flex flex-col items-center">
                <div className="flex flex-col justify-around items-center gap-10 w-full h-full">
                    <h1 className="text-5xl font-black mt-16">Your tasks:</h1>
                    <SortMenu
                        sortCriteria={sortCriteria}
                        sortOrder={sortOrder}
                        setSortCriteria={setSortCriteria}
                        setSortOrder={setSortOrder}
                    />
                    <div className="w-full flex flex-wrap justify-center items-center gap-16">
                        {sortTasks(task).map((task) => (
                            <OrgDetailsCard
                                key={task.id}
                                title={task.name}
                                description={task.description}
                                status={task.status}
                                data={task.date}
                                createdBy={task.createdBy.name}
                                priority={task.priority}
                                onClick={() => goToTask(task.id)}
                            />
                        ))}
                    </div>
                    {admin && (
                        <Link
                            className={` w-40 md:w-64 lg:w-72 h-10 md:h-12 lg:h-14 bg-accent rounded-2xl text-base md:text-lg lg:text-xl hover:bg-[#106092] flex justify-center items-center ${headerText.className}`}
                            href={`/dashboard/${orgNameCheck}/task/create`}
                        >
                            Create task
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Tasks;