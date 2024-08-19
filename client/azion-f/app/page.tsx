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
import Main_Services from "./components/main-services";
import Footer from "./components/Footer";

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
          setButtonText1(" Dashboard");
          setButtonText2(" Organizations");
        } else {
          setButtonText1("Dashboard");
          setButtonText2("Organizations ");
        }
      })
      .catch((error) => {
        setButtonText1("Register");
        setButtonText2("Log-in");
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
      setButtonText2("Log-in");
    }
  }, []);

  return (
    <div className="h-screen w-full overflow-x-hidden">
      <Navbar />
      <motion.div
        initial={{ opacity: 0, y: -400 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className=" w-screen flex flex-col md:flex-row gap-36 justify-center items-center px-6 lg:px-36 py-10 lg:py-28 "
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-5xl mt-20 flex flex-col justify-center items-center gap-8 text-center w-full"
        >
          <h1
            className={`text-3xl gradient-text md:text-4xl lg:text-6xl ${HeaderText.className}`}
          >
            Improve your workflow and secure your company with{" "}
            <span
              className={` neon-text text-5xl md:text-6xl lg:text-8xl ${azionText.className}`}
            >
              Azion.
            </span>
          </h1>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row justify-center items-start gap-4 md:gap-8 mt-8 md:mt-12 lg:mt-16 w-full"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={` neon-text w-40 md:w-64 lg:w-80 h-10 md:h-12 lg:h-14 bg-[#18b7be] rounded-2xl text-base md:text-lg lg:text-xl hover:bg-[#139299] ${HeaderText.className}`}
            >
              <Link href={`/${ButtonText1.toLowerCase()}`}>{ButtonText1}</Link>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={` neon-text w-40 md:w-64 lg:w-80 h-10 md:h-12 lg:h-14 bg-[#072a40] rounded-2xl text-base md:text-lg lg:text-xl hover:bg-[#106092] ${HeaderText.className}`}
            >
              <Link href={`/${ButtonText2.toLowerCase()}`}>{ButtonText2}</Link>
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>

      <div className=" flex flex-col justify-center items-center mt-48">
        <Main_Services />
      </div>
      <Footer />
    </div>
  );
};

export default Home;
