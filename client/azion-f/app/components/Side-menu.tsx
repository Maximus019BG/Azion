"use client";
import React, { useEffect, useState } from "react";
import { Commissioner } from "next/font/google";
import Link from "next/link";
import {
  FaSignOutAlt,
  FaUserCircle,
  FaCog,
  FaBuilding,
  FaUserSecret,
  FaClipboard,
  FaTasks,
  FaChevronDown,
  FaPlusCircle,
} from "react-icons/fa";
import LogOut from "@/app/components/LogOut";
import { UserData } from "@/app/func/funcs";
import { TbFaceId } from "react-icons/tb";
import { getOrgName } from "@/app/func/org";

// Font setup
const azionText = Commissioner({ subsets: ["latin"], weight: "800" });

const SideMenu = () => {
  const [roleLevel, setRoleLevel] = useState(0);
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isTasksOpen, setIsTasksOpen] = useState(false);
  const [org, setOrg] = useState<string | null>("");

  useEffect(() => {
    UserData().then((response) => {
      setRoleLevel(response.roleLevel);
      setLoading(false);
      if (response.roleLevel >= 1 && response.roleLevel <= 3) {
        setAdmin(true);
      }
    });
  }, []);

  useEffect(() => {
    const fetchOrgName = async () => {
      const result: string = await getOrgName();
      if (result === null) {
        setOrg(null);
      } else {
        setOrg(result);
      }
    };
    fetchOrgName();
  }, []);

  // Toggle dropdowns
  const toggleDashboardDropdown = () => {
    setIsDashboardOpen(!isDashboardOpen);
  };

  const toggleTasksDropdown = () => {
    setIsTasksOpen(!isTasksOpen);
  };

  return (
    <div className="w-fit h-fit drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col items-center justify-center">
        {/* Page content */}
        <label
          htmlFor="my-drawer-2"
          className="btn btn-square text-white btn-ghost drawer-button lg:hidden "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="inline-block h-2 w-2 stroke-current"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            ></path>
          </svg>
        </label>
      </div>
      <div className="drawer-side ">
        <label
          htmlFor="my-drawer-2"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <ul className="menu bg-gray-800 text-base-content min-h-full w-80 p-6 flex flex-col justify-center items-start">
          {/* Sidebar content */}
          <div className="w-full flex flex-col justify-center items-start gap-4">
            {/* Conditionally render Dashboard and Tasks sections */}
            {org && (
              <>
                {/* Dashboard Dropdown */}
                <li className="p-2 text-md w-full relative">
                  <div className="flex items-center justify-between w-full">
                    <Link
                      href={`/dashboard/${org}`}
                      className="flex items-center w-full"
                    >
                      <FaClipboard className="text-lg mr-2" />
                      Dashboard
                    </Link>
                    {admin && (
                      <button
                        onClick={toggleDashboardDropdown}
                        className="ml-2"
                      >
                        <FaChevronDown
                          className={`text-sm transition-transform duration-200 ${
                            isDashboardOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    )}
                  </div>
                  {isDashboardOpen && admin && (
                    <ul className="mt-2 space-y-2 w-full">
                      <li className="p-2 text-md w-full">
                        <Link
                          href={`/dashboard/${org}/settings`}
                          className="flex items-center w-full"
                        >
                          <FaCog className="text-lg mr-2" />
                          Settings
                        </Link>
                      </li>
                      <li className="p-2 text-md w-full">
                        <Link
                          href={`/dashboard/${org}/settings/roles`}
                          className="flex items-center w-full"
                        >
                          <FaUserSecret className="text-lg mr-2" />
                          Roles
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>

                {/* Tasks Dropdown */}
                <li className="p-2 text-md w-full relative">
                  <div className="flex items-center justify-between w-full">
                    {admin && (
                      <button
                        onClick={toggleTasksDropdown}
                        className="flex items-center w-full"
                      >
                        <FaTasks className="text-lg mr-2" />
                        Tasks
                        <FaChevronDown
                          className={`text-sm ml-auto transition-transform duration-200 ${
                            isTasksOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    )}
                    {!admin && (
                      <Link
                        href={`/dashboard/${org}/task`}
                        className="flex items-center w-full"
                      >
                        <FaTasks className="text-lg mr-2" />
                        Your Tasks
                      </Link>
                    )}
                  </div>
                  {isTasksOpen && admin && (
                    <ul className="mt-2 space-y-2 w-full">
                      <li className="p-2 text-md w-full">
                        <Link
                          href={`/dashboard/${org}/task`}
                          className="flex items-center w-full"
                        >
                          <FaTasks className="text-lg mr-2" />
                          Your Tasks
                        </Link>
                      </li>
                      {admin && (
                        <li className="p-2 text-md w-full">
                          <Link
                            href={`/dashboard/${org}/task/create`}
                            className="flex items-center w-full"
                          >
                            <FaPlusCircle className="text-lg mr-2" />
                            Create Task
                          </Link>
                        </li>
                      )}
                    </ul>
                  )}
                </li>
              </>
            )}

            <li className="p-2 text-md w-full">
              <Link href="/organizations" className="flex items-center w-full">
                <FaBuilding className="text-lg mr-2" />
                Organizations
              </Link>
            </li>
            <li className="p-2 text-md w-full">
              <Link href="/mfa/face" className="flex items-center w-full">
                <TbFaceId className="text-lg mr-2" />
                FaceID
              </Link>
            </li>
          </div>

          <li className="mt-auto p-2 text-md w-full">
            <Link href="/account" className="flex items-center w-full">
              <FaUserCircle className="text-lg mr-2" />
              Account
            </Link>
          </li>
          <li className="p-2 text-md w-full">
            <LogOut />
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SideMenu;
