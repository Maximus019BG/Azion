"use client"
import React, { useState, useEffect } from "react";
import Logo from "../../public/page.png";
import Image from "next/image";
import Link from "next/link";
import { MenuIcon, XIcon } from "@heroicons/react/outline";


const Navbar = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isBurgerOpen, setIsBurgerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const handleScroll = () => {
    setIsScrolled(window.scrollY > 50);
  };

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 600);
    // Close burger menu on resize
    if (window.innerWidth > 600) {
      setIsBurgerOpen(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check on component mount
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const renderNavbarContent = () => (
    <>
      {/* Upper part */}
      <Link
        href="/"
        className="w-full h-28 flex justify-center items-center hover:bg-[#031520] transition-colors duration-300"
      >
        <Image
          className=""
          src={Logo.src}
          alt="Logo"
          width={30}
          height={30}
        />
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
          />
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
          />
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
          />
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
          />
        </Link>
      </div>
    </>
  );

  const renderBurgerMenuContent = () => (
    <div className="fixed top-0 left-0 w-screen text-3xl gap-4 h-screen bg-[#072a40] text-slate-200 flex flex-col justify-center items-center z-40">
      <Link
        href="/"
        className="w-full h-16 flex justify-center items-center hover:bg-[#031520] transition-colors duration-300"
        onClick={() => setIsBurgerOpen(false)} // Close burger menu on link click
      >
        Home
      </Link>
      <Link
        href="/about"
        className="w-full h-16 flex justify-center items-center hover:bg-[#031520] transition-colors duration-300"
        onClick={() => setIsBurgerOpen(false)} // Close burger menu on link click
      >
        About
      </Link>
      <Link
        href="/services"
        className="w-full h-16 flex justify-center items-center hover:bg-[#031520] transition-colors duration-300"
        onClick={() => setIsBurgerOpen(false)} // Close burger menu on link click
      >
        Services
      </Link>
      <Link
        href="/contact"
        className="w-full h-16 flex justify-center items-center hover:bg-[#031520] transition-colors duration-300"
        onClick={() => setIsBurgerOpen(false)} // Close burger menu on link click
      >
        Contact
      </Link>
    </div>
  );

  return (
    <div className="fixed left-0 top-0 flex flex-grow justify-start items-start">
      {/* Small Navbar Section */}
      {!isMobile && (
        <div
          className={`w-28 h-[100vh] bg-[#072a40] text-slate-200 ${
            isBurgerOpen ? "hidden" : isScrolled ? "hidden" : "block"
          }`}
          onMouseEnter={() => setIsHovered(true)}
        >
          {renderNavbarContent()}
        </div>
      )}
      {/* Full Navbar Section */}
      <div
        className={`transition-all duration-300 ${
          isHovered && !isBurgerOpen && !isMobile ? "w-96" : "w-0"
        } h-screen overflow-hidden bg-[#072a40]`}
        onMouseLeave={() => setIsHovered(false)}
      >
        {renderNavbarContent()}
      </div>
      {/* Burger Menu Icon */}
      {isMobile && (
        <div className="fixed top-0 left-0 w-28 h-28  flex justify-center items-center z-50">
          {isBurgerOpen ? (
            <XIcon
              className="w-10 h-10  text-slate-200 cursor-pointer"
              onClick={() => setIsBurgerOpen(false)}
            />
          ) : (
            <MenuIcon
              className="w-10 h-10 text-[#072a40] cursor-pointer"
              onClick={() => setIsBurgerOpen(true)}
            />
          )}
        </div>
      )}
      {/* Burger Menu Content */}
      {isMobile && isBurgerOpen && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-[#072a40] text-slate-200 flex flex-col justify-center items-center z-40">
          {renderBurgerMenuContent()}
        </div>
      )}
      {/* Expanded Navbar Content when Burger is Open */}
      {isMobile && isBurgerOpen && (
        <div
          className={`fixed top-0 left-0 transition-all duration-300 ${
            isBurgerOpen ? "w-full" : "w-0"
          } h-screen overflow-hidden bg-[#072a40]`}
        >
          {renderBurgerMenuContent()}
        </div>
      )}
    </div>
  );
};

export default Navbar;
