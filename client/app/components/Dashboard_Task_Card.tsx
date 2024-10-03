'use client'
import React, {useEffect, useState} from 'react';
import {Task} from '@/app/types/types';
import axios from "axios";
import {apiUrl} from "@/app/api/config";
import Cookies from "js-cookie";

const Dashboard_Task_Card = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
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
        GetTopProject();
    }, []);

    return (
        <div className="card bg-base-100 w-96 shadow-xl">
            <div className="card-body">
                {loading ? (
                    <p>Loading tasks...</p>
                ) : tasks.length > 0 ? (
                    tasks.map((task) => (
                        <div key={task.id} className="mb-4">
                            <h2 className="text-xl font-bold">{task.name}</h2>
                            <p>{task.description}</p>
                            <p><strong>Status:</strong> {task.status}</p>
                            <p><strong>Date:</strong> {task.date}</p>
                            <p><strong>Priority:</strong> {task.priority}</p>
                        </div>
                    ))
                ) : (
                    <p>No tasks available</p>
                )}
            </div>
        </div>
    );
};

export default Dashboard_Task_Card;
