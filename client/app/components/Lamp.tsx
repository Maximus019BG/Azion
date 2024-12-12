"use client";
import React from "react";
import {motion} from "framer-motion";
import {LampContainer} from "@/components/ui/lamp";

export function LampDemo() {
    return (
        <div className="">
            <LampContainer>
                <motion.h1
                    initial={{opacity: 0.5, y: 100}}
                    whileInView={{opacity: 1, y: 0}}
                    transition={{
                        delay: 0.3,
                        duration: 0.8,
                        ease: "easeInOut",
                    }}
                    className="bg-gradient-to-br uppercase from-slate-300 to-slate-500 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-8xl"
                >
                    The Life of Azion
                </motion.h1>
            </LampContainer>
        </div>
    );
}
