"use client";
import React, { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { apiUrl } from "../../api/config";
import Cookies from "js-cookie";
import { CheckMFA, PartOfOrg, UserData } from "../../func/funcs";
import { Poppins } from "next/font/google";
import SideMenu from "@/app/components/Side-menu";

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
  const [priority, setPriority] = useState("LOW");
  const [source, setSource] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [selectedMonth, setSelectedMonth] = useState("01");
  const [selectedDay, setSelectedDay] = useState("01");
  const [selectedYear, setSelectedYear] = useState("2024");
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
      window.location.href = "/login";
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

  //*Date
  const isLeapYear = (year: number): boolean => {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  };

  const isValidDate = (day: string, month: string, year: string): boolean => {
    const dayInt = parseInt(day);
    const monthInt = parseInt(month);
    const yearInt = parseInt(year);

    if (monthInt === 2) {
      if (isLeapYear(yearInt)) {
        return dayInt <= 29;
      } else {
        return dayInt <= 28;
      }
    }

    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return dayInt <= daysInMonth[monthInt - 1];
  };

  const handleDueDateChange = () => {
    if (isValidDate(selectedDay, selectedMonth, selectedYear)) {
      setDueDate(`${selectedMonth}/${selectedDay}/${selectedYear}`);
    } else {
      alert("Invalid date selected. Please choose a valid date.");
    }
  };

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, "0");
  const currentDay = currentDate.getDate().toString().padStart(2, "0");

  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"))
    .filter(month => parseInt(selectedYear) > currentYear || parseInt(month) >= parseInt(currentMonth));

  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, "0"))
    .filter(day => isValidDate(day, selectedMonth, selectedYear) &&
      ((parseInt(selectedMonth) > parseInt(currentMonth) || parseInt(selectedYear) > currentYear) || parseInt(day) >= parseInt(currentDay)));

  const years = Array.from({ length: 11 }, (_, i) => (currentYear + i).toString());

  //!User list
  const userList = Array.isArray(users) ? users : [];
  //!Priority options
  const priorities = ["LOW", "MEDIUM", "HIGH", "VERY_HIGH"];

  return (
    <div className="w-screen h-screen flex overflow-hidden">
      <div className="w-1/4 min-w-[250px] h-full">
        <SideMenu />
      </div>
      <div className="w-3/4 p-6 overflow-auto flex justify-center items-center">
        <div className="flex flex-col justify-center items-center gap-16">
          <h1 className="text-5xl font-extrabold text-neonAccent">
            Create tasks here
          </h1>
          <div className="flex justify-start items-start gap-48">
            <div className="flex flex-col justify-start items-center gap-5">
              <h1 className="text-3xl font-extrabold">Users:</h1>
              <ul>
                {userList.map((user, index) => (
                  <li key={index}>
                    <label>
                      <input
                        type="checkbox"
                        value={user.id}
                        onChange={() => handleCheckboxChange(user.email)}
                        className="mr-2"
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
                handleDueDateChange();
                TaskData();
              }}
              className="flex flex-col justify-center items-center gap-10"
            >
              <label className="text-xl flex gap-5">
                Title:
                <input
                  type="text"
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-lightAccent rounded-md text-white pl-2 ml-16"
                />
              </label>
              <label className="text-xl flex gap-5">
                Description:
                <input
                  type="text"
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-lightAccent rounded-md text-white pl-2"
                />
              </label>
              <div className="w-full text-xl flex gap-5 items-center">
                Due Date:
                <div className="flex gap-2">
                <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                    className=" ml-5 bg-lightAccent rounded-md text-white"
                  >
                    {days.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-lightAccent rounded-md text-white"
                  >
                    {months.map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="bg-lightAccent rounded-md text-white"
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <label className=" w-full text-xl flex gap-5">
                Priority:
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="bg-lightAccent rounded-md text-white pl-2 ml-10"
                >
                  {priorities.map((prio) => (
                    <option key={prio} value={prio}>
                      {prio}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xl flex gap-5">
                Source:
                <input
                  type="text"
                  name="source"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="bg-lightAccent rounded-md text-white pl-2 ml-10"
                />
              </label>
              <button
                className={`neon-text w-full h-10 md:h-12 lg:h-14 bg-[#072a40] rounded-2xl text-base md:text-lg lg:text-xl hover:bg-[#106092] ${HeaderText.className}`}
                type="submit"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTask;
