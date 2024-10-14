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
import Artboard2 from "../public/Artboard2.svg";
import Artboard3 from "../public/Artboard3.svg";
import Artboard4 from "../public/Artboard4.svg";
import Artboard5 from "../public/Artboard5.svg";
import Artboard6 from "../public/Artboard6.svg";
import Artboard7 from "../public/Artboard7.svg";
import Artboard8 from "../public/Artboard8.svg";

const HeaderText = Poppins({subsets: ["latin"], weight: "600"});

const Home = () => {
    const [ButtonText1, setButtonText1] = useState("");
    const [ButtonText2, setButtonText2] = useState("");
    const [org, setOrg] = useState<string | null>(null);
    const [login, setLogin] = useState(false);

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
        {Component: Artboard2, position: "right-[3vw] top-[0vh]", delay: 0},
        {Component: Artboard3, position: "right-[23vw] -top-[6vh]", delay: 0.3},
        {Component: Artboard4, position: "right-[27vw] top-[32vh]", delay: 0.6},
        {Component: Artboard5, position: "right-[9vw] top-[60vh]", delay: 0.9},
        {Component: Artboard6, position: "left-[0vw] top-[50vh]", delay: 1.2},
        {Component: Artboard7, position: "right-[3vw] top-[32vh]", delay: 1.5},
        {Component: Artboard8, position: "right-[34vw] top-[63vh]", delay: 1.8},
    ];

    return (
        <div className="">
            <div className="z-10 p-6">
                <Navbar/>
            </div>

            <div className="w-full relative ml-6">
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
            </div>

            <motion.div
                initial={{opacity: 0, y: -400}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.6}}
                className="h-[80vh] flex justify-start items-end p-16 relative"
            >
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.6, delay: 0.3}}
                    className="h-full max-w-3xl p-10 flex flex-col justify-start items-center text-center z-10"
                >
                    <h1 className={`text-2xl text-white md:text-3xl lg:text-5xl text-left ${HeaderText.className}`}>
                        Improve your workflow and Secure your company with Azion.
                    </h1>

                    <motion.div
                        initial={{opacity: 0, x: -20}}
                        animate={{opacity: 1, x: 0}}
                        transition={{duration: 0.6, delay: 0.6}}
                        className="flex flex-col sm:flex-row justify-start items-start gap-4 md:gap-8 mt-8 md:mt-12 lg:mt-16 w-full"
                    >
                        <motion.button
                            whileHover={{scale: 1.05}}
                            whileTap={{scale: 0.95}}
                            className={`text-white w-40 md:w-64 lg:w-72 h-10 md:h-12 lg:h-14 bg-accent rounded-2xl text-base md:text-lg lg:text-xl hover:bg-blue-900 ${HeaderText.className}`}
                        >
                            {org !== null && (<Link href={`/dashboard/${org}`}>{ButtonText1}</Link>)}
                            {org === null && (<Link href={`/register`}>Register</Link>)}
                        </motion.button>
                        <motion.button
                            whileHover={{scale: 1.05}}
                            whileTap={{scale: 0.95}}
                            className={`text-white w-40 md:w-64 lg:w-72 h-10 md:h-12 lg:h-14 bg-accent rounded-2xl text-base md:text-lg lg:text-xl hover:bg-blue-900 ${HeaderText.className}`}
                        >
                            {org !== null && (<Link href={`/organizations`}>{ButtonText2}</Link>)}
                            {org === null && (<Link href={`/login`}>Login</Link>)}
                        </motion.button>
                    </motion.div>
                </motion.div>
            </motion.div>

            <div className="w-full h-full flex flex-col justify-center items-center mt-48">
                <div className="w-full h-48 bg-gradient-to-b from-[#06061000] via-[#06061078] to-[#060610]"></div>
                <Main_Services/>
            </div>
            <Footer/>
        </div>
    );
};

export default Home;