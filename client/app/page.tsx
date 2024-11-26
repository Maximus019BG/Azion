"use client";
import {motion} from "framer-motion";
import Link from "next/link";
import Navbar from "./components/Navbar";
import {Poppins} from "next/font/google";
import {useEffect, useState} from "react";
import Main_Services from "./components/main-service";
import Footer from "./components/Footer";
import Cookies from "js-cookie";
import {sessionCheck} from "./func/funcs";
import {getOrgName} from "./func/org";
import Hands from "@/public/Artboard2.svg";
import redCircles from "@/public/Artboard3.svg";
import Puzzle from "@/public/Artboard4.svg";
import Suitcase from "@/public/Artboard5.svg";
import Circles from "@/public/Artboard6.svg";
import Hammer from "@/public/Artboard7.svg";
import Building from "@/public/Artboard8.svg";

const HeaderText = Poppins({subsets: ["latin"], weight: "600"});

const Home = () => {
    const [ButtonText1, setButtonText1] = useState("");
    const [ButtonText2, setButtonText2] = useState("");
    const [org, setOrg] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const refreshToken = Cookies.get("azionRefreshToken");
        const accessToken = Cookies.get("azionAccessToken");
        if (refreshToken && accessToken) {
            setButtonText1("Dashboard");
            setButtonText2("Organizations");
            sessionCheck();
        } else {
            setButtonText1("Register");
            setButtonText2("Login");
        }
        const fetchOrgName = async () => {
            const result: string = await getOrgName();
            if (result !== org) {
                setOrg(result);
            }
        };
        fetchOrgName();

        // Check the window width on initial load
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768); // Adjust this value based on your mobile breakpoint
        };

        // Set the initial value based on the screen width
        handleResize();

        // Add event listener to track window resize
        window.addEventListener("resize", handleResize);

        // Clean up event listener on component unmount
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [org]);

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
        {Component: Hands, position: "left-[8vw] top-[0vh]", delay: 0},
        {Component: redCircles, position: "right-[18vw] -top-[3vh]", delay: 0.2},
        {Component: Puzzle, position: "left-[30vw] top-[61vh]", delay: 0.4},
        {Component: Suitcase, position: "right-[15vw] top-[55vh]", delay: 0.6},
        {Component: Circles, position: "left-[0vw] top-[50vh]", delay: 0.8},
        {Component: Hammer, position: "right-[6vw] top-[25vh]", delay: 1},
        {Component: Building, position: "right-[40vw] top-[12vh]", delay: 1.2},
    ];

    const svgsMobile = [
        {Component: Hands, position: "left-[5vw] top-[5vh]", delay: 0},
        {Component: redCircles, position: "right-[8vw] top-[7vh]", delay: 0.2},
        {Component: Puzzle, position: "left-[8vw] top-[35vh]", delay: 0.4},
        {Component: Suitcase, position: "right-[12vw] top-[50vh]", delay: 0.6},
        {Component: Circles, position: "left-[8vw] top-[60vh]", delay: 0.8},
        {Component: Hammer, position: "right-[10vw] top-[27vh]", delay: 1},
        {Component: Building, position: "right-[20vw] top-[65vh]", delay: 1.2},
    ];


    return (
        <div className="w-screen h-full">
            <div className="z-10 p-6">
                <Navbar/>
            </div>

            <div className="w-screen relative">
                {(isMobile ? svgsMobile : svgs).map((svg, index) => (
                    <motion.div
                        key={index}
                        className={`absolute ${svg.position} ${isMobile ? "max-w-[130px] max-h-[130px]" : "max-w-[235px] max-h-[235px]"}`}
                        animate={getLoopAnimation(svg.delay).animate}
                        transition={getLoopAnimation(svg.delay).transition}
                    >
                        <svg.Component className="w-full h-full"/>
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{opacity: 0, y: 400}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 1.2}}
                className="h-[80vh] w-full flex justify-center items-center sm:justify-start md:items-center relative"
            >
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.6, delay: 0.5}}
                    className="h-full md:max-w-5xl max-w-lg p-10 flex flex-col justify-center items-center md:items-start gap-8 z-10"
                >
                    <h1
                        className={`text-3xl text-white lg:text-6xl text-center sm:text-left flex flex-col gap-2 ${HeaderText.className}`}
                    >
                        {["Improve your workflow", "and Secure your company", "with Azion."].map((line, index) => (
                            <motion.span
                                key={index}
                                initial={{opacity: 0, y: 50}}
                                animate={{opacity: 1, y: 0}}
                                transition={{duration: 0.6, delay: index * 0.5}} // Stagger delay for each line
                            >
                                {line}
                            </motion.span>
                        ))}
                    </h1>

                    <motion.div
                        initial={{opacity: 0, y: 50}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.8, delay: 0.8}}
                        className="flex flex-col sm:flex-row md:justify-start md:items-start justify-center items-center gap-4 md:gap-8  w-full"
                    >
                        <div className="w-full">
                            <Link href={org !== null ? `/dashboard/${org}` : `/register`}>
                                <motion.button
                                    whileHover={{scale: 1.05}}
                                    whileTap={{scale: 0.95}}
                                    className={`text-white w-full py-3 bg-accent rounded-2xl text-base sm:text-lg md:text-xl hover:bg-blue-900 ${HeaderText.className}`}
                                >
                                    {ButtonText1}
                                </motion.button>
                            </Link>
                        </div>
                        <div className="w-full">
                            <Link href={org !== null ? `/organizations` : `/login`}>
                                <motion.button
                                    whileHover={{scale: 1.05}}
                                    whileTap={{scale: 0.95}}
                                    className={`text-white w-full py-3 bg-accent rounded-2xl text-base sm:text-lg md:text-xl hover:bg-blue-900 ${HeaderText.className}`}
                                >
                                    {ButtonText2}
                                </motion.button>
                            </Link>
                        </div>
                    </motion.div>
                </motion.div>
            </motion.div>

            <div className="w-full h-full flex flex-col justify-center items-center">
                <div className="w-full h-48 bg-gradient-to-b from-[#06061000] via-[#06061078] to-[#060610]"/>
                <Main_Services/>
            </div>
            <Footer/>
        </div>
    );
};

export default Home;
