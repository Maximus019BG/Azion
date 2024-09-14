"use client"
import React, {FC, useEffect, useState} from "react";
import axios, { AxiosResponse } from "axios";
import { apiUrl } from "@/app/api/config";
import { Poppins } from "next/font/google";
import Cookies from "js-cookie";
import { CheckMFA, PartOfOrg, UserData } from "@/app/func/funcs";
import Link from "next/link";
import SideMenu from "@/app/components/Side-menu";
import OrgDetailsCard from "@/app/layouts/OrgDetailsCard";
import {getOrgName} from "@/app/func/org";

const headerText = Poppins({ subsets: ["latin"], weight: "900" });

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
interface PageProps {
    params: {
        org: string;
    };
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

const Tasks: FC<PageProps> = ({params}) => {
  const [admin, setAdmin] = useState(false);
  const [task, setTask] = useState<Task[]>([]);
  const [orgNameCheck, setOrgNameCheck] = useState<string>("");
  const orgName = params.org;

  const GetTasks = () => {
    axios
      .get(`${apiUrl}/projects/list`, {
        headers: {
          "Content-Type": "application/json",
          authorization: Cookies.get("azionAccessToken"),
        },
      })
      .then((response: AxiosResponse) => {
        console.log(response.data);
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
    if (data.roleLevel > 0 && data.roleLevel < 3) {
      setAdmin(true);
    }
  });

  useEffect(() => {
    const fetchOrgName = async () => {
      const result: string = await getOrgName();
      setOrgNameCheck(result);
    };

    fetchOrgName();
  }, [orgName]);

  useEffect(() => {
    if (orgNameCheck && orgNameCheck !== orgName) {
      window.location.href = `/dashboard/${orgNameCheck}/task`;
    }
  }, [orgNameCheck, orgName]);

  return (
    <div className="w-screen h-screen flex overflow-hidden">
      <div className="w-1/4 min-w-[250px] h-full">
        <SideMenu />
      </div>
      <div className="w-3/4 p-6 overflow-auto flex justify-center items-center">
        <div className="flex flex-col justify-center items-center gap-10 w-full max-w-5xl">
          <h1 className="text-5xl text-neonAccent font-black mt-16">Your tasks:</h1>
          {/* Main Grid Container for Tasks */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {task.map((task) => (
              <OrgDetailsCard
                key={task.id}
                orgName={task.name}
                orgAddress={task.description}
                orgEmail={task.project}
                orgType={task.status}
                orgPhone={task.date}
                orgDescription={task.createdBy.name}
              />
            ))}
          </div>
          {admin && (
            <Link
              className={`neon-text w-40 md:w-64 lg:w-72 h-10 md:h-12 lg:h-14 bg-[#072a40] rounded-2xl text-base md:text-lg lg:text-xl hover:bg-[#106092] flex justify-center items-center ${headerText.className}`}
              href={"/dashboard/task/create"}
            >
              Create task
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tasks;
