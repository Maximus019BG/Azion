"use client";
import React, { FC, useEffect, useState } from "react";
import { getOrgName, getTasks } from "@/app/func/org";
import Loading from "@/app/components/Loading";
import SideMenu from "@/app/components/Side-menu";
import { apiUrl } from "@/app/api/config";
import axios, { AxiosResponse } from "axios";
import Cookies from "js-cookie";
import AzionEditor from "./_editor/AzionEditor";
import { Task, User, ProjFile } from "@/app/types/types";
import { Poppins } from "next/font/google";
import { FaArrowAltCircleLeft, FaLongArrowAltDown } from "react-icons/fa";
import { FaArrowCircleDown } from "react-icons/fa";

const HeaderText = Poppins({ subsets: ["latin"], weight: "600" });

interface PageProps {
  params: {
    taskId: string | null;
    org: string;
  };
}

const TaskView: FC<PageProps> = ({ params: { taskId, org } }) => {
  const [orgName, setOrgName] = useState<string | null>(null);
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [file, setFile] = useState<File | null>(null);
  const [inputMethod, setInputMethod] = useState<string>("file");
  const [link, setLink] = useState<string>("");
  const [editorContent, setEditorContent] = useState<string>("");
  const [showFiles, setShowFiles] = useState<boolean>(false);

  const SubmitTask = (
    taskId: string,
    file: File | null,
    link: string,
    editorContent: string
  ) => {
    const formData = new FormData();
    formData.append("taskId", taskId);
    formData.append("text", editorContent);
    if (file) {
      formData.append("file", file);
    } else if (editorContent) {
      const defaultFileContent = editorContent;
      const blob = new Blob([defaultFileContent], { type: "text/plain" });
      formData.append("file", blob, "AzionEditorFile.txt");
    } else if (link) {
      const defaultFileContent = link;
      const blob = new Blob([defaultFileContent], { type: "text/plain" });
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
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    const SessionCheck = () => {
      const refreshToken = Cookies.get("azionRefreshToken");
      const accessToken = Cookies.get("azionAccessToken");

      const data = { refreshToken, accessToken };

      const url = `${apiUrl}/token/session/check`;
      axios
        .post(url, data, {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((response: AxiosResponse) => {
          const { message, accessToken } = response.data;
          if (message === "newAccessToken generated") {
            Cookies.set("azionAccessToken", accessToken, {
              secure: true,
              sameSite: "Strict",
            });
          }
        })
        .catch((error) => {
          console.error(error.response ? error.response : error);
          Cookies.remove("azionAccessToken");
          Cookies.remove("azionRefreshToken");
          window.location.href = "/login";
        });
    };

    if (!Cookies.get("azionAccessToken") || !Cookies.get("azionRefreshToken")) {
      window.location.href = "/login";
    } else if (
      Cookies.get("azionAccessToken") &&
      Cookies.get("azionRefreshToken")
    ) {
      SessionCheck();
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
  }, [taskId]);

  useEffect(() => {
    if (org) {
      getOrgName().then((orgName) => {
        setOrgName(orgName);
      });
    }
  }, [org]);

  if (!task) {
    return (
      <div>
        <div className="w-screen h-screen flex justify-center items-center">
          <Loading />
        </div>
      </div>
    );
  }

  console.log(editorContent);
  return (
    <div>
      {loading ? (
        <div className="w-screen h-screen flex justify-center items-center">
          <Loading />
        </div>
      ) : (
        <div className="w-screen h-screen flex flex-col justify-center items-center">
          <div className="absolute left-0">
            <SideMenu />
          </div>

          <div className="flex flex-col justify-center items-start gap-10 bg-gray-800 p-20 rounded-xl">
            <h1 className={`text-5xl ${HeaderText.className} w-full `}>
              Task Details
            </h1>
            <p className="flex justify-between p-5 items-center gap-3 text-xl w-full h-12 bg-accent rounded-md">
              <span className="font-bold">Name</span>
              {task.name}
            </p>
            <p className="flex justify-between p-5 items-center gap-3 text-xl w-full h-12 bg-accent rounded-md">
              <span className="font-bold">Description</span>
              {task.description}
            </p>
            <p className="flex justify-between p-5 items-center gap-3 text-xl w-full h-12 bg-accent rounded-md">
              <span className="font-bold">Status</span>
              {task.status}
            </p>
            <p className="flex justify-between p-5 items-center gap-3 text-xl w-full h-12 bg-accent rounded-md">
              <span className="font-bold">Date</span>
              {task.date}
            </p>
            <p className="flex justify-between p-5 items-center gap-3 text-xl w-full h-12 bg-accent rounded-md">
              <span className="font-bold">Source</span>
              <h1>{task.source}</h1>
            </p>

            {task.createdBy && (
              <p className="flex justify-between p-5 items-center gap-3 text-xl w-full h-12 bg-accent rounded-md">
                <span className="font-bold">Created By:</span>
                <div>
                  {task.createdBy.name}
                  {task.createdBy.email && (
                    <span> ({task.createdBy.email})</span>
                  )}
                </div>
              </p>
            )}

            {!task.status.toLowerCase().includes("submitted") && (
              <>
                <div className="flex flex-col gap-4">
                  <div className="flex gap-4">
                    <label>
                      <input
                        type="radio"
                        value="file"
                        checked={inputMethod === "file"}
                        onChange={() => setInputMethod("file")}
                      />
                      File
                    </label>
                    <label>
                      <input
                        type="radio"
                        value="editor"
                        checked={inputMethod === "editor"}
                        onChange={() => setInputMethod("editor")}
                      />
                      Azion Editor
                    </label>
                    <label>
                      <input
                        type="radio"
                        value="link"
                        checked={inputMethod === "link"}
                        onChange={() => setInputMethod("link")}
                      />
                      Link
                    </label>
                  </div>

                  {inputMethod === "file" && (
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="file:bg-gray-700 file:cursor-pointer hover:file:bg-gray-600 file:p-2 file:mr-4 file:rounded-btn file:border-none"
                    />
                  )}

                  {inputMethod === "editor" && (
                    <div className="z-40 absolute w-screen h-screen bg-gray-700 p-4 top-0 left-0 rounded overflow-hidden">
                      <button onClick={() => setInputMethod("")}>
                        <FaArrowAltCircleLeft />
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
                      className="p-2 bg-gray-700 rounded"
                    />
                  )}
                </div>
                <button
                  onClick={handleSubmit}
                  className="bg-accent text-white p-3 text-xl font-bold rounded"
                >
                  Submit Task
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {task.isCreator && (
        <div className="absolute top-16 right-28 flex flex-col gap-4">
          <button
            onClick={() => setShowFiles(!showFiles)}
            className="bg-accent text-white p-2 w-44 text-md font-bold rounded"
          >
            {showFiles ? `Hide Files` : "Show Files"}
          </button>

          {showFiles && (
            <div>
              {/* Displaying the files */}
              {task.files &&
                task.files.map((file, index) => {
                  const byteCharacters = atob(file.fileData || "");
                  const byteNumbers = new Array(byteCharacters.length)
                    .fill(0)
                    .map((_, i) => byteCharacters.charCodeAt(i));
                  const byteArray = new Uint8Array(byteNumbers);
                  const blob = new Blob([byteArray], {
                    type: file.contentType,
                  });
                  const url = URL.createObjectURL(blob);

                  return (
                    <div
                      key={index}
                      className={`flex flex-col justify-center items-center gap-3`}
                    >
                      <h1 className="text-white text-lg bg-gray-700 rounded-md p-1 w-44 flex justify-center items-center">
                        {file.user.name}'s work:{" "}
                      </h1>
                      <a href={url} download={`${file.fileName}`}>
                        <button className="bg-accent text-white p-2 text-md font-bold rounded">
                          {file.fileName}
                        </button>
                      </a>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskView;
