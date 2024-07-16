"use client";
import { motion } from "framer-motion";
import Navbar from "./components/Navbar";
import { Commissioner, Poppins } from "next/font/google";

const azionText = Commissioner({ subsets: ["latin"], weight: "800" });
const HeaderText = Poppins({ subsets: ["latin"], weight: "600" });

const Home = () => {
  return (
    <div className="h-[500vh] w-full overflow-x-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col justify-center items-center lg:items-start px-6 lg:px-56 py-10 lg:py-28 w-full"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-2xl mt-10 gap-8 text-center lg:text-left w-full"
        >
          <h1 className={`text-3xl gradient-text md:text-4xl lg:text-6xl ${HeaderText.className}`}>
            Improve your workflow and secure your company with{" "}
          </h1>
          <span className={` neon-text text-4xl md:text-6xl lg:text-8xl ${azionText.className}`}>
              Azion
            </span>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 md:gap-8 mt-8 md:mt-12 lg:mt-16 w-full"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={` neon-text w-40 md:w-64 lg:w-80 h-10 md:h-12 lg:h-14 bg-[#18b7be] rounded-2xl text-base md:text-lg lg:text-xl hover:bg-[#139299] ${HeaderText.className}`}
            >
              Register
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={` neon-text w-40 md:w-64 lg:w-80 h-10 md:h-12 lg:h-14 bg-[#072a40] rounded-2xl text-base md:text-lg lg:text-xl hover:bg-[#106092] ${HeaderText.className}`}
            >
              Continue
            </motion.button>
          </motion.div>
        </motion.div>
        <Navbar />
      </motion.div>
    </div>
  );
};

export default Home;
