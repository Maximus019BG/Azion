"use client";
import React, {FC, useEffect, useState} from 'react';
import {getOrgName, getTasks} from "@/app/func/org";
import Loading from "@/app/components/Loading";
import SideMenu from "@/app/components/Side-menu";

interface PageProps {
    params: {
        taskId: string | null;
        org: string,
    }
}

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
    status: string;
    date: string;
    createdBy?: User;
}

const TaskView: FC<PageProps> = ({params: {taskId, org}}) => {
    const [orgName, setOrgName] = useState<string | null>(null);
    const [task, setTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const orgNameFunc = async () => {
            const result = await getOrgName();
            setOrgName(result);
        };
        orgNameFunc();

        if (orgName && orgName !== org) {
            window.location.href = `/dashboard/${orgName}/task`;
        }
    }, [org, orgName]);

    useEffect(() => {
        if (taskId) {
            getTasks(taskId).then((taskData) => {
                setTask(taskData);
                setTimeout(() => {
                    setLoading(false);
                }, 1000);
            }).catch((error) => {
                console.error(error);
            });
        } else {
            window.location.href = `/dashboard/${orgName}/task`;
        }
    }, [taskId, orgName]);

    if (!task) {
        return (
            <div>
                <div className="w-screen h-screen flex justify-center items-center">
                    <Loading/>
                </div>
            </div>
        );
    }

    return (
        <div>
            {loading ? (
                <div className="w-screen h-screen flex justify-center items-center">
                    <Loading/>
                </div>
            ) : (
                <div className="w-screen h-screen flex flex-col justify-center items-center">
                    <div className="absolute left-0">
                        <SideMenu/>
                    </div>
                    <h1>Task Details</h1>
                    <p><strong>Name:</strong> {task.name}</p>
                    <p><strong>Description:</strong> {task.description}</p>
                    <p><strong>Status:</strong> {task.status}</p>
                    <p><strong>Date:</strong> {task.date}</p>
                    {task.createdBy && <p><strong>Created By:</strong> {task.createdBy.name}{task.createdBy.email && <span> ({task.createdBy.email})</span>}
                    </p>}
                </div>
            )
            }
        </div>
    );
};

export default TaskView;