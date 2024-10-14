import React from "react";
import {FaBuilding} from "react-icons/fa";
import {TbFileDescription} from "react-icons/tb";
import {GrStatusWarning} from "react-icons/gr";
import {IoTimer} from "react-icons/io5";
import {MdOutlineDriveFileRenameOutline} from "react-icons/md";
import axios, {AxiosResponse} from "axios";
import {apiUrl} from "@/app/api/config";
import Cookies from "js-cookie";

interface Task {
    title: string;
    description: string;
    status: string;
    data: string;
    createdBy?: string;
    priority: string;
    onClick: () => void;
    isCreator: boolean;
    id: string;
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
                                       isCreator,
                                       id
                                   }) => {


    const deleteTask = () => {
        axios.delete(`${apiUrl}/projects/delete/task/${id}`, {
            headers: {
                "Content-Type": "application/json",
                authorization: Cookies.get("azionAccessToken"),
            },
        }).then((response: AxiosResponse) => {
            alert("task deleted successfully \n To see the changes reload");
        }).catch((error: any) => {
            alert("Error:" + error);
        })
    }
    return (
        <div
            className="w-96 rounded-lg overflow-hidden shadow-lg p-6 bg-base-300 cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 relative"
            onClick={onClick}
        >
            <div className="absolute top-4 right-4 flex items-center group">
                {getPriorityIcon(priority)}
                <div
                    className="absolute top-0 left-0 mt-6 hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2">
                    Priority: {priority.toUpperCase()}
                </div>
            </div>
            <div className="min-w-96 p-2">
                <div className="font-bold text-xl mb-4 flex items-center text-white group">
                    <FaBuilding className="mr-2 text-blue-500 cursor-pointer"/>
                    {title}
                    <div
                        className="absolute top-2 left-2 mt-0 hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2">
                        Title: {title}
                    </div>
                </div>
                <p className="text-gray-200 text-base flex items-center mb-2 group">
                    <TbFileDescription className="mr-2 text-2xl text-red-500"/>
                    {description}
                    <div
                        className="absolute top-12 left-0 mt-0 hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2">
                        Description: {description}
                    </div>
                </p>
                <p className="text-gray-200 text-base flex items-center mb-2 group">
                    <GrStatusWarning className="mr-2 text-2xl text-green-500"/>
                    {status}
                    <div
                        className="absolute top-16 left-0 mt-6 hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2">
                        Status: {status}
                    </div>
                </p>
                <p className="text-gray-200 text-base flex items-center mb-2 group">
                    <IoTimer className="mr-2 text-2xl text-yellow-500"/>
                    {data}
                    <div
                        className="absolute top-28 left-0 hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2">
                        Date: {data}
                    </div>
                </p>
                <p className="text-gray-200 text-base flex items-center group">
                    <MdOutlineDriveFileRenameOutline className="mr-2 text-2xl text-purple-500"/>
                    {createdBy}
                    {isCreator && (
                        <div>
                            <div className="relative inline-flex items-center group">
                                <span className="text-xs">&nbsp;(you)</span>
                                <div
                                    className="absolute -bottom-1 left-10 mt-6 hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2">
                                    Creator
                                </div>
                            </div>
                            <button onClick={deleteTask} className="bg-red-600">remove task</button>
                        </div>
                    )}
                </p>
            </div>
        </div>
    );
};

export default TasksCard;