"use client"
import {motion} from "framer-motion"
import type React from "react"
import Link from "next/link"
import {ArrowUp, Github, Instagram, Mail, Phone, Twitter} from "lucide-react"
import {Space_Grotesk} from "next/font/google"
import logo from "@/public/white-logo-small.png";
import Image from "next/image";

const spaceGrotesk = Space_Grotesk({subsets: ["latin"], display: "swap"})

export default function Footer() {
    const currentYear = new Date().getFullYear()

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        })
    }

    return (
        <footer
            className="relative bg-black/40 backdrop-blur-sm border-t border-gray-800/30 text-white pt-12 pb-6 overflow-hidden">
            {/* Scroll to top button - simplified */}
            <div className="absolute right-6 top-4">
                <motion.button
                    onClick={scrollToTop}
                    whileHover={{y: -2}}
                    whileTap={{scale: 0.95}}
                    className="w-8 h-8 rounded-md bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center shadow-sm"
                    aria-label="Scroll to top"
                >
                    <ArrowUp size={16} className="text-white"/>
                </motion.button>
            </div>

            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <motion.div
                        initial={{opacity: 0, y: 10}}
                        whileInView={{opacity: 1, y: 0}}
                        transition={{duration: 0.5}}
                        viewport={{once: true}}
                        className="md:col-span-2"
                    >
                        <Link href="/" className="inline-block mb-4 group">
                            <div className="flex items-center">
                                <div className="w-8 h-8 relative mr-2 overflow-hidden">
                                    <div
                                        className="absolute inset-0 bg-gradient-to-br -z-20 from-cyan-400 to-blue-600 rounded-md opacity-80 group-hover:opacity-100 transition-opacity"></div>
                                    <Image src={logo.src} alt={"Azion Logo"} width={50} height={50}/>
                                </div>
                                <span
                                    className={`text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent group-hover:from-cyan-300 group-hover:to-blue-400 transition-all duration-300 ${spaceGrotesk.className}`}
                                >
                  Azion
                </span>
                            </div>
                        </Link>
                        <p className="text-gray-400 mb-4 max-w-md text-sm">
                            AzionOnline provides a comprehensive suite of tools to enhance your organization&apos;s
                            productivity
                            and security.
                            Our platform helps you improve workflow and secure your company with cutting-edge
                            technology.
                        </p>
                        <div className="flex space-x-3">
                            <SocialIcon href="https://twitter.com/AzionOnline" icon={<Twitter size={16}/>}/>
                            <SocialIcon href="https://www.instagram.com/aziononlineteam" icon={<Instagram size={16}/>}/>
                            <SocialIcon href="https://github.com/Maximus019BG/Azion/tree/master"
                                        icon={<Github size={16}/>}/>
                        </div>
                    </motion.div>

                    {/* Quick Links */}
                    <motion.div
                        initial={{opacity: 0, y: 10}}
                        whileInView={{opacity: 1, y: 0}}
                        transition={{duration: 0.5, delay: 0.1}}
                        viewport={{once: true}}
                    >
                        <h3 className={`text-sm font-semibold mb-3 text-white ${spaceGrotesk.className}`}>Quick
                            Links</h3>
                        <ul className="space-y-2">
                            <FooterLink href="#features">Features</FooterLink>
                            <FooterLink href="#security">Security</FooterLink>
                            <FooterLink href="#testimonials">Testimonials</FooterLink>
                            <FooterLink href="#pricing">Pricing</FooterLink>
                        </ul>
                    </motion.div>

                    {/* Contact */}
                    <motion.div
                        initial={{opacity: 0, y: 10}}
                        whileInView={{opacity: 1, y: 0}}
                        transition={{duration: 0.5, delay: 0.2}}
                        viewport={{once: true}}
                    >
                        <h3 className={`text-sm font-semibold mb-3 text-white ${spaceGrotesk.className}`}>Contact
                            Us</h3>
                        <ul className="space-y-2">
                            <li className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors text-xs">
                                <Phone size={14} className="text-cyan-500"/>
                                <a href="tel:+359 88 503 1865">+359 88 503 1865</a>
                            </li>
                            <li className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors text-xs">
                                <Mail size={14} className="text-cyan-500"/>
                                <a href="mailto:aziononlineteam@gmail.com">aziononlineteam@gmail.com</a>
                            </li>
                        </ul>
                    </motion.div>
                </div>

                {/* Copyright */}
                <div
                    className="mt-8 pt-4 border-t border-gray-800/30 flex flex-col md:flex-row justify-center items-center text-xs text-gray-500">
                    <p>© {currentYear} AzionOnline. All rights reserved.</p>
                    {/*<div className="mt-3 md:mt-0 flex gap-4">*/}
                    {/*    <Link href="/privacy" className="hover:text-cyan-400 transition-colors">*/}
                    {/*        Privacy Policy*/}
                    {/*    </Link>*/}
                    {/*    <Link href="/terms" className="hover:text-cyan-400 transition-colors">*/}
                    {/*        Terms of Service*/}
                    {/*    </Link>*/}
                    {/*</div>*/}
                </div>
            </div>
        </footer>
    )
}

interface FooterLinkProps {
    href: string
    children: React.ReactNode
}

function FooterLink({href, children}: FooterLinkProps) {
    return (
        <li>
            <Link
                href={href}
                className={`text-gray-400 hover:text-cyan-400 transition-colors inline-block py-1 relative text-xs ${spaceGrotesk.className}`}
            >
                {children}
            </Link>
        </li>
    )
}

interface SocialIconProps {
    href: string
    icon: React.ReactNode
}

function SocialIcon({href, icon}: SocialIconProps) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="w-7 h-7 rounded-md bg-gray-800/50 hover:bg-gray-700/50 flex items-center justify-center text-gray-300 hover:text-white transition-colors hover:scale-105 transform duration-200"
            aria-label={`Visit our ${href.split("/").pop()} page`}
        >
            {icon}
        </a>
    )
}
