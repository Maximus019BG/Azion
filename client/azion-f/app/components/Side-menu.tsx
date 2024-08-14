import React from "react";
import MenuItem from "../layouts/menItem";
import Image from "next/image";
import logo from "../../public/logo.png"
import { Commissioner } from "next/font/google";

const azionText = Commissioner({ subsets: ["latin"], weight: "800" });


const SideMenu = () => {
  return (
    <div className="relative">
      <div className="menu h-screen flex flex-row justify-center items-start bg-base-200 rounded-box space-y-2 transition-all duration-300 ease-in-out overflow-hidden w-20 hover:w-96">
      <div className="flex justify-center items-center">
        <h1 className={` ${azionText.className}  neon-text text-3xl overflow-x-hidden `}>AZION</h1>
      </div>
        <ul className="w-full h-full flex flex-col justify-evenly items-start gap-5">
          <MenuItem
            icon={
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            }
            text="Home"
            tooltip="Home"
          />
          <MenuItem
            icon={
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            }
            text="Home"
            tooltip="Home"
          />
          <MenuItem
            icon={
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            }
            text="Home"
            tooltip="Home"
          />
          <MenuItem
            icon={
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            }
            text="Home"
            tooltip="Home"
          />
          {/* Add more MenuItem components as needed */}
        </ul>
      </div>
    </div>
  );
};

export default SideMenu;
