"use client";

import Image from "next/image";
import React from "react";
import {CardBody, CardContainer, CardItem} from "@/components/ui/3d-card";

interface ThreeDCardDemoProps {
    src: string; // Dynamic image source
    title: string; // Dynamic title
    description: string; // Dynamic description text
}

export function ThreeDCardDemo({src, title, description}: ThreeDCardDemoProps) {
    return (
        <CardContainer className="inter-var">
            <CardBody
                className="bg-black relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] border-white/[0.2] w-auto sm:w-[35rem] h-auto sm:h-[45rem] rounded-xl p-6 border flex flex-col"
            >
                <CardItem
                    translateZ="50"
                    className="text-xl font-bold text-white w-full"
                >
                    {title} {/* Display dynamic title */}
                </CardItem>
                <CardItem
                    as="p"
                    translateZ="60"
                    className="text-sm mt-2 text-neutral-300 w-full"
                >
                    {description} {/* Display dynamic description */}
                </CardItem>
                <CardItem
                    translateZ="100"
                    className="w-full mt-4 flex-grow flex items-center justify-center"
                >
                    <Image
                        src={src}
                        height="1000"
                        width="1000"
                        className="h-full w-full object-contain rounded-xl group-hover/card:shadow-xl"
                        alt={title}
                    />
                </CardItem>
            </CardBody>
        </CardContainer>
    );
}
