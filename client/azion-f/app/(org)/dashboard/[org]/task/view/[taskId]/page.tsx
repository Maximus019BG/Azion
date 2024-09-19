"use client";
import React, { FC, useEffect, useState } from "react";
import { getOrgName, getTasks } from "@/app/func/org";
import Loading from "@/app/components/Loading";
import SideMenu from "@/app/components/Side-menu";
import { apiUrl } from "@/app/api/config";
import axios, { AxiosResponse } from "axios";
import Cookies from "js-cookie";

import { Poppins } from "next/font/google";

const HeaderText = Poppins({ subsets: ["latin"], weight: "600" });

interface PageProps {
  params: {
    taskId: string | null;
    org: string;
  };
}

interface User {
  name: string;
  email: string;
  age: string;
  role: string;
  orgid: string;
  projects: any;
}

interface Task {
  id: string;
  name: string;
  description: string;
  status: string;
  date: string;
  createdBy?: User;
}

const TaskView: FC<PageProps> = ({ params: { taskId, org } }) => {
  const [orgName, setOrgName] = useState<string | null>(null);
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [file, setFile] = useState<File | null>(null);

  const SubbmitTask = (taskId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('taskId', taskId);

    axios.put(`${apiUrl}/projects/submit/${taskId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        authorization: Cookies.get("azionAccessToken"),
      },
    }).then((response) => {
      alert('Task submitted successfully');
    }).catch((error) => {
      console.error(error);
    });
  }

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
    } else if (Cookies.get("azionAccessToken") && Cookies.get("azionRefreshToken")) {
      SessionCheck();
    }
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  }

  const handleSubmit = () => {
    if (taskId && file) {
      SubbmitTask(taskId, file);
    } else {
      alert('Please select a file to submit.');
    }
  }

  useEffect(() => {
    if (taskId) {
      getTasks(taskId).then((taskData) => {
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

          <div className="flex flex-col justify-center items-start gap-10 bg-gray-800 p-24 rounded-xl">
            <h1 className={`text-5xl ${HeaderText.className} w-full bg-gray-700 p-5`}>
              Task Details
            </h1>
            <p className="flex justify-between p-5 items-center gap-3 text-xl w-full h-12 bg-gray-700">
              <span className="font-bold">Name</span>
              {task.name}
            </p>
            <p className="flex justify-between p-5 items-center gap-3 text-xl w-full h-12 bg-gray-700">
              <span className="font-bold">Description</span>
              {task.description}
            </p>
            <p className="flex justify-between p-5 items-center gap-3 text-xl w-full h-12 bg-gray-700">
              <span className="font-bold">Status</span>
              {task.status}
            </p>
            <p className="flex justify-between p-5 items-center gap-3 text-xl w-full h-12 bg-gray-700">
              <span className="font-bold">Date</span>
              {task.date}
            </p>

            {task.createdBy && (
              <p className="flex justify-between p-5 items-center gap-3 text-xl w-full h-12 bg-gray-700">
                <span className="font-bold">Created By:</span>
                <div>
                  {task.createdBy.name}
                  {task.createdBy.email && (
                    <span> ({task.createdBy.email})</span>
                  )}
                </div>
              </p>
            )}

            <input type="file" onChange={handleFileChange} />
            <button onClick={handleSubmit} className="bg-blue-500 text-white p-2 rounded">
              Submit Task
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskView;