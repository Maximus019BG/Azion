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
} from "react-icons/fa";
import LogOut from "@/app/components/LogOut";
import { UserData } from "@/app/func/funcs";
import Image from "next/image";

// Font setup
const azionText = Commissioner({ subsets: ["latin"], weight: "800" });

const SideMenu = () => {
  const [roleLevel, setRoleLevel] = useState(0);
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    UserData().then((response) => {
      setRoleLevel(response.roleLevel);
      setLoading(false);
    });
  }, []);

  if(!loading) {
    if (roleLevel > 1 && roleLevel < 3) {
      setAdmin(true);
    }
  }

  return (
    <div className="w-fit h-fit drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col items-center justify-center">
        {/* Page content */}
        <label
          htmlFor="my-drawer-2"
          className="btn btn-square text-white btn-ghost drawer-button lg:hidden"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="inline-block h-8 w-8 stroke-current"
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
      <div className="drawer-side">
        <label
          htmlFor="my-drawer-2"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-6 flex flex-col justify-center items-start">
          {/* Sidebar content */}
          <div className="w-full flex flex-col justify-center items-start gap-4">
            <li className="p-2 text-lg w-full">
              <Link href="/dashboard/settings">
                <FaCog className="text-xl mr-2" />
                Settings
              </Link>
            </li>
            <li className="p-2 text-lg w-full">
              <Link href="/organizations">
                <FaBuilding className="text-xl mr-2" />
                Organizations
              </Link>
            </li>
            <li className="p-2 text-lg w-full">
              <Link href="/mfa/face">
                <FaUserSecret className="text-xl mr-2" />
                FaceID
              </Link>
            </li>
            <li className="p-2 text-lg w-full">
              <Link href="/dashboard">
                <FaClipboard className="text-xl mr-2" />
                Dashboard
              </Link>
            </li>
            <li className="p-2 text-lg w-full">
              <Link href="/dashboard/task">
                <FaTasks className="text-xl mr-2" />
                Tasks
              </Link>
            </li>
          </div>
          <li className="mt-auto p-2 text-lg w-full">
            <Link href="/account">
              <FaUserCircle className="text-xl mr-2" />
              Account
            </Link>
          </li>
          <li className="p-2 text-lg w-full">
            <LogOut />
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SideMenu;
