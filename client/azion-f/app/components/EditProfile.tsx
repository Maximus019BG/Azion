"use client";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";

const EditProfile = () => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [date, setDate] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [username, setUsername] = useState<string>("UserName");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleEditClick = () => {
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  return (
    <div className=" bg-gray-900 rounded-xl p-16 w-full h-full flex flex-col justify-center items-center gap-5">
      <h1 className=" text-3xl text-neonAccent font-black">
        Edit your profile
      </h1>
      <div className="flex justify-center items-center gap-3 mt-2 w-full">
        {isEditing ? (
          <div>
            <h1 className=" text-lg">UserName: </h1>
            <input
              ref={inputRef}
              type="text"
              value={username}
              onChange={handleUsernameChange}
              onBlur={handleBlur}
              className="border border-gray-300 rounded p-1 w-full"
            />
          </div>
        ) : (
          <div className="flex flex-col justify-center items-start w-full">
            <h1 className=" text-lg p-2">UserName: </h1>
            <div className="flex justify-between items-center border-2 border-lightAccent p-2 w-full">
              <h1 className="  text-foreground text-lg font-bold">
                {username}
              </h1>
              <button onClick={handleEditClick} className="flex items-center">
                <Image
                  src="/edit.png"
                  alt="Edit Icon"
                  width={30}
                  height={20}
                  className="cursor-pointer"
                />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col justify-between items-start gap-3 w-full">
        <h1 className=" text-lg font-bold">Change Passowrd: </h1>
        <div className="flex justify-between items-center border-2 border-lightAccent p-2 w-full">
          <h1 className=" text-lg font-bold text-foreground">Password</h1>
          <button onClick={handleEditClick} className="flex items-center">
            <Image
              src="/edit.png"
              alt="Edit Icon"
              width={30}
              height={20}
              className="cursor-pointer"
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
