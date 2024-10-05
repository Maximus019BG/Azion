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

    const getPriorityColor = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'high':
                return 'text-orange-500';
            case 'very_high':
                return 'text-red-500';
            case 'low':
                return 'text-green-500';
            case 'medium':
                return 'text-yellow-500';
            default:
                return 'text-gray-500';
        }
    };

    return (
        <div className="card bg-base-100 w-96 shadow-xl">
            <div className="card-body">
                {loading ? (
                    <div className="flex w-52 flex-col gap-4">
                        <div className="skeleton h-32 w-full"></div>
                        <div className="skeleton h-4 w-28"></div>
                        <div className="skeleton h-4 w-full"></div>
                        <div className="skeleton h-4 w-full"></div>
                    </div>
                ) : tasks.length > 0 ? (
                    tasks.map((task) => (
                        <div key={task.id} className="mb-4">
                            <h2 className="text-xl font-bold">{task.name}</h2>
                            <p><strong>Date:</strong> {task.date}</p>
                            <p>
                                <strong>Priority:</strong>
                                <span className={getPriorityColor(task.priority)}>
                                {task.priority}
                            </span>
                            </p>
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
