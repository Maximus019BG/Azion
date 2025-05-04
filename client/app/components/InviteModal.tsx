"use client"

import {useEffect, useRef, useState} from "react"
import {AnimatePresence, motion} from "framer-motion"
import {Check, Copy, Link, Users, X} from "lucide-react"

interface InviteModalProps {
    isOpen: boolean
    onClose: () => void
    people: Record<string, string>
    inviteUser: (id: string) => void
    link: string
}

const InviteModal = ({isOpen, onClose, people, inviteUser, link}: InviteModalProps) => {
    const [copied, setCopied] = useState(false)
    const modalRef = useRef<HTMLDivElement>(null)

    const copyLink = () => {
        navigator.clipboard.writeText(link)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose()
            }
        }

        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside)
            document.addEventListener("keydown", handleEscKey)
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
            document.removeEventListener("keydown", handleEscKey)
        }
    }, [isOpen, onClose])

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    exit={{opacity: 0}}
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4"
                >
                    <motion.div
                        ref={modalRef}
                        initial={{scale: 0.9, y: 20}}
                        animate={{scale: 1, y: 0}}
                        exit={{scale: 0.9, y: 20}}
                        className="bg-gradient-to-b from-[#0f172a] to-[#0c1425] border border-blue-900/30 rounded-xl shadow-[0_0_30px_rgba(14,165,233,0.15)] w-full max-w-md overflow-hidden"
                    >
                        {/* Header with gradient */}
                        <div className="bg-gradient-to-r from-blue-900/40 to-blue-800/20 p-5 relative">
                            <button
                                onClick={onClose}
                                className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10 p-1"
                                aria-label="Close"
                            >
                                <X size={18}/>
                            </button>
                            <div className="flex items-center gap-3">
                                <div
                                    className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                                    <Users className="h-5 w-5"/>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Invite People</h2>
                                    <p className="text-gray-300 text-sm mt-0.5">Share this meeting with others</p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-5">
                            {/* People list */}
                            <div className="mb-6">
                                <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                                    <Users size={14} className="text-blue-400"/>
                                    Select a person to invite
                                </h3>

                                {Object.keys(people).length > 0 ? (
                                    <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
                                        {Object.entries(people).map(([email, id]) => (
                                            <motion.button
                                                key={id}
                                                whileHover={{scale: 1.01}}
                                                whileTap={{scale: 0.98}}
                                                onClick={() => inviteUser(id)}
                                                className="w-full flex items-center justify-between bg-blue-900/20 hover:bg-blue-800/30 border border-blue-900/40 rounded-lg p-3 transition-colors group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium">
                                                        {email.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-gray-200 text-sm font-medium">{email}</span>
                                                </div>
                                                <span
                                                    className="text-blue-400 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          Invite
                        </span>
                                            </motion.button>
                                        ))}
                                    </div>
                                ) : (
                                    <div
                                        className="bg-blue-900/20 border border-blue-900/30 rounded-lg p-4 text-center">
                                        <p className="text-gray-400 text-sm">No contacts available to invite</p>
                                    </div>
                                )}
                            </div>

                            {/* Divider */}
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-blue-900/40"></div>
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="bg-[#0c1425] px-2 text-gray-400">OR</span>
                                </div>
                            </div>

                            {/* Copy link section */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                                    <Link size={14} className="text-blue-400"/>
                                    Share meeting link
                                </h3>

                                <div className="relative">
                                    <input
                                        type="text"
                                        readOnly
                                        value={link}
                                        className="w-full bg-[#111827]/50 border border-blue-900/40 rounded-lg py-2.5 px-4 pr-12 text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                                    />
                                    <motion.button
                                        whileTap={{scale: 0.95}}
                                        onClick={copyLink}
                                        className="absolute right-1.5 top-1.5 p-1.5 rounded-md bg-blue-600/80 hover:bg-blue-500 text-white transition-colors"
                                        title="Copy link"
                                    >
                                        {copied ? <Check size={16}/> : <Copy size={16}/>}
                                    </motion.button>
                                </div>

                                {copied && (
                                    <motion.p
                                        initial={{opacity: 0, y: 5}}
                                        animate={{opacity: 1, y: 0}}
                                        className="text-blue-400 text-xs mt-2 flex items-center justify-end"
                                    >
                                        <Check size={12} className="mr-1"/>
                                        Link copied to clipboard!
                                    </motion.p>
                                )}
                            </div>

                            {/* Action button */}
                            <motion.button
                                whileHover={{scale: 1.02}}
                                whileTap={{scale: 0.98}}
                                onClick={onClose}
                                className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium py-2.5 px-4 rounded-lg transition duration-200 shadow-[0_0_15px_rgba(37,99,235,0.2)]"
                            >
                                Done
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default InviteModal
