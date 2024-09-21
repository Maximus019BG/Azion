"use client"
import { motion, useTransform, useScroll } from "framer-motion";
import { useRef } from "react";
import { Poppins } from "next/font/google";
import Image from "next/image";


const HeaderText = Poppins({ subsets: ["latin"], weight: "600" });


const Main_Services = () => {
  return (
    <div className="w-full h-full">
      <HorizontalScrollCarousel />
    </div>
  );
};

const HorizontalScrollCarousel = () => {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  const x = useTransform(scrollYProgress, [0, 1], ["5%", "-95%"]);

  return (
    <section ref={targetRef} className="relative h-[300vh] bg-[#060610]">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <motion.div style={{ x }} className="flex justify-center items-center gap-48">
          <div>
            <h1 className={`${HeaderText.className} text-5xl max-w-3xl uppercase leading-snug`}> <span className="gradient-text">Azion secures evary part</span> of your account and organisation's account</h1>
          </div>
          {/* <div className="bg-red-500">
            <Image src="/background1.png" alt="Azion scheme" width={500} height={500} />
          </div> */}
        </motion.div>
      </div>
    </section>
  );
};

export default Main_Services;