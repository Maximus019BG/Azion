"use client";
import { motion, useTransform, useScroll, Variants } from "framer-motion";
import { useRef } from "react";
import { Poppins } from "next/font/google";

const HeaderText = Poppins({ subsets: ["latin"], weight: "600" });

interface Props {
  emoji: string;
  hueA: number;
  hueB: number;
}

const cardVariants: Variants = {
  offscreen: {
    y: 300,
  },
  onscreen: {
    y: 50,
    rotate: -10,
    transition: {
      type: "spring",
      bounce: 0.6,
      duration: 1.2,
    },
  },
};

const hue = (h: number) => `hsl(${h}, 100%, 50%)`;

function Card({ emoji, hueA, hueB }: Props) {
  const background = `linear-gradient(306deg, ${hue(hueA)}, ${hue(hueB)})`;

  return (
    <motion.div
      className="overflow-hidden flex items-center justify-center relative pt-5 mb-[-30px]"
      initial="offscreen"
      whileInView="onscreen"
      viewport={{ once: true, amount: 0.8 }}
    >
      <div
        className="absolute bottom-0 left-0 right-0 top-0"
        style={{
          clipPath:
            "path('M 0 303.5 C 0 292.454 8.995 285.101 20 283.5 L 460 219.5 C 470.085 218.033 480 228.454 480 239.5 L 500 430 C 500 441.046 491.046 450 480 450 L 20 450 C 8.954 450 0 441.046 0 430 Z')",
        }}
      />
      <motion.div
        className="text-[164px] w-[300px] h-[430px] flex items-center justify-center bg-white rounded-[20px] shadow-[0_0_1px_hsl(0deg_0%_0%_/_0.075),_0_0_2px_hsl(0deg_0%_0%_/_0.075),_0_0_4px_hsl(0deg_0%_0%_/_0.075),_0_0_8px_hsl(0deg_0%_0%_/_0.075),_0_0_16px_hsl(0deg_0%_0%_/_0.075)] origin-[10%_60%]"
        variants={cardVariants}
      >
        {emoji}
      </motion.div>
    </motion.div>
  );
}

const HorizontalScrollCarousel = () => {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  const x = useTransform(scrollYProgress, [0, 1], ["5%", "-95%"]);

  return (
    <section ref={targetRef} className="relative h-[300vh] bg-[#060610]">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <motion.div
          style={{ x }}
          className="flex justify-center items-center gap-48"
        >
          <div className=" w-full flex justify-center items-center gap-[30vw]">
            <h1
              className={`${HeaderText.className} text-5xl min-w-max uppercase leading-snug`}
            >
              <span className="gradient-text">Azion secures every part</span>{" "}
              <br /> of your account and <br /> organisation's account
            </h1>
            <div className=" flex justify-center items-center gap-44">
              {food.map(([emoji, hueA, hueB]) => (
                <Card key={emoji} emoji={emoji} hueA={hueA} hueB={hueB} />
              ))}
            </div>
          </div>
          <motion.div
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ once: true, amount: 0.8 }}
            transition={{ delay: 1, duration: 1 }}
            className=""
          ></motion.div>
        </motion.div>
      </div>
    </section>
  );
};

const food: [string, number, number][] = [
  ["🍅", 340, 10],
  ["🍊", 20, 40],
  ["🍋", 60, 90],
  ["🍐", 80, 120],
];

const Main_Services = () => {
  return (
    <div className="w-full h-full">
      <HorizontalScrollCarousel />
    </div>
  );
};

export default Main_Services;
