"use client";
import React, { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { apiUrl } from "../../api/config";
import Cookies from "js-cookie";
import { CheckMFA, PartOfOrg, UserData } from "../../func/funcs";
import { Poppins } from "next/font/google";

const HeaderText = Poppins({ subsets: ["latin"], weight: "600" });

interface User {
  name: string;
  email: string;
  age: number;
  role: string;
  id: string;
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
      window.location.href = "/log-in";
    });
};

const CreateTask = () => {
  const [admin, setAdmin] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("");
  const [source, setSource] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const progress = 0;
  const status = "Due";

  const GetUsers = () => {
    axios
      .get(`${apiUrl}/org/list/employees`, {
        headers: {
          "Content-Type": "application/json",
          authorization: Cookies.get("azionAccessToken"),
        },
      })
      .then((response: AxiosResponse) => {
        setUsers(response.data);
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
      window.location.href = "/log-in";
    }

    GetUsers();

    UserData().then((data) => {
      if (data.role === "owner" || data.role === "admin") {
        setAdmin(true);
      } else {
        window.location.href = "/task";
      }
    });
  }, []);

  const handleCheckboxChange = (email: string) => {
    setSelectedUsers((prevSelectedUsers) => {
      const newSelectedUsers = new Set(prevSelectedUsers);
      if (newSelectedUsers.has(email)) {
        newSelectedUsers.delete(email);
      } else {
        newSelectedUsers.add(email);
      }
      return newSelectedUsers;
    });
  };

  const TaskData = async () => {
    const data = {
      accessToken: Cookies.get("azionAccessToken"),
      title,
      description,
      dueDate,
      priority,
      status,
      progress,
      source,
      users: Array.from(selectedUsers),
    };
    axios
      .post(`${apiUrl}/projects/create/new`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response: AxiosResponse) => {
        console.log(response.data);
      });
  };
  const userList = Array.isArray(users) ? users : [];

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center gap-16">
      <h1 className=" text-5xl font-extrabold text-lightAccent">
        Create tasks here
      </h1>
      <div className=" flex justify-startitems-start gap-48">
        <div className=" flex flex-col justify-start items-center gap-5">
          <h1 className="text-3xl font-extrabold">Users:</h1>
          <ul>
            {userList.map((user, index) => (
              <li key={index}>
                <label>
                  <input
                    type="checkbox"
                    value={user.id}
                    onChange={() => handleCheckboxChange(user.email)}
                    className=" mr-2"
                  />
                  {user.name}
                </label>
              </li>
            ))}
          </ul>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            TaskData();
          }}
          className="flex flex-col justify-center items-center gap-10"
        >
          <label className=" text-xl flex gap-5">
            Title:
            <input
              type="text"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className=" bg-lightAccent rounded-md text-white pl-2 ml-16"
            />
          </label>
          <label className=" text-xl flex gap-5">
            Description:
            <input
              type="text"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className=" bg-lightAccent rounded-md text-white pl-2 "
            />
          </label>
          <label className=" text-xl flex gap-5">
            Due Date:
            <input
              type="text"
              name="dueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className=" bg-lightAccent rounded-md text-white pl-2 ml-5"
            />
          </label>
          <label className=" text-xl flex gap-5">
            Priority:
            <input
              type="text"
              name="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className=" bg-lightAccent rounded-md text-white pl-2 ml-10"
            />
          </label>
          <label className=" text-xl flex gap-5">
            Source:
            <input
              type="text"
              name="source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className=" bg-lightAccent rounded-md text-white pl-2 ml-10"
            />
          </label>
          <button
            className={` neon-text w-full  h-10 md:h-12 lg:h-14 bg-[#072a40] rounded-2xl text-base md:text-lg lg:text-xl hover:bg-[#106092] ${HeaderText.className}`}
            type="submit"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTask;
