"use client";
import {motion, useScroll, useTransform, Variants} from "framer-motion";
import {useRef} from "react";
import {Poppins} from "next/font/google";
import {ThreeDCardDemo} from "@/app/components/3dCard";

const HeaderText = Poppins({subsets: ["latin"], weight: "600"});

const cardVariants = (rotateValue: number): Variants => ({
    offscreen: {
        y: 200,
    },
    onscreen: {
        y: 50,
        rotate: rotateValue,
        transition: {
            type: "spring",
            bounce: 0.6,
            duration: 1.2,
        },
    },
});

interface MockupWindowProps {
    rotateValue: number;
    src: string;
    title: string;
    description: string;
}

function MockupWindow({rotateValue, src, title, description}: MockupWindowProps) {
    return (
        <div className="relative w-full h-full flex flex-col items-center gap-4">
            {/* Pass the image source and texts to the 3D card */}
            <ThreeDCardDemo src={src} title={title} description={description}/>
            <motion.div
                initial="offscreen"
                whileInView="onscreen"
                variants={cardVariants(rotateValue)}
                className="text-center text-white text-lg font-medium"
            >
            </motion.div>
        </div>
    );
}

const HorizontalScrollCarousel = () => {
    const targetRef = useRef<HTMLDivElement | null>(null);
    const {scrollYProgress} = useScroll({
        target: targetRef,
    });

    const x = useTransform(scrollYProgress, [0, 1], ["1%", "-95%"]);

    // Unique titles, descriptions, and texts for each card
    const cardDetails = [
        {
            src: "/Dashboard.png",
            title: "Dashboard",
            description: "Here you can see all the important information at a glance. You can have control over your organization's data and manage it effectively and smoothly.",
        },
        {
            src: "/Org.png",
            title: "Organization",
            description: "Collaborate with other organizations with ease. Here you can find any organization registered in Azion",
        },
        {
            src: "/Task.png",
            title: "Task Management",
            description: "Manage tasks effortlessly with our task functionality. Azion provides easy and efficient task management. You can create, control and delete tasks with ease.",
        },
        {
            src: "/Account.png",
            title: "Cyber Security",
            description: "Cyber security is our top priority. Azion provides a secure environment for all the users and companies that are registered. Azion provides MFA, OTP, and other security features to keep your account safe.",
        },
    ];

    const rotateValues = [5, -5, 10, -10]; // Different rotate values

    return (
        <section ref={targetRef} className="relative h-[300vh] bg-[#060610]">
            <div className="sticky top-0 flex h-screen items-center overflow-hidden">
                <motion.div
                    style={{x}}
                    className="flex justify-center items-center gap-48"
                >
                    <div className="w-full h-full flex justify-center items-center gap-[30vw]">
                        <h1
                            className={`${HeaderText.className} text-5xl min-w-max uppercase leading-snug`}
                        >
                            <span className="gradient-text">
                                Azion secures every part
                            </span>{" "}
                            of your account and <br/> organisation&apos;s account
                        </h1>

                        <div className="w-full h-full flex justify-center items-center gap-24">
                            {cardDetails.map((card, index) => (
                                <MockupWindow
                                    key={index}
                                    rotateValue={rotateValues[index]}
                                    src={card.src}
                                    title={card.title}
                                    description={card.description}
                                />
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

const Main_Services = () => {
    return (
        <div className="w-full h-full">
            <HorizontalScrollCarousel/>
        </div>
    );
};

export default Main_Services;
