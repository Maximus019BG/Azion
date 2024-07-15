import React, { useState } from "react";
import Logo from "../../public/logo.png";
import Image from "next/image";
import Link from "next/link";
import { MenuIcon } from "@heroicons/react/outline";

const Navbar = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className=" fixed left-0 top-0 flex flex-grow justify-start items-start">
      {/* Small Navbar Section */}
      <div
        className="w-28 h-[100vh] bg-[#072a40] text-slate-200"
        onMouseEnter={() => setIsHovered(true)}
      >
        {/* Upper part */}
        <Link
          href="/"
          className="w-full h-28 flex justify-center items-center hover:bg-[#031520] transition-colors duration-300"
        >
          <Image
            className=""
            src={Logo.src}
            alt="Logo"
            width={80}
            height={50}
          ></Image>
        </Link>
        {/* Lower part */}
        <div className="flex flex-col flex-grow justify-center items-center mt-16">
          <Link
            href="/"
            className="w-full h-28 flex justify-center items-center hover:bg-[#031520] transition-colors duration-300"
          >
            <Image
              className=""
              src={Logo.src}
              alt="Logo"
              width={80}
              height={50}
            ></Image>
          </Link>
          <Link
            href="/"
            className="w-full h-28 flex justify-center items-center hover:bg-[#031520] transition-colors duration-300"
          >
            <Image
              className=""
              src={Logo.src}
              alt="Logo"
              width={80}
              height={50}
            ></Image>
          </Link>
          <Link
            href="/"
            className="w-full h-28 flex justify-center items-center hover:bg-[#031520] transition-colors duration-300"
          >
            <Image
              className=""
              src={Logo.src}
              alt="Logo"
              width={80}
              height={50}
            ></Image>
          </Link>
          <Link
            href="/"
            className="w-full h-28 flex justify-center items-center hover:bg-[#031520] transition-colors duration-300"
          >
            <Image
              className=""
              src={Logo.src}
              alt="Logo"
              width={80}
              height={50}
            ></Image>
          </Link>
        </div>
      </div>
      {/* Full Navbar Section */}
      <div
        className={`transition-all duration-300 ${
          isHovered ? "w-96" : "w-0"
        } h-screen overflow-hidden bg-[#072a40]`}
        
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link
          href="/"
          className="w-full h-28 flex justify-center items-center hover:bg-[#031520] transition-colors duration-300"
        >
          <Image
            className=""
            src={Logo.src}
            alt="Logo"
            width={80}
            height={50}
          ></Image>
        </Link>
        <div className="flex flex-col flex-grow justify-center items-center mt-16">
          <Link
            href="/"
            className="w-full h-28 flex justify-center items-center hover:bg-[#031520] transition-colors duration-300"
          >
            <Image
              className=""
              src={Logo.src}
              alt="Logo"
              width={80}
              height={50}
            ></Image>
          </Link>
          <Link
            href="/"
            className="w-full h-28 flex justify-center items-center hover:bg-[#031520] transition-colors duration-300"
          >
            <Image
              className=""
              src={Logo.src}
              alt="Logo"
              width={80}
              height={50}
            ></Image>
          </Link>
          <Link
            href="/"
            className="w-full h-28 flex justify-center items-center hover:bg-[#031520] transition-colors duration-300"
          >
            <Image
              className=""
              src={Logo.src}
              alt="Logo"
              width={80}
              height={50}
            ></Image>
          </Link>
          <Link
            href="/"
            className="w-full h-28 flex justify-center items-center hover:bg-[#031520] transition-colors duration-300"
          >
            <Image
              className=""
              src={Logo.src}
              alt="Logo"
              width={80}
              height={50}
            ></Image>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
