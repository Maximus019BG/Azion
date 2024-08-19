"use client"
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";


interface MainServiceLayoutProps {
  title: string;
  description: string;
  imageUrl: string;
}

const MainServiceLayout: React.FC<MainServiceLayoutProps> = ({
  title,
  description,
  imageUrl,
}) => {
  return (
    <div className=" w-screen flex justify-evenly items-center ">
      <motion.div
        initial={{ opacity: 0, x: -400 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className=" flex flex-col justify-center items-center gap-4 text-center">
        <h1 className=" text-5xl">{title}</h1>
        <p className=" text-xl">{description}</p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 400 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}>
        <Image src={imageUrl} alt={title} width={500} height={500} />
      </motion.div>
    </div>
  );
};

export default MainServiceLayout;
