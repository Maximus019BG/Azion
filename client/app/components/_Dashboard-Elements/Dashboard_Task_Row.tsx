'use client';

import React from "react";
import {Task} from "@/app/types/types";

interface Dashboard_Task_RowProps {
    task: Task;
    orgName: string; // Pass the organization name from the parent component
}

const Dashboard_Task_Row: React.FC<Dashboard_Task_RowProps> = ({task, orgName}) => {
    const getPriorityColor = (priority: string) => {
        switch (priority.toLowerCase()) {
            case "high":
                return "text-orange-400";
            case "very_high":
                return "text-red-400";
            case "low":
                return "text-green-400";
            case "medium":
                return "text-yellow-400";
            default:
                return "text-gray-400";
        }
    };

    const handleRedirect = () => {
        // Programmatic navigation
        window.location.href = `/dashboard/${orgName}/task/view/${task.id}`;
    };

    return (
        <div
            onClick={handleRedirect}
            className="flex justify-between items-center p-3 bg-base-100 rounded-lg shadow-sm hover:bg-gray-600 transition-colors cursor-pointer"
        >
            <div className="w-1/3 text-gray-300">{task.name}</div>
            <div className="w-1/3 text-gray-400">{task.date}</div>
            <div className={`w-1/3 ${getPriorityColor(task.priority)} font-semibold`}>
                {task.priority}
            </div>
        </div>
    );
};

export default Dashboard_Task_Row;
