"use client";
import React from 'react';
import {Poppins} from "next/font/google";
import Artboard2 from "@/public/Artboard2.svg";
import Artboard3 from "@/public/Artboard3.svg";
import Artboard4 from "@/public/Artboard4.svg";
import Artboard5 from "@/public/Artboard5.svg";
import Artboard6 from "@/public/Artboard6.svg";
import Artboard7 from "@/public/Artboard7.svg";
import Artboard8 from "@/public/Artboard8.svg";
import {motion} from "framer-motion";

const HeaderText = Poppins({subsets: ["latin"], weight: "600"});

const Custom404 = () => {
    const getLoopAnimation = (delay: number) => ({
        animate: {y: [0, -15, 0]},
        transition: {
            duration: 6.5,
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 0.5,
            delay: delay,
        },
    });

    const svgs = [
        {Component: Artboard2, position: "right-[3vw] top-[0vh]", delay: 0},
        {Component: Artboard3, position: "left-[8vw] -top-[3vh]", delay: 0.3},
        {Component: Artboard4, position: "right-[40vw] top-[0vh]", delay: 0.6},
        {Component: Artboard5, position: "right-[21vw] bottom-[0vh]", delay: 0.9},
        {Component: Artboard6, position: "left-[0vw] top-[35vh]", delay: 1.2},
        {Component: Artboard7, position: "right-[3vw] top-[37vh]", delay: 1.5},
        {Component: Artboard8, position: "left-[16vw] top-[70vh]", delay: 1.8},
    ];

    return (
        <div className="w-screen h-screen flex justify-center items-center bg-background overflow-hidden">
            {svgs.map((svg, index) => (
                <motion.div
                    key={index}
                    className={`absolute ${svg.position}`}
                    animate={getLoopAnimation(svg.delay).animate}
                    transition={getLoopAnimation(svg.delay).transition}
                >
                    <svg.Component width={300} height={300}/>
                </motion.div>
            ))}
            <h1 className={`${HeaderText.className} gradient-text text-5xl`}>
                404 - Page Not Found!!!!!
            </h1>
        </div>
    );
};

export default Custom404;
