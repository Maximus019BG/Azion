import React from "react";
import {FaBuilding, FaEnvelope, FaInfoCircle, FaMapMarkerAlt, FaTag,} from "react-icons/fa";

interface Task {
    title: string;
    description: string;
    status: string;
    data: string;
    createdBy?: string;
    priority: string;
    onClick: () => void;
    isCreator: boolean;
}

const getPriorityIcon = (priority: string) => {
    switch (priority.toLowerCase()) {
        case "very_high":
            return <p className="text-red-500">VERY_HIGH</p>;
        case "high":
            return <p className="text-orange-500">HIGH</p>;
        case "medium":
            return <p className="text-yellow-500">MEDIUM</p>;
        case "low":
            return <p className="text-green-500">LOW</p>;
        default:
            return null;
    }
};

const TasksCard: React.FC<Task> = ({
                                       title,
                                       description,
                                       status,
                                       data,
                                       priority,
                                       createdBy,
                                       onClick,
                                       isCreator
                                   }) => {
    return (
        <div
            className="w-96 rounded-lg overflow-hidden shadow-lg p-6 bg-base-100 cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 relative"
            onClick={onClick}
        >
            <div className="absolute top-4 right-4 flex items-center group">
                {getPriorityIcon(priority)}
                <div
                    className="absolute top-0 right-0 mt-6 hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2">
                    Priority: {priority.toUpperCase()}
                </div>
            </div>
            <div className="min-w-96 p-2">
                <div
                    className="font-bold text-xl mb-4 flex items-center text-white">
                    <FaBuilding className="mr-2 text-blue-500"/> {title}
                </div>
                <p className="text-gray-200 text-base flex items-center mb-2">
                    <FaMapMarkerAlt className="mr-2 text-red-500"/> {description}
                </p>
                <p className="text-gray-200 text-base flex items-center mb-2">
                    <FaTag className="mr-2 text-green-500"/> {status}
                </p>
                <p className="text-gray-200 text-base flex items-center mb-2">
                    <FaInfoCircle className="mr-2 text-yellow-500"/> {data}
                </p>
                <p className="text-gray-200 text-base flex items-center">
                    <FaEnvelope className="mr-2 text-purple-500"/> {createdBy}
                    {isCreator && (
                        <div className="relative inline-flex items-center group">
                            <span className="text-xs">&nbsp;(you)</span>
                            <FaInfoCircle className="ml-1 text-yellow-500 cursor-pointer"/>
                            <div
                                className="absolute hidden group-hover:block left-full top-1/2 transform -translate-y-1/2 ml-2 bg-gray-800 text-white text-xs rounded-lg py-2 px-4 shadow-lg z-10 max-w-xs">
                                You are the creator of this task
                            </div>
                        </div>
                    )}
                </p>
            </div>
        </div>
    );
};

export default TasksCard;