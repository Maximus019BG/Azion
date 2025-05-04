"use client"
import {useState} from "react"
import VideoChatComponent from "@/app/components/chat/VideoCall"
import {motion} from "framer-motion"
import {User, Video} from "lucide-react"

export default function VideoChatPage() {
    const [remoteUserId, setRemoteUserId] = useState("")

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#020617] p-4 text-white">
            <div className="max-w-6xl mx-auto pt-8 pb-16">
                <motion.div
                    initial={{opacity: 0, y: -20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.5}}
                    className="text-center mb-10"
                >
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-3">
                        Video Conference
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Connect with others through secure, high-quality video calls. Enter a remote user ID to get
                        started.
                    </p>
                </motion.div>

                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.5, delay: 0.2}}
                    className="mb-10 max-w-xl mx-auto"
                >
                    <div
                        className="bg-[#1e293b]/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-6 shadow-[0_0_25px_rgba(14,165,233,0.07)]">
                        <label htmlFor="remote-id" className="block mb-2 font-medium text-gray-200">
                            Remote User ID
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <User className="h-5 w-5 text-gray-400"/>
                            </div>
                            <input
                                id="remote-id"
                                type="text"
                                value={remoteUserId}
                                onChange={(e) => setRemoteUserId(e.target.value)}
                                className="pl-10 w-full bg-[#0f172a]/80 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg py-3 px-4 text-white placeholder-gray-500 transition-colors duration-200"
                                placeholder="Enter email or user ID"
                            />
                        </div>

                        <div className="mt-4 text-center">
                            <button
                                onClick={() => setRemoteUserId("")}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2 mx-auto"
                                disabled={!remoteUserId}
                            >
                                <Video className="h-4 w-4"/>
                                Start Video Call
                            </button>
                        </div>
                    </div>
                </motion.div>

                {!remoteUserId ? (
                    <motion.div
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        transition={{duration: 0.5, delay: 0.4}}
                        className="text-center py-12"
                    >
                        <div
                            className="mx-auto w-20 h-20 rounded-full bg-blue-900/20 flex items-center justify-center mb-4">
                            <Video className="h-10 w-10 text-blue-400"/>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No Active Call</h3>
                        <p className="text-gray-400 max-w-md mx-auto">
                            Enter a remote user ID above to start a video call. Make sure the other person is available.
                        </p>
                    </motion.div>
                ) : (
                    <VideoChatComponent remoteUserId={remoteUserId}/>
                )}
            </div>
        </div>
    )
}
