import React, { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { apiUrl } from "../api/config";
import { Poppins } from "next/font/google";
import Cookies from "js-cookie";
import { CheckMFA, PartOfOrg, UserData } from "../func/funcs";
import Link from "next/link";

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
  project: string;
  status: string;
  date: string;
  createdBy: User;
}

const SessionCheck = () => {
  const refreshToken = Cookies.get("azionRefreshToken");
  const accessToken = Cookies.get("azionAccessToken");
  PartOfOrg(false);
  const data = { refreshToken, accessToken };
  axios
    .post(`${apiUrl}/token/session/check`, data, {
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

const TasksLayout = () => {
  const [admin, setAdmin] = useState(false);
  const [task, setTask] = useState<Task[]>([]);

  const GetTasks = () => {
    axios
      .get(`${apiUrl}/projects/list`, {
        headers: {
          "Content-Type": "application/json",
          authorization: Cookies.get("azionAccessToken"),
        },
      })
      .then((response: AxiosResponse) => {
        setTask(response.data);
      })
      .catch((error) => {
        console.error(error.response ? error.response : error);
      });
  };

  useEffect(() => {
    const refreshToken = Cookies.get("azionRefreshToken");
    const accessToken = Cookies.get("azionAccessToken");
    if (refreshToken && accessToken) {
      SessionCheck();
    } else if (!accessToken && !refreshToken) {
      window.location.href = "/login";
    }
    GetTasks();
  }, []);

  UserData().then((data) => {
    if (data.role == "owner" || data.role == "admin") {
      setAdmin(true);
    }
  });

  return (
    <div className=" w-full h-full">
      {task.map((task) => (
        <div
          key={task.id}
          className=" w-full h-full flex justify-center items-center gap-6 bg-lightAccent"
        >
          <h1 className=" text-white  ">{task.name}</h1>
          <h2>{task.description}</h2>
          <h3>{task.status}</h3>
          <h4>{task.date}</h4>
          <h5>{task.createdBy.name}</h5>
        </div>
      ))}
    </div>
  );
};

export default TasksLayout;
