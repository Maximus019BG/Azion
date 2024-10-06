'use client'
import React, {useEffect, useState} from 'react';
import Dashboard_Task_Row from "@/app/components/Dashboard_Task_Row";
import {Task} from "@/app/types/types";
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
        <div className="">
            {loading ? (
                <div>Loading...</div>
            ) : (
                <table className="w-full text-sm text-left text-gray-400 ">
                    <thead className="text-xs uppercase bg-base-300 text-gray-400">
                    <tr className="">
                        <th scope="col" className="py-3 px-6">Name</th>
                        <th scope="col" className="py-3 px-6">Date</th>
                        <th scope="col" className="py-3 px-6">Priority</th>
                    </tr>
                    </thead>
                    <tbody>
                    {tasks.map((task) => (
                        <Dashboard_Task_Row key={task.id} task={task}/>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Dashboard_Task_Card;