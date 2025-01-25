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
import {sessionCheck, UserData, UserHasRight} from "@/app/func/funcs";
import Link from "next/link";
import ProgressComponent from "../../../../../../components/ProgressComponent";

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
    const [admin, setAdmin] = useState<boolean>(false);
    const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
    const [isUser, setIsUser] = useState<boolean>(false);

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
                window.location.reload();
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const ReturnTask = (taskId: string | null, userEmail: string) => {
        const data = {
            email: userEmail,
        };
        axios.put(`${apiUrl}/projects/return/task/${taskId}`, data, {
            headers: {
                "Content-Type": "application/json",
                "authorization": Cookies.get("azionAccessToken"),
            },
        }).then((response: any) => {
            alert(response.data + "\nTo see changes reload");
        }).catch((error: any) => {
            alert(error.response.data);
        });
    };

    useEffect(() => {
        if (Cookies.get("azionAccessToken") && Cookies.get("azionRefreshToken")) {
            sessionCheck();
            UserHasRight(5);
        } else {
            window.location.href = "/login";
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
    }, [taskId, org]);

    useEffect(() => {
        const getUser = async () => {
            const result = await UserData();
            const uEmail = result.email;

            //!Set who can see the submitted files
            if (task?.createdBy?.email === uEmail) {
                setAdmin(true);
            }
            UserData().then((r) => {
                if (r.role === "owner") {
                    setAdmin(true);
                }
            });

            if (task?.doneBy?.some((doneUser) => doneUser.email === uEmail)) {
                setDoneByUser(true);
            } else {
                setDoneByUser(false);
            }

            if (task?.users?.some((user) => user.email === uEmail)) {
                setIsUser(true);
            } else {
                setIsUser(false);
            }

            // Add console logs to debug
            console.log("User email:", uEmail);
            console.log("Is user:", isUser);
            console.log("Is admin:", admin);
            console.log("Done by user:", doneByUser);
        };

        if (task) {
            getUser();
        }
    }, [task]);

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
        <div className={`flex h-dvh text-white ${isFullScreen ? "fixed inset-0 z-50" : ""}`}>
            <div className="lg:w-1/4">
                <SideMenu/>
            </div>
            <div className="w-full flex justify-center items-center p-4">
                <div
                    className="bg-[#090909] rounded-lg p-8 shadow-lg w-full max-w-[55vw] h-fit flex flex-col justify-center items-center gap-6">
                    <h1 className={`text-2xl ${HeaderText.className} text-gray-300 text-start`}>
                        Task Details
                    </h1>
                    <div className="w-full h-full flex flex-col justify-evenly items-center gap-5">

                        {/*!!!ROW_1!!!*/}

                        <div className="w-full flex flex-col md:flex-row justify-evenly items-center gap-4 md:gap-56">
                            <div className="w-full h-full flex flex-col justify-center items-start gap-2">
                                <p className="font-semibold">Name: </p>
                                <div className="bg-base-200 w-full p-2 rounded-lg">
                                    {task.name}
                                </div>
                            </div>
                            <div className="w-full h-full flex flex-col justify-center items-start gap-2">
                                <p className="font-semibold">Status: </p>
                                <div className="bg-base-200 w-full p-2 rounded-lg">
                                    {task.status}
                                </div>
                            </div>
                        </div>

                        {/*!!!ROW_2!!!*/}

                        <div className="w-full flex flex-col md:flex-row justify-around items-center gap-4">
                            <div className="w-full h-full flex flex-col justify-center items-start gap-2">
                                <p className="font-semibold">Description: </p>
                                <div className="bg-base-200 textarea w-full h-full">
                                    {task.description}
                                </div>
                            </div>
                        </div>

                        {/*!!!ROW_3!!!*/}

                        <div className="w-full flex flex-col md:flex-row justify-evenly items-center gap-4 md:gap-8">
                            <div className="w-full h-full flex flex-col justify-center items-start gap-2">
                                <p className="font-semibold">Date: </p>
                                <div className="bg-base-200 p-2 rounded-lg w-full">
                                    {task.date}
                                </div>
                            </div>
                            <div className="w-full flex justify-around items-center">
                                <div className="w-full h-full flex flex-col justify-center items-start gap-2">
                                    <p className="font-semibold">Source: </p>
                                    <Link href={task.source} target="_blank"
                                          className="bg-base-200 p-2 rounded-lg w-full text-blue-400 hover:underline">
                                        {task.source}
                                    </Link>
                                </div>
                            </div>

                            {task.createdBy && (
                                <div className="w-full h-full flex flex-col justify-center items-start gap-2">
                                    <p className="font-semibold">Created By: </p>
                                    <div className="bg-base-200 w-full p-2 rounded-lg">
                                        {task.createdBy.name} ({task.createdBy.email})
                                    </div>
                                </div>
                            )}
                        </div>

                        {/*!!!ROW_4!!!*/}
                        <ProgressComponent progress={task.progress}/>

                    </div>

                    {/* Task submission section */}
                    {!task.status.toLowerCase().includes("done") && (isUser || admin) && !doneByUser && (
                        <div className="mt-3 w-full h-fit flex flex-col justify-center gap-2">
                            <div className="flex justify-start items-center gap-3">
                                <label className="">
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
                                <label className="">
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
                                <label className="">
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
                                    className="w-full p-2 bg-base-200 file:mr-3 file:bg-accent file:border-none file:rounded-md file:p-2 rounded"
                                />
                            )}

                            {inputMethod === "editor" && (
                                <div className="relative z-50 ">
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
                {admin && (task.files?.length !== 0) && (
                    <div className="fixed top-10 right-10 z-10">
                        <button
                            onClick={() => setShowFiles(!showFiles)}
                            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md mb-4"
                        >
                            {showFiles ? "Hide Files" : "Show Files"}
                        </button>

                        {showFiles && admin && task.files && (
                            <div className="space-y-4">
                                {task.files.map((file, index) => (
                                    <div key={index} className="bg-gray-700 p-4 rounded-lg">
                                        <h3 className="font-semibold">{file.user.name}&apos;s work:</h3>
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
                                        <button className="border-accent bordered border-2 rounded-lg px-1"
                                                onClick={() => ReturnTask(taskId, file.user.email)}>Return
                                        </button>
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