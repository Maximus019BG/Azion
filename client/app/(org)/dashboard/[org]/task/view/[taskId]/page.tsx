"use client";
import React, {FC, useEffect, useState} from "react";
import {getOrgName, getTasks} from "@/app/func/org";
import Loading from "@/app/components/Loading";
import SideMenu from "@/app/components/Side-menu";
import {apiUrl} from "@/app/api/config";
import axios from "axios";
import Cookies from "js-cookie";
import AzionEditor from "./_editor/AzionEditor";
import {Task} from "@/app/types/types";
import {Poppins} from "next/font/google";
import {FaArrowAltCircleLeft, FaCompress, FaExpand} from "react-icons/fa";
import {sessionCheck, UserData} from "@/app/func/funcs";
import Link from "next/link";

const HeaderText = Poppins({subsets: ["latin"], weight: "600"});

interface PageProps {
    params: {
        taskId: string | null;
        org: string;
    };
}

const TaskView: FC<PageProps> = ({params: {taskId, org}}) => {
    const [orgName, setOrgName] = useState<string | null>(null);
    const [task, setTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [file, setFile] = useState<File | null>(null);
    const [inputMethod, setInputMethod] = useState<string>("file");
    const [link, setLink] = useState<string>("");
    const [editorContent, setEditorContent] = useState<string>("");
    const [showFiles, setShowFiles] = useState<boolean>(false);
    const [doneByUser, setDoneByUser] = useState<boolean>(false);
    const [admin, setAdmin] = useState<boolean>(false)
    const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

    const SubmitTask = (taskId: string, file: File | null, link: string, editorContent: string) => {
        const formData = new FormData();
        formData.append("taskId", taskId);
        formData.append("text", editorContent);
        if (file) {
            formData.append("file", file);
        } else if (editorContent) {
            const defaultFileContent = editorContent;
            const blob = new Blob([defaultFileContent], {type: "text/plain"});
            formData.append("file", blob, "AzionEditorFile.txt");
        } else if (link) {
            const defaultFileContent = link;
            const blob = new Blob([defaultFileContent], {type: "text/plain"});
            formData.append("file", blob, "AzionLink.txt");
        }
        axios
            .put(`${apiUrl}/projects/submit/${taskId}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    authorization: Cookies.get("azionAccessToken"),
                },
            })
            .then((response) => {
                alert("Task submitted successfully");
                window.location.href = window.location.pathname;
            })
            .catch((error) => {
                console.error(error);
            });
    };

    useEffect(() => {
        if (Cookies.get("azionAccessToken") && Cookies.get("azionRefreshToken")) {
            sessionCheck();
        } else {
            window.location.href = "/log-in";
        }
    }, []);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setFile(event.target.files[0]);
        }
    };

    const handleSubmit = () => {
        if (taskId) {
            if (editorContent) {
                SubmitTask(taskId, null, "", editorContent);
            } else if (inputMethod === "file" && file) {
                SubmitTask(taskId, file, "", "");
            } else if (inputMethod === "link" && link) {
                SubmitTask(taskId, null, link, "");
            } else {
                alert("Please provide the required input.");
            }
        }
    };

    useEffect(() => {
        if (taskId) {
            getTasks(taskId).then((taskData) => {
                console.log(taskData);
                setTask(taskData);
                setLoading(false);
            });
        }
        if (org) {
            getOrgName().then((orgName) => {
                setOrgName(orgName);
            });
        }
        const getUser = async () => {
            const result = await UserData();
            const uEmail = result.email;

            //!Set who can see the submitted files
            if (task?.createdBy?.email === uEmail)
                setAdmin(true)
            else if (result.roleLevel === 1 || result.roleLevel === 2)
                setAdmin(true)

            if (
                task &&
                task.doneBy &&
                task.doneBy.some((doneUser) => doneUser.email === uEmail)
            ) {
                setDoneByUser(true);
            } else {
                setDoneByUser(false);
            }
        };
        getUser();
    }, [org, taskId]);

    if (!task) {
        return (
            <div>
                <div className="w-screen h-screen flex justify-center items-center">
                    <Loading/>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex h-screen bg-gray-900 text-white ${isFullScreen ? "fixed inset-0 z-50" : ""}`}>
            <div className="w-1/4">
                <SideMenu/>
            </div>
            <div className="w-full flex justify-center items-center p-8">
                <div className="bg-gray-800 rounded-lg p-8 shadow-lg w-full h-full">
                    <h1 className={`text-4xl ${HeaderText.className} text-center mb-8`}>
                        Task Details
                    </h1>
                    <div className="grid grid-cols-1 gap-6 mb-6">
                        <p className="bg-gray-700 p-4 rounded-lg text-xl">
                            <strong className="font-semibold">Name: </strong>
                            {task.name}
                        </p>
                        <p className="bg-gray-700 p-4 rounded-lg text-xl">
                            <strong className="font-semibold">Description: </strong>
                            {task.description}
                        </p>
                        <p className="bg-gray-700 p-4 rounded-lg text-xl">
                            <strong className="font-semibold">Status: </strong>
                            {task.status}
                        </p>
                        <p className="bg-gray-700 p-4 rounded-lg text-xl">
                            <strong className="font-semibold">Date: </strong>
                            {task.date}
                        </p>
                        <p className="bg-gray-700 p-4 rounded-lg text-xl">
                            <strong className="font-semibold">Source: </strong>
                            <Link href={task.source} className="text-blue-400 hover:underline">
                                {task.source}
                            </Link>
                        </p>
                        <p className="bg-gray-700 p-4 rounded-lg text-xl">
                            <strong className="font-semibold">Progress: </strong>
                            {task.progress}%
                        </p>
                        {task.createdBy && (
                            <p className="bg-gray-700 p-4 rounded-lg text-xl">
                                <strong className="font-semibold">Created By: </strong>
                                {task.createdBy.name} ({task.createdBy.email})
                            </p>
                        )}
                    </div>

                    {/* Task submission section */}
                    {!task.status.toLowerCase().includes("done") && !admin && (
                        <div className="mt-6">
                            <div className="mb-4">
                                <label className="inline-flex items-center mr-4">
                                    <input
                                        type="radio"
                                        name="inputMethod"
                                        value="file"
                                        checked={inputMethod === "file"}
                                        onChange={() => setInputMethod("file")}
                                        className="mr-2 text-blue-500"
                                    />
                                    File
                                </label>
                                <label className="inline-flex items-center mr-4">
                                    <input
                                        type="radio"
                                        name="inputMethod"
                                        value="editor"
                                        checked={inputMethod === "editor"}
                                        onChange={() => setInputMethod("editor")}
                                        className="mr-2 text-blue-500"
                                    />
                                    Editor
                                </label>
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        name="inputMethod"
                                        value="link"
                                        checked={inputMethod === "link"}
                                        onChange={() => setInputMethod("link")}
                                        className="mr-2 text-blue-500"
                                    />
                                    Link
                                </label>
                            </div>

                            {inputMethod === "file" && (
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="w-full p-2 bg-gray-700 rounded"
                                />
                            )}

                            {inputMethod === "editor" && (
                                <div className="relative z-50">
                                    <button
                                        onClick={() => setInputMethod("")}
                                        className="text-blue-500 mb-2"
                                    >
                                        <FaArrowAltCircleLeft className="inline mr-2"/>
                                        Back
                                    </button>
                                    <button
                                        onClick={() => setIsFullScreen(!isFullScreen)}
                                        className="text-blue-500 mb-2 ml-4"
                                    >
                                        {isFullScreen ? <FaCompress className="inline mr-2"/> :
                                            <FaExpand className="inline mr-2"/>}
                                        {isFullScreen ? "Exit Full Screen" : "Full Screen"}
                                    </button>
                                    <AzionEditor
                                        value={editorContent}
                                        onChange={setEditorContent}
                                    />
                                </div>
                            )}

                            {inputMethod === "link" && (
                                <input
                                    type="text"
                                    value={link}
                                    onChange={(e) => setLink(e.target.value)}
                                    placeholder="Enter the link"
                                    className="w-full p-2 bg-gray-700 rounded"
                                />
                            )}

                            <button
                                onClick={handleSubmit}
                                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md"
                            >
                                Submit Task
                            </button>
                        </div>
                    )}
                </div>

                {/* File view for creators */}
                {admin && (
                    <div className="fixed top-10 right-10 z-10">
                        <button
                            onClick={() => setShowFiles(!showFiles)}
                            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md mb-4"
                        >
                            {showFiles ? "Hide Files" : "Show Files"}
                        </button>

                        {showFiles && task.files && (
                            <div className="space-y-4">
                                {task.files.map((file, index) => (
                                    <div key={index} className="bg-gray-700 p-4 rounded-lg">
                                        <h3 className="font-semibold">{file.user.name}'s work:</h3>
                                        <a
                                            href={URL.createObjectURL(
                                                new Blob([atob(file.fileData || "")], {type: file.contentType})
                                            )}
                                            download={file.fileName}
                                            className="text-blue-400 hover:underline"
                                        >
                                            {file.fileName}
                                        </a>
                                        <h3>{file.date}</h3>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskView;