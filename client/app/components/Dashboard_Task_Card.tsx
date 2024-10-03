import React from 'react';
import {Task} from '@/app/types/types';

interface DasboardCardProps {
    tasks?: Task[];
}

const Dashboard_Task_Card: React.FC<DasboardCardProps> = ({tasks = []}) => {
    return (
        <div className="card bg-base-100 w-96 shadow-xl">
            <div className="card-body">
                {tasks.length > 0 ? (
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