"use client";
import React, {useEffect, useState} from "react";
import {Commissioner} from "next/font/google";
// import Link from "next/link";
// import {
//     FaBuilding,
//     FaChevronDown,
//     FaClipboard,
//     FaCog,
//     FaComments,
//     FaPlusCircle,
//     FaTasks,
//     FaUserCircle,
//     FaUsers,
//     FaUserSecret
// } from "react-icons/fa";
// import LogOut from "@/components/LogOut";
import {UserData} from "@/app/func/funcs";
// import {TbFaceId} from "react-icons/tb";
// import {MdMeetingRoom} from "react-icons/md";
import {getOrgName} from "@/app/func/org";


import {Sidebar, SidebarBody, SidebarLink} from "@/components/ui/sidebar";
import {IconArrowLeft, IconBrandTabler, IconSettings, IconUserBolt,} from "@tabler/icons-react";
import Link from "next/link";
import {motion} from "framer-motion";
import Image from "next/image";
import {cn} from "@/lib/utils";


// Font setup
const azionText = Commissioner({subsets: ["latin"], weight: "800"});

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

    const links = [
        {
            label: "Dashboard",
            href: "#",
            icon: (
                <IconBrandTabler className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0"/>
            ),
        },
        {
            label: "Profile",
            href: "#",
            icon: (
                <IconUserBolt className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0"/>
            ),
        },
        {
            label: "Settings",
            href: "#",
            icon: (
                <IconSettings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0"/>
            ),
        },
        {
            label: "Logout",
            href: "#",
            icon: (
                <IconArrowLeft className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0"/>
            ),
        },
    ];
    const [open, setOpen] = useState(false);

    return (
        <div
            className={cn(
                "rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 max-w-7xl mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden",
                "h-screen" // for your use case, use `h-screen` instead of `h-[60vh]`
            )}
        >
            <Sidebar open={open} setOpen={setOpen}>
                <SidebarBody className="justify-between gap-10">
                    <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                        {open ? <Logo/> : <LogoIcon/>}
                        <div className="mt-8 flex flex-col gap-2">
                            {links.map((link, idx) => (
                                <SidebarLink key={idx} link={link}/>
                            ))}
                        </div>
                    </div>
                    <div>
                        <SidebarLink
                            link={{
                                label: "Manu Arora",
                                href: "#",
                                icon: (
                                    <Image
                                        src="https://assets.aceternity.com/manu.png"
                                        className="h-7 w-7 flex-shrink-0 rounded-full"
                                        width={50}
                                        height={50}
                                        alt="Avatar"
                                    />
                                ),
                            }}
                        />
                    </div>
                </SidebarBody>
            </Sidebar>
        </div>
    );
}
export const Logo = () => {
    return (
        <Link
            href="#"
            className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
        >
            <div
                className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0"/>
            <motion.span
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                className="font-medium text-black dark:text-white whitespace-pre"
            >
                Acet Labs
            </motion.span>
        </Link>
    );
};
export const LogoIcon = () => {
    return (
        <Link
            href="#"
            className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
        >
            <div
                className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0"/>
        </Link>
    );
};

// Dummy dashboard component with content
const Dashboard = () => {
    return (
        <div className="flex flex-1">
            <div
                className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
                <div className="flex gap-2">
                    {[...new Array(4)].map((i) => (
                        <div
                            key={"first-array" + i}
                            className="h-20 w-full rounded-lg  bg-gray-100 dark:bg-neutral-800 animate-pulse"
                        ></div>
                    ))}
                </div>
                <div className="flex gap-2 flex-1">
                    {[...new Array(2)].map((i) => (
                        <div
                            key={"second-array" + i}
                            className="h-full w-full rounded-lg  bg-gray-100 dark:bg-neutral-800 animate-pulse"
                        ></div>
                    ))}
                </div>
            </div>
        </div>
        //     <div className="w-fit h-fit drawer lg:drawer-open">
        //         <input id="my-drawer-2" type="checkbox" className="drawer-toggle"/>
        //         <div className="drawer-content flex flex-col items-center justify-center">
        //             {/* Page content */}
        //             <label
        //                 htmlFor="my-drawer-2"
        //                 className="btn btn-square text-white btn-ghost drawer-button lg:hidden "
        //             >
        //                 <svg
        //                     xmlns="http://www.w3.org/2000/svg"
        //                     fill="none"
        //                     viewBox="0 0 24 24"
        //                     className="inline-block h-2 w-2 stroke-current"
        //                 >
        //                     <path
        //                         strokeLinecap="round"
        //                         strokeLinejoin="round"
        //                         strokeWidth="2"
        //                         d="M4 6h16M4 12h16M4 18h16"
        //                     ></path>
        //                 </svg>
        //             </label>
        //         </div>
        //         <div className="drawer-side ">
        //             <label
        //                 htmlFor="my-drawer-2"
        //                 aria-label="close sidebar"
        //                 className="drawer-overlay"
        //             ></label>
        //             <ul className="menu bg-base-300 text-base-content min-h-full w-80 p-6 flex flex-col justify-center items-start">
        //                 {/* Sidebar content */}
        //                 <div className="w-full flex flex-col justify-center items-start gap-4">
        //                     {/* Conditionally render Dashboard and Tasks sections */}
        //                     {org && (
        //                         <>
        //                             {/* Dashboard Dropdown */}
        //                             <li className=" text-md w-full relative">
        //                                 <div className="flex items-center justify-between w-full">
        //                                     <Link
        //                                         href={`/dashboard/${org}`}
        //                                         className="flex items-center w-full"
        //                                     >
        //                                         <FaClipboard className="text-lg mr-2"/>
        //                                         Dashboard
        //                                     </Link>
        //                                     {admin && (
        //                                         <button
        //                                             onClick={toggleDashboardDropdown}
        //                                             className="ml-2"
        //                                         >
        //                                             <FaChevronDown
        //                                                 className={`text-sm transition-transform duration-200 ${
        //                                                     isDashboardOpen ? "rotate-180" : ""
        //                                                 }`}
        //                                             />
        //                                         </button>
        //                                     )}
        //                                 </div>
        //                                 {isDashboardOpen && admin && (
        //                                     <ul className=" w-full">
        //                                         <li className=" py-1 text-md w-full">
        //                                             <Link
        //                                                 href={`/dashboard/${org}/settings`}
        //                                                 className="flex items-center w-full"
        //                                             >
        //                                                 <FaCog className="text-lg mr-2"/>
        //                                                 Settings
        //                                             </Link>
        //                                         </li>
        //                                         <li className=" py-1 text-md w-full">
        //                                             <Link
        //                                                 href={`/dashboard/${org}/meetings/create`}
        //                                                 className="flex items-center w-full"
        //                                             >
        //                                                 <MdMeetingRoom className="text-lg mr-2"/>
        //                                                 Meetings
        //                                             </Link>
        //                                         </li>
        //                                         <li className="text-md w-full">
        //                                             <Link
        //                                                 href={`/dashboard/${org}/settings/employees`}
        //                                                 className="flex items-center w-full"
        //                                             >
        //                                                 <FaUsers className="text-lg mr-2"/>
        //                                                 Employees
        //                                             </Link>
        //                                         </li>
        //                                         <li className="text-md w-full">
        //                                             <Link
        //                                                 href={`/dashboard/${org}/settings/roles`}
        //                                                 className="flex items-center w-full"
        //                                             >
        //                                                 <FaUserSecret className="text-lg mr-2"/>
        //                                                 Roles
        //                                             </Link>
        //                                         </li>
        //                                     </ul>
        //                                 )}
        //                             </li>
        //
        //                             {/* Tasks Dropdown */}
        //                             <li className="text-md w-full relative">
        //                                 <div className="flex items-center justify-between w-full">
        //                                     {admin && (
        //                                         <button
        //                                             onClick={toggleTasksDropdown}
        //                                             className="flex items-center w-full"
        //                                         >
        //                                             <FaTasks className="text-lg mr-2"/>
        //                                             Tasks
        //                                             <FaChevronDown
        //                                                 className={`text-sm ml-auto transition-transform duration-200 ${
        //                                                     isTasksOpen ? "rotate-180" : ""
        //                                                 }`}
        //                                             />
        //                                         </button>
        //                                     )}
        //                                     {!admin && (
        //                                         <Link
        //                                             href={`/dashboard/${org}/task`}
        //                                             className="flex items-center w-full"
        //                                         >
        //                                             <FaTasks className="text-lg mr-2"/>
        //                                             Your Tasks
        //                                         </Link>
        //                                     )}
        //                                 </div>
        //                                 {isTasksOpen && admin && (
        //                                     <ul className=" w-full">
        //                                         <li className="py-1 text-md w-full">
        //                                             <Link
        //                                                 href={`/dashboard/${org}/task`}
        //                                                 className="flex items-center w-full"
        //                                             >
        //                                                 <FaTasks className="text-lg mr-2"/>
        //                                                 Your Tasks
        //                                             </Link>
        //                                         </li>
        //                                         {admin && (
        //                                             <li className="text-md w-full">
        //                                                 <Link
        //                                                     href={`/dashboard/${org}/task/create`}
        //                                                     className="flex items-center w-full"
        //                                                 >
        //                                                     <FaPlusCircle className="text-lg mr-2"/>
        //                                                     Create Task
        //                                                 </Link>
        //                                             </li>
        //                                         )}
        //                                     </ul>
        //                                 )}
        //                             </li>
        //                         </>
        //                     )}
        //
        //                     <li className=" text-md w-full">
        //                         <Link href="/organizations" className="flex items-center w-full">
        //                             <FaBuilding className="text-lg mr-2"/>
        //                             Organizations
        //                         </Link>
        //                     </li>
        //                     <li className=" text-md w-full">
        //                         <Link href="/mfa/face" className="flex items-center w-full">
        //                             <TbFaceId className="text-lg mr-2"/>
        //                             FaceID
        //                         </Link>
        //                     </li>
        //                     <li className=" text-md w-full">
        //                         <Link href="/chat" className="flex items-center w-full">
        //                             <FaComments className="text-lg mr-2"/>
        //                             Chat
        //                         </Link>
        //                     </li>
        //                 </div>
        //
        //                 <li className="mt-auto p-2 text-md w-full">
        //                     <Link href="/account" className="flex items-center w-full">
        //                         <FaUserCircle className="text-lg mr-2"/>
        //                         Account
        //                     </Link>
        //                 </li>
        //                 <li className="p-2 text-md w-full">
        //                     <LogOut/>
        //                 </li>
        //             </ul>
        //         </div>
        //     </div>
    );

};

export default SideMenu;
