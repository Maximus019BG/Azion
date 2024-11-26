'use client';

import React, {useEffect, useState} from 'react';
import Dashboard_Task_Row from "@/app/components/_Dashboard-Elements/Dashboard_Task_Row";
import {Task} from "@/app/types/types";
import axios from "axios";
import {apiUrl} from "@/app/api/config";
import Cookies from "js-cookie";
import {getOrgName} from "@/app/func/org";

const Dashboard_Task_Card = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [orgName, setOrgName] = useState<string>("");

    useEffect(() => {
        // Fetch tasks
        const GetTopProject = async () => {
            try {
                const response = await axios.get(`${apiUrl}/projects/top/${Cookies.get("azionAccessToken")}`, {
                    headers: {
                        "Content-Type": "application/json",
                    }
                });
                setTasks(response.data);
            } catch (error) {
                console.error("Error fetching top projects:", error);
            } finally {
                setLoading(false);
            }
        };

        // Fetch organization name
        const fetchOrgName = async () => {
            const name = await getOrgName();
            setOrgName(name);
        };

        GetTopProject();
        fetchOrgName();
    }, []);

    return (
        <div
            className="w-full p-6 bg-base-300 rounded-lg shadow-md transition-transform transform hover:scale-105">
            {loading ? (
                <div className="text-center text-gray-400">Loading...</div>
            ) : (
                <div className="flex flex-col space-y-4">
                    <div
                        className="flex justify-between text-md font-bold text-gray-300 border-b border-gray-600 pb-2">
                        <div className="w-1/3">Name</div>
                        <div className="w-1/3">Date</div>
                        <div className="w-1/3">Priority</div>
                    </div>
                    <div className="space-y-2">
                        {tasks && tasks.map((task) => (
                            <Dashboard_Task_Row key={task.id} task={task} orgName={orgName}/>
                        ))}
                        {tasks.length === 0 && (
                            <p>No tasks available.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard_Task_Card;
