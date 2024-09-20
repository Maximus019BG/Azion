"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import Navbar from "./components/Navbar";
import { Commissioner, Poppins } from "next/font/google";
import background from "../public/background2.jpeg";
import axios, { AxiosResponse } from "axios";
import { apiUrl } from "./api/config";
import { useEffect, useState } from "react";
import Main_Services from "./components/main-service";
import Footer from "./components/Footer";
import Cookies from "js-cookie";
import { PartOfOrg } from "./func/funcs";
import { getOrgName } from "./func/org";

const HeaderText = Poppins({ subsets: ["latin"], weight: "600" });

interface Token {
  refreshToken: string;
  accessToken: string;
}

const Home = () => {
  const [ButtonText1, setButtonText1] = useState("");
  const [ButtonText2, setButtonText2] = useState("");
  const [org, setOrg] = useState<string | null>("");

  const sessionCheck = (data: Token) => {
    const url = `${apiUrl}/token/session/check`;
    axios
      .post(url, data, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response: AxiosResponse) => {
        const { message, accessToken } = response.data;
        if (message === "newAccessToken generated") {
          localStorage.setItem("azionAccessToken", accessToken);
          setButtonText1("Dashboard");
          setButtonText2("Organizations");
        } else {
          setButtonText1("Dashboard");
          setButtonText2("Organizations");
        }
      })
      .catch(() => {
        setButtonText1("Register");
        setButtonText2("Login");
      });
  };

  useEffect(() => {
    const refreshToken = Cookies.get("azionRefreshToken");
    const accessToken = Cookies.get("azionAccessToken");

    if (refreshToken && accessToken) {
      setButtonText1("Dashboard");
      setButtonText2("Organizations");
      const data = { refreshToken, accessToken };
      sessionCheck(data);
    } else {
      setButtonText1("Register");
      setButtonText2("Login");
    }
  }, []);

  useEffect(() => {
    const fetchOrgName = async () => {
      const result: string = await getOrgName();
      if (result === null) {
        setOrg(null);
      } else {
        setOrg(result);
      }
    };
    fetchOrgName();
  }, []);

  const getLoopAnimation = (delay: number) => ({
    animate: { y: [0, -15, 0] }, // Bounce effect
    transition: {
      duration: 6.5, // Speed
      ease: "easeInOut",
      repeat: Infinity, // Animation loop
      repeatDelay: 0.5, // Time between loops
      delay: delay, // Delay start based on index
    },
  });

  return (
    <div className="">
      <div className="z-10 p-6">
        <Navbar />
      </div>

      {/* IMAGES */}
      <div className="w-full relative ml-6">
        {[
          { src: "/ArtBoard 2.svg", position: "right-5 top-[4vh]", delay: 0 },
          {
            src: "/ArtBoard 3.svg",
            position: "right-[23vw] top-[5vh]",
            delay: 0.3,
          },
          {
            src: "/ArtBoard 4.svg",
            position: "right-[2vw] top-[32vh]",
            delay: 0.6,
          },
          {
            src: "/ArtBoard 5.svg",
            position: "right-[12vw] top-[58vh]",
            delay: 0.9,
          },
          {
            src: "/ArtBoard 6.svg",
            position: "right-[24vw] top-[32vh]",
            delay: 1.2,
          },
          {
            src: "/ArtBoard 7.svg",
            position: "right-[45vw] top-[0vh]",
            delay: 1.5,
          },
          {
            src: "/ArtBoard 8.svg",
            position: "right-[34vw] top-[63vh]",
            delay: 1.8,
          },
        ].map((svg, index) => (
          <motion.div
            key={index}
            className={`absolute ${svg.position}`}
            animate={getLoopAnimation(svg.delay).animate}
            transition={getLoopAnimation(svg.delay).transition}
          >
            <Image
              src={svg.src}
              alt={`Azion svg ${index + 1}`}
              width={300}
              height={300}
            />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: -400 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="h-[80vh] flex justify-start items-end p-16 relative"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="h-full max-w-3xl p-10 flex flex-col justify-end items-center text-center z-10"
        >
          <h1
            className={`text-2xl text-white md:text-3xl lg:text-5xl text-left ${HeaderText.className}`}
          >
            Improve your workflow and Secure your company with Azion.
          </h1>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row justify-start items-start gap-4 md:gap-8 mt-8 md:mt-12 lg:mt-16 w-full"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`text-white w-40 md:w-64 lg:w-72 h-10 md:h-12 lg:h-14 bg-accent rounded-2xl text-base md:text-lg lg:text-xl hover:bg-blue-900 ${HeaderText.className}`}
            >
              <Link href={`/dashboard/${org}`}>{ButtonText1}</Link>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`text-white w-40 md:w-64 lg:w-72 h-10 md:h-12 lg:h-14 bg-accent rounded-2xl text-base md:text-lg lg:text-xl hover:bg-blue-900 ${HeaderText.className}`}
            >
              <Link href={`/organizations/${org}`}>{ButtonText2}</Link>
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
      
      <div className="w-full h-full flex flex-col justify-center items-center mt-48">
      <div className="w-full h-48 bg-gradient-to-b from-[#06061000] via-[#06061078]  to-[#060610]"></div>
        <Main_Services />
      </div>
      <Footer />
    </div>
  );
};

export default Home;