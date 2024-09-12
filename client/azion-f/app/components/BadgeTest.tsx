// components/Badge.js
import { useState } from "react";
import Draggable from "react-draggable";
import ProfilePicture from "./Profile-picture";
import { Commissioner } from "next/font/google";
import { UserData } from "../func/funcs";

const azionText = Commissioner({ subsets: ["latin"], weight: "800" });


const Badge = () => {

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");
    const [roleLevel, setRoleLevel] = useState(0);

    UserData().then((response) => {
        setName(response.name);
        setEmail(response.email);
        setRole(response.role);
        setRoleLevel(response.roleLevel);
    });

  return (
    <Draggable>
      <div className="relative bg-blue-600 w-[25vw] h-[70vh] rounded-xl flex flex-col justify-between p-8 text-white shadow-lg cursor-grab">
        {/* Header */}
        <div className="relative z-10">
          <div className="flex justify-between items-center">
            <div className="text-xl font-bold">
              <h1
                className={` flex justify-center items-end gap-3 neon-text text-xl md:text-2xl lg:text-4xl ${azionText.className}`}
              >
                AZION
                <span className="border border-white text-white text-xs p-1 rounded">
                  {roleLevel}
                </span>
              </h1>
            </div>
            <div className="text-3xl font-bold">N</div>
          </div>
        </div>

        <div className=" w-fit">
          <ProfilePicture />
        </div>

        {/* Name Section */}
        <div className="relative z-10 w-fit">
          <h2 className="text-3xl font-bold">{name}</h2>
          <h2 className="text-xl font-semibold">{email}</h2>
          <p className="text-sm mt-2 uppercase">{role   }</p>
        </div>

        {/* Date and Event Type */}
        <div className="relative z-10">
          <p className="uppercase text-sm">October 24th</p>
          <div className="flex items-center mt-2">
            <span className="material-icons text-sm">computer</span>
            <p className="uppercase ml-2 text-sm">Virtual</p>
          </div>
        </div>
      </div>
    </Draggable>
  );
};

export default Badge;
