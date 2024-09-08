"use client";
import React, { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { apiUrl } from "../api/config";
import { Poppins } from "next/font/google";
import Cookies from "js-cookie";
import {CheckMFA, PartOfOrg, UserData} from "../func/funcs";
import Link from "next/link";
import SideMenu from "../components/Side-menu";
import TasksLayout from "../layouts/tasks";

const headerText = Poppins({ subsets: ["latin"], weight: "900" });

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
    project: string;
    status: string;
    date: string;
    createdBy: User;
}

const SessionCheck = () => {
    const refreshToken = Cookies.get("azionRefreshToken");
    const accessToken = Cookies.get("azionAccessToken");
    PartOfOrg(false);
    const data = { refreshToken, accessToken };
    axios
        .post(`${apiUrl}/token/session/check`, data, {
            headers: {
                "Content-Type": "application/json",
            },
        })
        .then((response: AxiosResponse) => {
            const { message, accessToken } = response.data;

            if (message === "newAccessToken generated") {
                Cookies.set("azionAccessToken", accessToken, {
                    secure: true,
                    sameSite: "Strict",
                });
            }
        })
        .catch((error) => {
            console.error(error.response ? error.response : error);
            Cookies.remove("azionAccessToken");
            Cookies.remove("azionRefreshToken");
            window.location.href = "/login";
        });
};

const Tasks = () => {
    const [admin, setAdmin] = useState(false);
    const [task, setTask] = useState<Task[]>([]);

    const GetTasks = () => {
        axios
            .get(`${apiUrl}/projects/list`, {
                headers: {
                    "Content-Type": "application/json",
                    "authorization": Cookies.get("azionAccessToken"),
                },
            })
            .then((response: AxiosResponse) => {
                console.log(response.data);
                setTask(response.data);
            })
            .catch((error) => {
                console.error(error.response ? error.response : error);
            });
    };

    useEffect(() => {
        const refreshToken = Cookies.get("azionRefreshToken");
        const accessToken = Cookies.get("azionAccessToken");
        if (refreshToken && accessToken) {
            SessionCheck();
        } else if (!accessToken && !refreshToken) {
            window.location.href = "/login";
        }
        GetTasks();
    }, []);

    UserData().then((data) => {
        if (data.role == "owner" || data.role == "admin") {
            setAdmin(true);
        }
    });

    return (
        <div className="w-screen h-screen flex flex-col justify-center items-center gap-10">
            <div className=" absolute left-0">
            <SideMenu />
            </div>
            <h1 className=" text-5xl text-lightAccent font-black">Your tasks</h1>
            {admin ? (
                <Link className={` neon-text w-40 md:w-64 lg:w-72 h-10 md:h-12 lg:h-14 bg-[#072a40] rounded-2xl text-base md:text-lg lg:text-xl hover:bg-[#106092] flex justify-center items-center ${headerText.className}`} href={"/task/create"}>
                    Create task
                </Link>
            ) : (
                <></>
            )}
            <h1 className="text-3xl font-bold text-lightAccent">Tasks: </h1>
            <div className=""> 
            <TasksLayout/>
            </div>
        </div>
    );
};

export default Tasks;
