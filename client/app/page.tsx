"use client"
import {useEffect, useRef, useState} from "react"
import {motion, useScroll, useTransform} from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import {Inter, Space_Grotesk} from "next/font/google"
import Cookies from "js-cookie"
import {ArrowRight, BarChart3, Calendar, Check, ChevronRight, Lock, Shield, Star, Users, Zap} from "lucide-react"
import Navbar from "@/app/components/Navbar"
import Footer from "@/app/components/Footer"
import BackgroundGrid from "@/components/background-grid"
import {AnimatedText} from "@/components/ui/animated-text"
import {SectionHeading} from "@/components/ui/section-heading"
import {FeatureCard} from "@/components/ui/feature-card"
import {TestimonialCard} from "@/components/ui/testimonial-card"
import {AnimatedGradientBorder} from "@/components/ui/animated-gradient-border"
import DecorativeSVG from "@/components/decorative-svg";
import FloatingIcons from "@/components/floating-icons";
import axios from "axios";
import {apiUrl} from "@/app/api/config";
import {FaqAccordion} from "@/components/ui/faq-accordion";
import Pricing from "@/app/components/stripe/Pricing-landing";

const getOrgName = async () => {
    if (Cookies.get("azionAccessToken")) {
        const data = {accessToken: Cookies.get("azionAccessToken")};
        const response = await axios.post(`${apiUrl}/org/partOfOrg`, data, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        return response.status === 200;
    } else {
        return false;
    }
}

const inter = Inter({subsets: ["latin"], display: "swap"})
const spaceGrotesk = Space_Grotesk({subsets: ["latin"], display: "swap"})

export default function LandingPage() {
    const [buttonText1, setButtonText1] = useState("Register")
    const [buttonText2, setButtonText2] = useState("Login")
    const [hasOrg, setHasOrg] = useState<boolean>(false)
    const {scrollYProgress} = useScroll()
    const opacity = useTransform(scrollYProgress, [0, 0.05], [1, 0])
    const scale = useTransform(scrollYProgress, [0, 0.05], [1, 0.98])
    const heroRef = useRef<HTMLDivElement>(null)

    // SVG data for the floating icons component - reduced quantity and opacity
    const svgData = [
        {src: "/Artboard2.svg", position: "left-[5vw] top-[15vh]", delay: 0, opacity: 0.2, scale: 0.8},
        {src: "/Artboard3.svg", position: "right-[10vw] top-[10vh]", delay: 0.5, opacity: 0.15},
        {src: "/Artboard5.svg", position: "right-[8vw] top-[50vh]", delay: 1.5, opacity: 0.15, scale: 0.7},
        {src: "/Artboard7.svg", position: "right-[15vw] top-[25vh]", delay: 2.5, opacity: 0.2},
    ]

    const svgDataMobile = [
        {src: "/Artboard2.svg", position: "left-[5vw] top-[10vh]", delay: 0, opacity: 0.15, scale: 0.6},
        {src: "/Artboard5.svg", position: "right-[8vw] top-[35vh]", delay: 1.5, opacity: 0.15, scale: 0.5},
    ]

    useEffect(() => {
        // Check authentication status
        const refreshToken = Cookies.get("azionRefreshToken")
        const accessToken = Cookies.get("azionAccessToken")
        if (refreshToken && accessToken) {
            setButtonText1("Dashboard")
            setButtonText2("Organizations")
        }

        // Fetch organization name
        const fetchOrgName = async () => {
            const result: boolean = await getOrgName()
            setHasOrg(result)
        }

        fetchOrgName()
    }, [])

    return (
        <div className={`relative min-h-screen bg-black text-white ${inter.className} overflow-hidden`}>
            {/* Background Elements */}
            <BackgroundGrid/>

            {/* Navbar */}
            <Navbar/>

            {/* Hero Section */}
            <section ref={heroRef} className="relative min-h-screen flex items-center pt-20 overflow-hidden">
                {/* Floating SVG Icons */}
                <FloatingIcons svgData={svgData} svgDataMobile={svgDataMobile}/>

                {/* Hero Content */}
                <div className="container mx-auto px-4 relative z-10 py-20 md:py-32">
                    <div className="max-w-5xl mx-auto">
                        <motion.div style={{opacity, scale}} className="text-center mb-12 relative">
                            {/* Enhanced background glow effects */}
                            <div
                                className="absolute -top-20 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full blur-[150px] opacity-60"/>
                            <div
                                className="absolute top-40 left-1/4 w-[300px] h-[300px] bg-gradient-to-r from-purple-600/10 to-pink-500/10 rounded-full blur-[80px] opacity-40 animate-pulse"
                                style={{animationDuration: "8s"}}
                            />
                            <div
                                className="absolute top-60 right-1/4 w-[250px] h-[250px] bg-gradient-to-r from-blue-600/10 to-cyan-400/10 rounded-full blur-[80px] opacity-40 animate-pulse"
                                style={{animationDuration: "10s", animationDelay: "1s"}}
                            />

                            <motion.div
                                initial={{opacity: 0, y: 20}}
                                animate={{opacity: 1, y: 0}}
                                transition={{duration: 0.8, delay: 0.2}}
                                className="relative"
                            >
                <span
                    className="inline-block px-5 py-2 rounded-full bg-gradient-to-r from-gray-900 to-gray-800 text-gray-300 text-sm mb-8 border border-gray-800/80 shadow-lg shadow-black/20 backdrop-blur-sm">
                  <span className="inline-block w-2 h-2 rounded-full bg-cyan-500 mr-2 animate-pulse"></span>
                  Secure your organization with Azion
                </span>
                            </motion.div>

                            <h1
                                className={`text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-8 tracking-tight ${spaceGrotesk.className}`}
                            >
                                <AnimatedText
                                    text={["Improve your workflow", "and secure your company", "with"]}
                                    className="inline-block bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
                                />
                                <span
                                    className="block mt-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Azion
                </span>
                            </h1>

                            <motion.p
                                initial={{opacity: 0}}
                                animate={{opacity: 1}}
                                transition={{duration: 0.8, delay: 1.2}}
                                className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed font-light"
                            >
                                <span className="font-medium text-white">Secure, efficient, and powerful tools</span> to
                                enhance your
                                organization&apos;s productivity with{" "}
                                <span className="font-medium text-cyan-300">enterprise-grade security</span> and
                                seamless integration.
                            </motion.p>

                            <motion.div
                                initial={{opacity: 0, y: 20}}
                                animate={{opacity: 1, y: 0}}
                                transition={{duration: 0.5, delay: 1.4}}
                                className="flex flex-col sm:flex-row gap-6 justify-center"
                            >
                                <Link href={hasOrg ? `/dashboard` : `/register`} className="w-full sm:w-auto">
                                    <motion.button
                                        whileHover={{scale: 1.03}}
                                        whileTap={{scale: 0.97}}
                                        className="w-full sm:w-auto px-10 py-2 rounded-xl text-white font-semibold text-lg transition-all bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 backdrop-blur-sm flex justify-center items-center"
                                    >
                                        {buttonText1}
                                        <ChevronRight size={16}/>
                                    </motion.button>
                                </Link>


                                <Link href={hasOrg ? `/organizations` : `/login`}>
                                    <motion.button
                                        whileHover={{
                                            scale: 1.03,
                                            backgroundColor: "rgba(255,255,255,0.08)",
                                            borderColor: "rgba(14, 165, 233, 0.5)",
                                        }}
                                        whileTap={{scale: 0.98}}
                                        className="w-full sm:w-auto px-10 py-2 rounded-xl text-white font-semibold text-lg border border-gray-700 hover:border-cyan-500/50 transition-all backdrop-blur-sm"
                                    >
                                        {buttonText2}
                                    </motion.button>
                                </Link>
                            </motion.div>
                        </motion.div>

                        {/* Dashboard Preview with enhanced presentation */}
                        <motion.div
                            initial={{opacity: 0, y: 100}}
                            animate={{opacity: 1, y: 0}}
                            transition={{duration: 0.8, delay: 0.8}}
                            className="relative mt-16 md:mt-24"
                        >
                            <AnimatedGradientBorder className="rounded-xl p-2 md:p-3">
                                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg">
                                    <Image
                                        src="/Dashboard.png"
                                        alt="Azion Dashboard"
                                        width={1200}
                                        height={675}
                                        className="w-full h-full object-cover rounded-lg"
                                        priority
                                    />
                                    <div
                                        className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

                                    {/* Dashboard SVG Overlays */}
                                    <motion.div
                                        initial={{opacity: 0}}
                                        animate={{opacity: 1}}
                                        transition={{delay: 1.5, duration: 0.8}}
                                        className="absolute top-4 right-4 w-16 h-16 md:w-24 md:h-24"
                                    >
                                        <Image
                                            src="/Artboard7.svg"
                                            alt="Analytics icon"
                                            width={100}
                                            height={100}
                                            className="w-full h-full opacity-40"
                                        />
                                    </motion.div>

                                    <motion.div
                                        initial={{opacity: 0}}
                                        animate={{opacity: 1}}
                                        transition={{delay: 1.7, duration: 0.8}}
                                        className="absolute bottom-16 left-8 w-12 h-12 md:w-20 md:h-20"
                                    >
                                        <Image
                                            src="/Artboard3.svg"
                                            alt="Data visualization"
                                            width={80}
                                            height={80}
                                            className="w-full h-full opacity-30"
                                        />
                                    </motion.div>

                                    <motion.div
                                        initial={{opacity: 0}}
                                        animate={{opacity: 1}}
                                        transition={{delay: 1.9, duration: 0.8}}
                                        className="absolute top-1/4 left-1/4 w-14 h-14 md:w-16 md:h-16"
                                    >
                                        <Image
                                            src="/Artboard8.svg"
                                            alt="Task management"
                                            width={80}
                                            height={80}
                                            className="w-full h-full opacity-25"
                                        />
                                    </motion.div>

                                    {/* Feature highlights */}
                                    <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2 md:gap-3">
                    <span
                        className="px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-xs text-cyan-300 border border-cyan-500/30">
                      Real-time Analytics
                    </span>
                                        <span
                                            className="px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-xs text-blue-300 border border-blue-500/30">
                      Task Management
                    </span>
                                        <span
                                            className="px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-xs text-purple-300 border border-purple-500/30">
                      Security Controls
                    </span>
                                    </div>
                                </div>
                            </AnimatedGradientBorder>
                        </motion.div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    className="absolute bottom-5 left-1/2 transform -translate-x-1/2"
                    animate={{y: [0, 10, 0]}}
                    transition={{duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut"}}
                >
                    <div className="w-8 h-12 rounded-full border border-gray-700 flex justify-center">
                        <motion.div
                            className="w-1.5 h-1.5 bg-cyan-500 rounded-full mt-2"
                            animate={{y: [0, 16, 0]}}
                            transition={{duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut"}}
                        />
                    </div>
                </motion.div>

                {/* Decorative SVGs */}
                <DecorativeSVG
                    src="/Artboard6.svg"
                    className="absolute -left-20 bottom-10 w-40 h-40 opacity-20 hidden lg:block"
                    rotate={15}
                />
                <DecorativeSVG
                    src="/Artboard7.svg"
                    className="absolute -right-20 bottom-40 w-40 h-40 opacity-20 hidden lg:block"
                    rotate={-15}
                />
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 md:py-32 relative">
                <div
                    className="absolute inset-0 bg-gradient-to-b from-black/0 via-blue-950/5 to-black/0 pointer-events-none"></div>

                <SectionHeading
                    title="Powerful Features"
                    subtitle="Azion provides a comprehensive suite of tools to enhance your organization's productivity and security"
                    titleClassName={`bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent ${spaceGrotesk.className}`}
                    badge="What We Offer"
                />

                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        <FeatureCard
                            icon={<BarChart3 size={24}/>}
                            title="Advanced Dashboard"
                            description="Get a comprehensive view of your organization's data with our intuitive dashboard. Monitor performance and make informed decisions."
                            index={0}
                            link="/features/dashboard"
                        />
                        <FeatureCard
                            icon={<Users size={24}/>}
                            title="Organization Management"
                            description="Seamlessly collaborate with other organizations. Find and connect with any organization registered in Azion."
                            index={1}
                            link="/features/organizations"
                        />
                        <FeatureCard
                            icon={<Calendar size={24}/>}
                            title="Task Management"
                            description="Create, control, and delete tasks with ease. Our task management system helps you stay organized and productive."
                            index={2}
                            link="/features/tasks"
                        />
                        <FeatureCard
                            icon={<Shield size={24}/>}
                            title="Cyber Security"
                            description="Protect your data with our advanced security features including MFA, OTP, and more to keep your account safe."
                            index={3}
                            link="/features/security"
                        />
                        <FeatureCard
                            icon={<Zap size={24}/>}
                            title="Performance Analytics"
                            description="Track and analyze your organization's performance with detailed analytics and customizable reports."
                            index={4}
                            link="/features/analytics"
                        />
                        <FeatureCard
                            icon={<Lock size={24}/>}
                            title="Secure Access Control"
                            description="Manage user permissions and access controls with granular settings to ensure data security."
                            index={5}
                            link="/features/access-control"
                        />
                    </div>

                    {/* Feature comparison link - simplified */}
                    <div className="mt-16 text-center">
                        <Link href="/features">
                            <motion.button
                                whileHover={{y: -2}}
                                whileTap={{scale: 0.98}}
                                className="inline-flex items-center gap-2 px-6 py-2 bg-gray-900/40 hover:bg-gray-900/60 rounded-lg border border-gray-800 text-gray-300 hover:text-white transition-all"
                            >
                                Compare all features
                                <ChevronRight size={16}/>
                            </motion.button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Security Section */}
            <section id="security" className="py-20 md:py-32 relative bg-gradient-to-b from-transparent to-gray-900/10">
                <div className="container mx-auto px-4">
                    <SectionHeading
                        title="Enterprise-Grade Security"
                        subtitle="Azion secures every part of your account and organization with comprehensive security features"
                        titleClassName={`bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent ${spaceGrotesk.className}`}
                        badge="Security First"
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{opacity: 0, x: -30}}
                            whileInView={{opacity: 1, x: 0}}
                            transition={{duration: 0.6}}
                            viewport={{once: true}}
                            className="order-2 lg:order-1"
                        >
                            <h3 className={`text-2xl md:text-3xl font-bold mb-6 ${spaceGrotesk.className}`}>
                                Multi-layered Protection
                            </h3>
                            <p className="text-gray-400 mb-8 leading-relaxed">
                                Our security system is designed with multiple layers of protection to ensure your data
                                remains safe from
                                unauthorized access and cyber threats.
                            </p>

                            <div className="space-y-4">
                                {[
                                    "Multi-factor Authentication (MFA)",
                                    "One-time Password (OTP) verification",
                                    "End-to-end encryption for all data",
                                    "Regular security audits and updates",
                                    "Advanced threat detection and prevention",
                                    "Compliance with global security standards",
                                ].map((feature, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{opacity: 0, y: 10}}
                                        whileInView={{opacity: 1, y: 0}}
                                        transition={{duration: 0.4, delay: index * 0.1}}
                                        viewport={{once: true}}
                                        className="flex items-start gap-3"
                                    >
                                        <div
                                            className="mt-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full p-1">
                                            <Check size={12} className="text-white"/>
                                        </div>
                                        <span className="text-gray-300 text-sm">{feature}</span>
                                    </motion.div>
                                ))}
                            </div>

                            <motion.div
                                initial={{opacity: 0, y: 10}}
                                whileInView={{opacity: 1, y: 0}}
                                transition={{duration: 0.5, delay: 0.6}}
                                viewport={{once: true}}
                                className="mt-8"
                            >
                                <Link href="/security">
                                    <motion.button
                                        whileHover={{x: 3}}
                                        className="text-cyan-400 flex items-center gap-2 font-medium text-sm"
                                    >
                                        Learn more about our security features <ArrowRight size={14}/>
                                    </motion.button>
                                </Link>
                            </motion.div>
                        </motion.div>

                        <motion.div
                            initial={{opacity: 0, x: 30}}
                            whileInView={{opacity: 1, x: 0}}
                            transition={{duration: 0.6}}
                            viewport={{once: true}}
                            className="order-1 lg:order-2 relative"
                        >
                            <div className="rounded-xl overflow-hidden border border-gray-800/50">
                                <div className="relative aspect-[4/3] w-full overflow-hidden">
                                    <Image
                                        src="/Account.png"
                                        alt="Security Features"
                                        width={800}
                                        height={600}
                                        className="w-full h-full object-cover"
                                    />
                                    <div
                                        className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

                                    {/* Simplified security SVG overlay - just one subtle element */}
                                    <motion.div
                                        initial={{opacity: 0, y: 10}}
                                        whileInView={{opacity: 1, y: 0}}
                                        transition={{delay: 0.3, duration: 0.8}}
                                        viewport={{once: true}}
                                        className="absolute top-6 right-6 w-16 h-16 md:w-20 md:h-20"
                                    >
                                        <Image
                                            src="/Artboard5.svg"
                                            alt="Security shield"
                                            width={100}
                                            height={100}
                                            className="w-full h-full opacity-15"
                                        />
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="py-20 md:py-32 relative">
                <SectionHeading
                    title="What Our Clients Say"
                    subtitle="Trusted by organizations worldwide to improve workflow and security"
                    titleClassName={spaceGrotesk.className}
                    badge="Testimonials"
                />

                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        <TestimonialCard
                            quote="Azion has transformed how we manage our organization's security. The multi-factor authentication and task management features are game-changers for our team."
                            author="Sarah Johnson"
                            role="CTO, TechVision Inc."
                            index={0}
                            companyLogo="/placeholder.svg?height=32&width=120"
                        />
                        <TestimonialCard
                            quote="The dashboard analytics provide invaluable insights into our organization's performance. We've been able to optimize our workflow and increase productivity by 30%."
                            author="Michael Chen"
                            role="Operations Director, Nexus Group"
                            index={1}
                            companyLogo="/placeholder.svg?height=32&width=120"
                        />
                        <TestimonialCard
                            quote="Implementing Azion was the best decision we made for our company's security infrastructure. The seamless integration and user-friendly interface made adoption across our team effortless."
                            author="Elena Rodriguez"
                            role="Security Manager, GlobalSecure"
                            index={2}
                            companyLogo="/placeholder.svg?height=32&width=120"
                        />
                    </div>
                </div>
            </section>

            {/* Stats Section - simplified */}
            <section className="py-16 md:py-24 relative">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        {[
                            {value: "99.9%", label: "Uptime", icon: <Star className="text-yellow-400" size={18}/>},
                            {value: "10k+", label: "Users", icon: <Users className="text-cyan-400" size={18}/>},
                            {value: "24/7", label: "Support", icon: <Shield className="text-blue-400" size={18}/>},
                            {value: "50+", label: "Countries", icon: <Zap className="text-purple-400" size={18}/>},
                        ].map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{opacity: 0, y: 10}}
                                whileInView={{opacity: 1, y: 0}}
                                transition={{duration: 0.5, delay: index * 0.1}}
                                viewport={{once: true}}
                                className="bg-gray-900/20 border border-gray-800/50 rounded-lg p-4 md:p-5 text-center"
                            >
                                <div className="flex justify-center mb-2">{stat.icon}</div>
                                <div
                                    className={`text-2xl md:text-3xl font-bold mb-1 ${spaceGrotesk.className}`}>{stat.value}</div>
                                <div className="text-gray-400 text-xs">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing"
                     className="py-20 md:py-32 relative flex flex-col justify-center items-center bg-gradient-to-b from-transparent to-gray-900/10">
                <SectionHeading
                    title="Simple, Transparent Pricing"
                    subtitle="Choose the plan that fits your organization's needs"
                    titleClassName={spaceGrotesk.className}
                    badge="Pricing"
                />

                <div className="flex flex-col justify-center items-center container mx-auto px-4">

                    <Pricing/>

                    {/* Pricing FAQ - simplified */}
                    <div className="mt-20 w-full">
                        <FaqAccordion
                            items={[
                                {
                                    question: "Can I change my plan later?",
                                    answer:
                                        "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.",
                                },
                                {
                                    question: 'What does "per user / month" mean?',
                                    answer:
                                        "This means that you pay a monthly fee for each user. For example, if you buy Pro plan for $10 per user/month and you have 3 users, you'll pay $30 per month.",
                                },
                                {
                                    question: "What are Azion Cameras?",
                                    answer:
                                        "Azion Cameras are our access control cameras that allow you to monitor and control the access to a certain room.",
                                },
                                {
                                    question: "How can I personalize my roles?",
                                    answer:
                                        "Azion provides full control over the roles and permissions of your employees. You can create as many roles as you want and to give whatever access you want. Also you can categorize the roles with colors.",
                                },
                                {
                                    question: "What is the difference between basic and advanced security features?",
                                    answer:
                                        "Basic security features are Password and session monitoring. Advanced security features is MFA with Time-based one-time password and Face Recognition.",
                                },
                            ]}
                            className="max-w-3xl mx-auto"
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section - simplified */}
            <section className="py-20 md:py-32 relative">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{opacity: 0, y: 20}}
                        whileInView={{opacity: 1, y: 0}}
                        transition={{duration: 0.6}}
                        viewport={{once: true}}
                        className="max-w-4xl mx-auto"
                    >
                        <div className="bg-gray-900/30 rounded-lg p-8 md:p-10 border border-gray-800/50">
                            <div className="text-center mb-8">
                                <motion.div
                                    initial={{opacity: 0, scale: 0.9}}
                                    whileInView={{opacity: 1, scale: 1}}
                                    transition={{duration: 0.5}}
                                    viewport={{once: true}}
                                    className="w-12 h-12 mx-auto mb-6 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center shadow-sm"
                                >
                                    <Shield size={20} className="text-white"/>
                                </motion.div>

                                <h2
                                    className={`text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent ${spaceGrotesk.className}`}
                                >
                                    Ready to secure your organization?
                                </h2>
                                <p className="text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed text-sm">
                                    Join thousands of organizations that trust Azion to improve your workflow and
                                    security.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href="/register" className="w-full sm:w-auto">
                                    <motion.button
                                        whileHover={{scale: 1.02}}
                                        whileTap={{scale: 0.98}}
                                        className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        Get Started Now
                                        <ChevronRight size={16}/>
                                    </motion.button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <Footer/>
        </div>
    )
}
