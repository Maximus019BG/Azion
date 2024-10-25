"use client";
import {motion, useScroll, useTransform, Variants} from "framer-motion";
import {useRef} from "react";
import {Poppins} from "next/font/google";
import Image from "next/image";

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
}

function MockupWindow({rotateValue, src}: MockupWindowProps) {
    return (
        <motion.div
            className="w-[40vw] h-[65vh] mockup-window bg-base-300 border"
            initial="offscreen"
            whileInView="onscreen"
            viewport={{once: true, amount: 0.8}}
            variants={cardVariants(rotateValue)}
        >
            <div className="relative w-full h-full bg-base-200 flex justify-center items-center border-2">
                <div className="relative w-full h-full"> {/* Added wrapper div */}
                    <Image
                        src={src}
                        alt="Mockup"
                        fill // This makes the image fill the container
                        className="object-cover"
                    />
                </div>
            </div>
        </motion.div>
    );
}

const HorizontalScrollCarousel = () => {
    const targetRef = useRef<HTMLDivElement | null>(null);
    const {scrollYProgress} = useScroll({
        target: targetRef,
    });

    const x = useTransform(scrollYProgress, [0, 1], ["5%", "-95%"]);

    const rotateValues = [5, -5, 10, -10]; // Different rotate values
    const imageSources = [
        {src: "/Dashboard.png"},
        {src: "/Org.png"},
        {src: "/Task.png"},
        {src: "/Account.png"},
    ]; // Different image sources

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
                            <span className="gradient-text">Azion secures every part</span>{" "}
                            <br/> of your account and <br/> organisation&apos;s account
                        </h1>

                        <div className="w-full h-full flex justify-center items-center gap-44">
                            {imageSources.map((image, index) => (
                                <MockupWindow
                                    key={index}
                                    rotateValue={rotateValues[index]}
                                    src={image.src}
                                />
                            ))}
                        </div>
                    </div>
                    <motion.div
                        initial="offscreen"
                        whileInView="onscreen"
                        viewport={{once: true, amount: 0.8}}
                        transition={{delay: 1, duration: 1}}
                        className=""
                    ></motion.div>
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
