import React from 'react';
import {Task} from "@/app/types/types";

interface DashboardTaskRowProps {
    task: Task;
}

const Dashboard_Task_Row: React.FC<DashboardTaskRowProps> = ({task}) => {
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

    console.log("Rendering task row:", task); // Add this line

    return (
        <tr className="border-b bg-base-200 border-gray-700">
            <td className="py-4 px-6">{task.name}</td>
            <td className="py-4 px-6">{task.date}</td>
            <td className="py-4 px-6">
                <span className={`${getPriorityColor(task.priority)} font-semibold`}>
                    {task.priority}
                </span>
            </td>
        </tr>
    );
};

export default Dashboard_Task_Row;