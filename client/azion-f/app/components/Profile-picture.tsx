"use client";
import React, { useState } from "react";
import Image from "next/image";

const ProfilePicture = () => {
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-fit h-fit bg-gray-900 rounded-xl flex flex-col items-center justify-center">
      <div className="relative w-fit h-fit  flex flex-col justify-center items-center p-8 space-y-4">
        <div className="relative flex flex-col justify-center items-center">
          <Image
            src={profileImage || "/user.png"}
            alt="Profile"
            width={128}
            height={128}
            className="rounded-full object-cover border-2 border-gray-300"
          />
          {/* Invisible file input positioned over the image */}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
          />
          <h1 className=" text-neonAccent font-extrabold">ROLE</h1>
        </div>
        <div className="w-full">
          <h2 className="text-xl font-bold">Date of creation:</h2>
          <h2 className="text-xl font-bold">Last used:</h2>
        </div>
      </div>
    </div>
  );
};

export default ProfilePicture;