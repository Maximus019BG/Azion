"use client"
import type React from "react"
import {useEffect, useRef, useState} from "react"
import {AnimatePresence, motion} from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import logo from "@/public/white-logo-small.png"
import {BarChart3, ChevronDown, ChevronRight, HelpCircle, Menu, Settings, Shield, Users, X} from "lucide-react"
import {cn} from "@/lib/utils/cn"
import {AnimatedGradientBorder} from "@/components/ui/animated-gradient-border"
import {Space_Grotesk} from "next/font/google"

const spaceGrotesk = Space_Grotesk({subsets: ["latin"], display: "swap"})

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }

        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setActiveDropdown(null)
            }
        }

        window.addEventListener("scroll", handleScroll)
        document.addEventListener("mousedown", handleClickOutside)

        return () => {
            window.removeEventListener("scroll", handleScroll)
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    const toggleDropdown = (name: string) => {
        setActiveDropdown(activeDropdown === name ? null : name)
    }

    return (
        <nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 md:px-8",
                scrolled
                    ? "py-3 backdrop-blur-md bg-black/70 border-b border-gray-800/50 shadow-lg shadow-black/20"
                    : "py-5 bg-transparent",
            )}
        >
            <div className="container mx-auto flex justify-between items-center">
                {/* Logo */}
                <Link href="/" className="flex items-center group">
                    <motion.div
                        className="flex items-center"
                        initial={{opacity: 0, x: -20}}
                        animate={{opacity: 1, x: 0}}
                        transition={{duration: 0.5}}
                    >
                        <div className="w-9 h-9 relative mr-2 overflow-hidden">
                            <div
                                className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg opacity-80 -z-20 "></div>
                            <Image src={logo.src} alt={"Azion Logo"} width={50} height={50}/>
                        </div>
                        <span
                            className={`text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent group-hover:from-cyan-300 group-hover:to-blue-400 transition-all duration-300 ${spaceGrotesk.className}`}
                        >
              Azion
            </span>
                    </motion.div>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-1" ref={dropdownRef}>
                    <NavItem href="#features">Features</NavItem>

                    {/* Products Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => toggleDropdown("products")}
                            className={cn(
                                "text-gray-300 hover:text-white px-4 py-2 rounded-md transition-colors relative flex items-center gap-1",
                                activeDropdown === "products" ? "text-white bg-white/5" : "",
                            )}
                        >
                            Products
                            <ChevronDown
                                size={16}
                                className={cn("transition-transform duration-200", activeDropdown === "products" ? "rotate-180" : "")}
                            />
                        </button>

                        <AnimatePresence>
                            {activeDropdown === "products" && (
                                <motion.div
                                    initial={{opacity: 0, y: 10}}
                                    animate={{opacity: 1, y: 0}}
                                    exit={{opacity: 0, y: 10}}
                                    transition={{duration: 0.2}}
                                    className="absolute top-full left-0 mt-1 w-64 bg-gray-900/90 backdrop-blur-md border border-gray-800 rounded-lg shadow-xl shadow-black/30 overflow-hidden z-50"
                                >
                                    <div className="p-2">
                                        <DropdownItem
                                            href="#dashboard"
                                            icon={<BarChart3 size={18} className="text-cyan-400"/>}
                                            title="Dashboard"
                                            description="Analytics and monitoring"
                                        />
                                        <DropdownItem
                                            href="#security"
                                            icon={<Shield size={18} className="text-blue-400"/>}
                                            title="Security"
                                            description="Enterprise-grade protection"
                                        />
                                        <DropdownItem
                                            href="#organizations"
                                            icon={<Users size={18} className="text-purple-400"/>}
                                            title="Organizations"
                                            description="Team collaboration tools"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <NavItem href="#testimonials">Testimonials</NavItem>
                    <NavItem href="#pricing">Pricing</NavItem>

                    {/* Resources Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => toggleDropdown("resources")}
                            className={cn(
                                "text-gray-300 hover:text-white px-4 py-2 rounded-md transition-colors relative flex items-center gap-1",
                                activeDropdown === "resources" ? "text-white bg-white/5" : "",
                            )}
                        >
                            Resources
                            <ChevronDown
                                size={16}
                                className={cn("transition-transform duration-200", activeDropdown === "resources" ? "rotate-180" : "")}
                            />
                        </button>

                        <AnimatePresence>
                            {activeDropdown === "resources" && (
                                <motion.div
                                    initial={{opacity: 0, y: 10}}
                                    animate={{opacity: 1, y: 0}}
                                    exit={{opacity: 0, y: 10}}
                                    transition={{duration: 0.2}}
                                    className="absolute top-full right-0 mt-1 w-64 bg-gray-900/90 backdrop-blur-md border border-gray-800 rounded-lg shadow-xl shadow-black/30 overflow-hidden z-50"
                                >
                                    <div className="p-2">
                                        <DropdownItem
                                            href="/docs"
                                            icon={<HelpCircle size={18} className="text-cyan-400"/>}
                                            title="Documentation"
                                            description="Guides and references"
                                        />
                                        <DropdownItem
                                            href="/blog"
                                            icon={<Settings size={18} className="text-blue-400"/>}
                                            title="Blog"
                                            description="Latest news and updates"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="ml-4">
                        <AnimatedGradientBorder
                            containerClassName="rounded-full"
                            className="rounded-full bg-transparent"
                            animate={false}
                        >
                            <Link href="/login">
                                <motion.button
                                    whileHover={{scale: 1.03}}
                                    whileTap={{scale: 0.98}}
                                    className={`px-5 py-2 rounded-2xl text-white font-medium bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/10 text-sm ${spaceGrotesk.className}`}
                                >
                                    Get Started
                                </motion.button>
                            </Link>
                        </AnimatedGradientBorder>
                    </div>
                </div>

                {/* Mobile Menu Button */}
                <motion.button
                    whileTap={{scale: 0.9}}
                    className="md:hidden text-white p-1 rounded-md hover:bg-white/10 transition-colors"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label={isOpen ? "Close menu" : "Open menu"}
                >
                    {isOpen ? <X size={24}/> : <Menu size={24}/>}
                </motion.button>
            </div>

            {/* Mobile Navigation */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{opacity: 0, height: 0}}
                        animate={{opacity: 1, height: "auto"}}
                        exit={{opacity: 0, height: 0}}
                        transition={{duration: 0.3}}
                        className="md:hidden backdrop-blur-md bg-black/90 border-t border-gray-800/50 mt-4 rounded-b-xl overflow-hidden shadow-xl"
                    >
                        <div className="flex flex-col py-6 px-4">
                            <MobileNavItem href="#features" onClick={() => setIsOpen(false)}>
                                Features
                            </MobileNavItem>

                            {/* Mobile Products Dropdown */}
                            <div className="border-b border-gray-800/30 py-3">
                                <button
                                    onClick={() => toggleDropdown("mobile-products")}
                                    className="flex items-center justify-between w-full text-gray-300 py-2 px-4 hover:bg-gray-800/20 rounded-md"
                                    aria-expanded={activeDropdown === "mobile-products"}
                                >
                                    <span className={spaceGrotesk.className}>Products</span>
                                    <ChevronDown
                                        size={16}
                                        className={cn(
                                            "transition-transform duration-200",
                                            activeDropdown === "mobile-products" ? "rotate-180" : "",
                                        )}
                                    />
                                </button>

                                <AnimatePresence>
                                    {activeDropdown === "mobile-products" && (
                                        <motion.div
                                            initial={{opacity: 0, height: 0}}
                                            animate={{opacity: 1, height: "auto"}}
                                            exit={{opacity: 0, height: 0}}
                                            transition={{duration: 0.2}}
                                            className="mt-1 pl-4"
                                        >
                                            <MobileDropdownItem
                                                href="#dashboard"
                                                icon={<BarChart3 size={16} className="text-cyan-400"/>}
                                                onClick={() => setIsOpen(false)}
                                            >
                                                Dashboard
                                            </MobileDropdownItem>
                                            <MobileDropdownItem
                                                href="#security"
                                                icon={<Shield size={16} className="text-blue-400"/>}
                                                onClick={() => setIsOpen(false)}
                                            >
                                                Security
                                            </MobileDropdownItem>
                                            <MobileDropdownItem
                                                href="#organizations"
                                                icon={<Users size={16} className="text-purple-400"/>}
                                                onClick={() => setIsOpen(false)}
                                            >
                                                Organizations
                                            </MobileDropdownItem>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <MobileNavItem href="#testimonials" onClick={() => setIsOpen(false)}>
                                Testimonials
                            </MobileNavItem>
                            <MobileNavItem href="#pricing" onClick={() => setIsOpen(false)}>
                                Pricing
                            </MobileNavItem>

                            {/* Mobile Resources Dropdown */}
                            <div className="border-b border-gray-800/30 py-3">
                                <button
                                    onClick={() => toggleDropdown("mobile-resources")}
                                    className="flex items-center justify-between w-full text-gray-300 py-2 px-4 hover:bg-gray-800/20 rounded-md"
                                    aria-expanded={activeDropdown === "mobile-resources"}
                                >
                                    <span className={spaceGrotesk.className}>Resources</span>
                                    <ChevronDown
                                        size={16}
                                        className={cn(
                                            "transition-transform duration-200",
                                            activeDropdown === "mobile-resources" ? "rotate-180" : "",
                                        )}
                                    />
                                </button>

                                <AnimatePresence>
                                    {activeDropdown === "mobile-resources" && (
                                        <motion.div
                                            initial={{opacity: 0, height: 0}}
                                            animate={{opacity: 1, height: "auto"}}
                                            exit={{opacity: 0, height: 0}}
                                            transition={{duration: 0.2}}
                                            className="mt-1 pl-4"
                                        >
                                            <MobileDropdownItem
                                                href="/docs"
                                                icon={<HelpCircle size={16} className="text-cyan-400"/>}
                                                onClick={() => setIsOpen(false)}
                                            >
                                                Documentation
                                            </MobileDropdownItem>
                                            <MobileDropdownItem
                                                href="/blog"
                                                icon={<Settings size={16} className="text-blue-400"/>}
                                                onClick={() => setIsOpen(false)}
                                            >
                                                Blog
                                            </MobileDropdownItem>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="pt-4">
                                <Link href="/login" onClick={() => setIsOpen(false)}>
                                    <motion.button
                                        whileHover={{scale: 1.02}}
                                        whileTap={{scale: 0.98}}
                                        className={`w-full px-5 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg text-white font-medium shadow-lg shadow-cyan-500/10 ${spaceGrotesk.className}`}
                                    >
                                        Get Started
                                    </motion.button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    )
}

interface NavItemProps {
    href: string
    children: React.ReactNode
    className?: string
}

function NavItem({href, children, className}: NavItemProps) {
    return (
        <Link href={href}>
            <motion.span
                className={cn(
                    `text-gray-300 hover:text-white px-4 py-2 rounded-md transition-colors relative inline-block ${spaceGrotesk.className}`,
                    className,
                )}
                whileHover={{backgroundColor: "rgba(255,255,255,0.05)"}}
            >
                {children}
                <motion.span
                    className="absolute bottom-1.5 left-4 right-4 h-[2px] bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full origin-left"
                    initial={{scaleX: 0, opacity: 0}}
                    whileHover={{scaleX: 1, opacity: 1}}
                    transition={{duration: 0.2}}
                />
            </motion.span>
        </Link>
    )
}

interface MobileNavItemProps {
    href: string
    children: React.ReactNode
    onClick?: () => void
}

function MobileNavItem({href, children, onClick}: MobileNavItemProps) {
    return (
        <Link href={href} onClick={onClick}>
            <motion.div
                whileTap={{scale: 0.98}}
                className={`text-gray-300 py-3 px-4 border-b border-gray-800/30 hover:bg-gray-800/20 rounded-md flex items-center justify-between ${spaceGrotesk.className}`}
            >
                {children}
                <ChevronRight size={16} className="text-gray-500"/>
            </motion.div>
        </Link>
    )
}

interface DropdownItemProps {
    href: string
    icon: React.ReactNode
    title: string
    description: string
}

function DropdownItem({href, icon, title, description}: DropdownItemProps) {
    return (
        <Link href={href}>
            <motion.div
                className="flex items-start gap-3 p-2 rounded-md hover:bg-white/5 transition-colors"
                whileHover={{x: 3}}
            >
                <div className="mt-0.5">{icon}</div>
                <div>
                    <div className={`font-medium text-white ${spaceGrotesk.className}`}>{title}</div>
                    <div className="text-xs text-gray-400">{description}</div>
                </div>
            </motion.div>
        </Link>
    )
}

interface MobileDropdownItemProps {
    href: string
    icon: React.ReactNode
    children: React.ReactNode
    onClick?: () => void
}

function MobileDropdownItem({href, icon, children, onClick}: MobileDropdownItemProps) {
    return (
        <Link href={href} onClick={onClick}>
            <motion.div
                whileTap={{scale: 0.98}}
                className={`flex items-center gap-2 py-2 px-4 rounded-md hover:bg-gray-800/20 text-gray-300 my-1 ${spaceGrotesk.className}`}
            >
                {icon}
                <span>{children}</span>
            </motion.div>
        </Link>
    )
}
