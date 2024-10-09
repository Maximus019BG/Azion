'use client'
import React from 'react';
import {Task} from "@/app/types/types";
import Link from "next/link";

interface Dashboard_Task_RowProps {
    task: Task;
}

const Dashboard_Task_Row: React.FC<Dashboard_Task_RowProps> = ({task}) => {
    const getPriorityColor = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'high':
                return 'text-orange-400';
            case 'very_high':
                return 'text-red-400';
            case 'low':
                return 'text-green-400';
            case 'medium':
                return 'text-yellow-400';
            default:
                return 'text-gray-400';
        }
    };

    return (
        <Link href={`/tasks/${task.id}`} className="block">
            <div
                className="flex justify-between items-center p-3 bg-base-100 rounded-lg shadow-sm hover:bg-gray-600 transition-colors">
                <div className="w-1/3 text-gray-300">{task.name}</div>
                <div className="w-1/3 text-gray-400">{task.date}</div>
                <div className={`w-1/3 ${getPriorityColor(task.priority)} font-semibold`}>
                    {task.priority}
                </div>
            </div>
        </Link>
    );
};

export default Dashboard_Task_Row;