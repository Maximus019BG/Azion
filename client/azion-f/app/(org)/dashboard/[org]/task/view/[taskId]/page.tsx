"use client";
import React, { FC, useEffect, useState } from "react";
import { getOrgName, getTasks } from "@/app/func/org";
import Loading from "@/app/components/Loading";
import SideMenu from "@/app/components/Side-menu";
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

  useEffect(() => {
    const orgNameFunc = async () => {
      const result = await getOrgName();
      setOrgName(result);
    };
    orgNameFunc();

    if (orgName && orgName !== org) {
      window.location.href = `/dashboard/${orgName}/task`;
    }
  }, [org, orgName]);

  useEffect(() => {
    if (taskId) {
      getTasks(taskId)
        .then((taskData) => {
          setTask(taskData);
          setTimeout(() => {
            setLoading(false);
          }, 1000);
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      window.location.href = `/dashboard/${orgName}/task`;
    }
  }, [taskId, orgName]);

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

          <div className=" flex flex-col justify-center items-start gap-10 bg-gray-800 p-24 rounded-xl">
            <h1
              className={` text-5xl ${HeaderText.className} w-full bg-gray-700 p-5 `}
            >
              Task Details
            </h1>
            <p className=" flex justify-between p-5 items-center gap-3 text-xl w-full h-12 bg-gray-700">
              <span className=" font-bold">Name</span>
              {task.name}
            </p>
            <p className=" flex justify-between p-5 items-center gap-3 text-xl w-full h-12 bg-gray-700">
              <span className=" font-bold">Description</span> {task.description}
            </p>
            <p className=" flex justify-between p-5 items-center gap-3 text-xl w-full h-12 bg-gray-700">
              <span className=" font-bold">Status</span> {task.status}
            </p>
            <p className=" flex justify-between p-5 items-center gap-3 text-xl w-full h-12 bg-gray-700">
              <span className=" font-bold">Date</span> {task.date}
            </p>

            {task.createdBy && (
              <p className=" flex justify-between p-5 items-center gap-3 text-xl w-full h-12 bg-gray-700">
                <span className=" font-bold">Created By:</span>{" "}
                <div>
                  {task.createdBy.name}
                  {task.createdBy.email && (
                    <span> ({task.createdBy.email})</span>
                  )}
                </div>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskView;
