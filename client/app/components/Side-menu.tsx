"use client";
import React, {useEffect, useState} from "react";
import {Commissioner} from "next/font/google";
import Link from "next/link";
import {
    FaBuilding,
    FaChevronDown,
    FaClipboard,
    FaCog,
    FaComments,
    FaPlusCircle,
    FaTasks,
    FaUserCircle,
    FaUsers,
    FaUserSecret,
    FaHome
} from "react-icons/fa";
import {AiFillVideoCamera} from "react-icons/ai";
import LogOut from "@/app/components/LogOut";
import {UserData} from "@/app/func/funcs";
import {TbFaceId} from "react-icons/tb";
import {getOrgName} from "@/app/func/org";

// Font setup
const azionText = Commissioner({subsets: ["latin"], weight: "800"});

const SideMenu = () => {
    const [roleLevel, setRoleLevel] = useState(0);
    const [loading, setLoading] = useState(true);
    const [admin, setAdmin] = useState(false);
    const [isDashboardOpen, setIsDashboardOpen] = useState(false);
    const [isTasksOpen, setIsTasksOpen] = useState(false);
    const [org, setOrg] = useState<string | null>("");
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);

    useEffect(() => {
        UserData().then((response) => {
            setRoleLevel(response.roleLevel);
            setLoading(false);
            if (response.roleLevel >= 1 && response.roleLevel <= 3) {
                setAdmin(true);
            }
            if (response.roleLevel >= 1 && response.roleLevel <= 2) {
                setIsSuperAdmin(true);
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

    const toggleDrawer = () => {
        setIsDrawerOpen(!isDrawerOpen);
    };

    return (
        <div className="w-fit h-fit drawer lg:drawer-open z-40">
            <input
                id="my-drawer-2"
                type="checkbox"
                className="drawer-toggle"
                checked={isDrawerOpen}
                onChange={toggleDrawer}
            />
            <div className="drawer-content flex flex-col items-center justify-center z-50">
                {/* Page content */}
                <label
                    htmlFor="my-drawer-2"
                    className="btn btn-square text-white btn-ghost drawer-button lg:hidden"
                >
                    {isDrawerOpen ? (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            className="absolute top-3 left-3 h-7 w-7 stroke-current"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                            ></path>
                        </svg>
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            className="absolute top-3 left-3 h-7 w-7 stroke-current"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 6h16M4 12h16M4 18h16"
                            ></path>
                        </svg>
                    )}
                </label>
            </div>
            <div className="drawer-side">
                <label
                    htmlFor="my-drawer-2"
                    aria-label="close sidebar"
                    className="drawer-overlay"
                    onClick={toggleDrawer}
                ></label>
                <ul className="menu bg-base-300 text-base-content min-h-full w-80 p-6 flex flex-col justify-center items-start">
                    {/* Sidebar content */}
                    <div className="w-full flex flex-col justify-center items-start gap-4">
                        {/* Conditionally render Dashboard and Tasks sections */}
                        {org && (
                            <>
                                {/* Dashboard Dropdown */}
                                <li className="text-md w-full relative">
                                    <button className="flex items-center justify-between w-full" onClick={toggleDashboardDropdown}>
                                        <h1

                                            className="flex items-center w-full"
                                        >
                                            <FaClipboard className="text-lg mr-2"/>
                                            Dashboard
                                        </h1>

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

                                    </button>
                                    {isDashboardOpen && !admin && (
                                        <ul className="w-full">
                                            <li className="py-1 text-md w-full">
                                                <Link
                                                    href={`/dashboard/${org}`}
                                                    className="flex items-center w-full"
                                                >
                                                    <FaCog className="text-lg mr-2"/>
                                                    Home
                                                </Link>
                                            </li>
                                        </ul>
                                    )}
                                    {isDashboardOpen && admin && (
                                        <ul className="w-full">
                                            <li className="py-1 text-md w-full">
                                                <Link
                                                    href={`/dashboard/${org}`}
                                                    className="flex items-center w-full"
                                                >
                                                    <FaHome className="text-lg mr-2"/>
                                                    Home
                                                </Link>
                                            </li>
                                            <li className="py-1 text-md w-full">
                                                <Link
                                                    href={`/dashboard/${org}/settings`}
                                                    className="flex items-center w-full"
                                                >
                                                    <FaCog className="text-lg mr-2"/>
                                                    Settings
                                                </Link>
                                            </li>
                                            <li className="text-md w-full">
                                                <Link
                                                    href={`/dashboard/${org}/settings/employees`}
                                                    className="flex items-center w-full"
                                                >
                                                    <FaUsers className="text-lg mr-2"/>
                                                    Employees
                                                </Link>
                                            </li>
                                            <li className="text-md w-full">
                                                <Link
                                                    href={`/dashboard/${org}/settings/roles`}
                                                    className="flex items-center w-full"
                                                >
                                                    <FaUserSecret className="text-lg mr-2"/>
                                                    Roles
                                                </Link>
                                            </li>
                                        </ul>
                                    )}
                                </li>

                                {/* Tasks Dropdown */}
                                <li className="text-md w-full relative">
                                    <div className="flex items-center justify-between w-full">
                                        {admin ? (
                                            <button
                                                onClick={toggleTasksDropdown}
                                                className="flex items-center w-full"
                                            >
                                                <FaTasks className="text-lg mr-2"/>
                                                Tasks
                                                <FaChevronDown
                                                    className={`text-sm ml-auto transition-transform duration-200 ${
                                                        isTasksOpen ? "rotate-180" : ""
                                                    }`}
                                                />
                                            </button>
                                        ) : (
                                            <Link
                                                href={`/dashboard/${org}/task`}
                                                className="flex items-center w-full"
                                            >
                                                <FaTasks className="text-lg mr-2"/>
                                                Your Tasks
                                            </Link>
                                        )}
                                    </div>
                                    {isTasksOpen && admin && (
                                        <ul className="w-full">
                                            <li className="py-1 text-md w-full">
                                                <Link
                                                    href={`/dashboard/${org}/task`}
                                                    className="flex items-center w-full"
                                                >
                                                    <FaTasks className="text-lg mr-2"/>
                                                    Your Tasks
                                                </Link>
                                            </li>
                                            <li className="text-md w-full">
                                                <Link
                                                    href={`/dashboard/${org}/task/create`}
                                                    className="flex items-center w-full"
                                                >
                                                    <FaPlusCircle className="text-lg mr-2"/>
                                                    Create Task
                                                </Link>
                                            </li>
                                        </ul>
                                    )}
                                </li>
                            </>
                        )}

                        {isSuperAdmin && (
                            <>
                                <li className="text-md w-full">
                                    <Link href="/cam/list" className="flex items-center w-full">
                                        <AiFillVideoCamera className="text-lg mr-2"/>
                                        Azion Cameras
                                    </Link>
                                </li>
                            </>
                        )}

                        <li className="text-md w-full">
                            <Link href="/organizations" className="flex items-center w-full">
                                <FaBuilding className="text-lg mr-2"/>
                                Organizations
                            </Link>
                        </li>
                        <li className="text-md w-full">
                            <Link href="/mfa/face" className="flex items-center w-full">
                                <TbFaceId className="text-lg mr-2"/>
                                FaceID
                            </Link>
                        </li>
                        <li className="text-md w-full">
                            <Link href="/chat" className="flex items-center w-full">
                                <FaComments className="text-lg mr-2"/>
                                Chat
                            </Link>
                        </li>
                    </div>

                    <li className="mt-auto p-2 text-md w-full">
                        <Link href="/account" className="flex items-center w-full">
                            <FaUserCircle className="text-lg mr-2"/>
                            Account
                        </Link>
                    </li>
                    <li className="p-2 text-md w-full">
                        <LogOut/>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default SideMenu;
