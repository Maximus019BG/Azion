"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import background from "../public/Image.png";
import Navbar from "./components/Navbar";

export default function Home() {
  return (
    <div>
      <div
        className="flex flex-col justify-center items-start"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(30, 29, 29, 0.8), rgba(26, 25, 25, 0.7), rgba(22, 21, 21, 0.6), rgba(18, 17, 17, 0.5)), url(${background.src})`,
          height: "100vh",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Navbar/>
      </div>
      <div className=" w-screen h-screen">iguyuyuyuyuyuysd</div>
    </div>
  );
}
