"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import Navbar from "./components/Navbar";
import { Commissioner, Poppins } from "next/font/google";
import background from "../public/background1.png";
import axios, { AxiosResponse } from "axios";
import { apiUrl } from "./api/config";
import { useEffect, useState } from "react";

interface Token {
  refreshToken: string;
  accessToken: string;
}

const azionText = Commissioner({ subsets: ["latin"], weight: "800" });
const HeaderText = Poppins({ subsets: ["latin"], weight: "600" });

const Home = () => {
  const [ButtonText1, setButtonText1] = useState("");
  const [ButtonText2, setButtonText2] = useState("");

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
        } else if (message !== "success") {
          setButtonText1("Dashboard");
          setButtonText2("Organizations");
        }
      })
      .catch((error) => {
        setButtonText1("Register");
        setButtonText2("Log in");
      });
  };

  useEffect(() => {
    const refreshToken = localStorage.getItem("azionRefreshToken");
    const accessToken = localStorage.getItem("azionAccessToken");

    if (refreshToken && accessToken) {
      const data = { refreshToken, accessToken };
      sessionCheck(data);
    } else if (!accessToken && !refreshToken) {
      setButtonText1("Register");
      setButtonText2("Log in");
    }
  }, []);

  return (
    <div className="h-screen w-full overflow-x-hidden">
      <div>
        <Navbar />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -400 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className=" w-screen flex flex-col sm:flex-row gap-24 justify-center items-center sm:justify-center sm:items-center px-6 lg:px-36 py-10 lg:py-36 "
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-2xl mt-10 gap-8 text-left  w-full"
        >
          <h1
            className={`text-4xl max-w-md md:max-w-none gradient-text md:text-5xl lg:text-6xl ${HeaderText.className}`}
          >
            Improve your workflow and secure your company with{" "}
          </h1>
          <span
            className={` neon-text text-7xl md:text-8xl lg:text-8xl ${azionText.className}`}
          >
            Azion
          </span>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row justify-start items-start gap-4 md:gap-8 mt-8 md:mt-12 lg:mt-16 w-full"
          >
            <Link href="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={` neon-text w-64 md:w-80 lg:w-80 h-12 md:h-14 lg:h-14 bg-[#18b7be] rounded-2xl text-lg md:text-xl lg:text-xl hover:bg-[#139299] ${HeaderText.className}`}
              >
                {ButtonText1}
              </motion.button>
            </Link>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={` neon-text w-64 md:w-80 lg:w-80 h-12 md:h-14 lg:h-14 bg-[#072a40] rounded-2xl text-lg md:text-xl lg:text-xl hover:bg-[#106092] ${HeaderText.className}`}
            >
              {ButtonText2}
            </motion.button>
          </motion.div>
        </motion.div>
        {/* Image Section */}
        <div className="h-fit w-fit ">
          <Image
            src={background.src}
            alt="Azion background"
            width={1100}
            height={800}
          ></Image>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
