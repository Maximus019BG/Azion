"use client"

import {useEffect, useRef, useState} from "react"
import {useWebRTC} from "@/hooks/use-web-rtc"
import {BluetoothOffIcon as HeadphonesOff, Clock, Headphones, Mic, MicOff, MonitorSmartphone, MonitorUp, Phone, PhoneOff, User, Video, VideoOff,} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {UserData} from "@/app/func/funcs"
import {toast} from "@/components/ui/use-toast"
import {AnimatePresence, motion} from "framer-motion"

interface VideoChatProps {
    remoteUserId: string
    onClose: () => void
    initialCallType?: "video" | "audio"
    isIncomingCall?: boolean
}

const VideoChatComponent = ({
                                remoteUserId,
                                onClose,
                                initialCallType = "video",
                                isIncomingCall = false,
                            }: VideoChatProps) => {
    console.log("COMPONENT MOUNTED with props:", {remoteUserId, initialCallType, isIncomingCall})

    const [userEmail, setUserEmail] = useState<string>("")
    const [isCalling, setIsCalling] = useState(false)
    const [isReceivingCall, setIsReceivingCall] = useState(isIncomingCall)
    const [isCameraOn, setIsCameraOn] = useState(initialCallType === "video")
    const [isMicOn, setIsMicOn] = useState(true)
    const [isDeafened, setIsDeafened] = useState(false)
    const [isScreenSharing, setIsScreenSharing] = useState(false)
    const [connectionStatus, setConnectionStatus] = useState("disconnected")
    const [callerId, setCallerId] = useState<string | null>(null)
    const [callTimeoutSeconds, setCallTimeoutSeconds] = useState<number | null>(null)

    const localVideoRef = useRef<HTMLVideoElement | null>(null)
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null)
    const screenVideoRef = useRef<HTMLVideoElement | null>(null)
    const callTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const actionTakenRef = useRef<boolean>(false)

    // Fetch user email first
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await UserData()
                console.log("User data fetched:", data.email)
                setUserEmail(data.email)
            } catch (err) {
                console.error("Failed to load user data", err)
            }
        }
        fetchUser()
    }, [])

    // Only initialize WebRTC after we have the user email
    const {
        localStream,
        remoteStream,
        screenStream,
        initiateCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleCamera,
        toggleMic,
        toggleDeafen,
        startScreenShare,
        stopScreenShare,
        onIncomingCall,
        onCallAccepted,
        onCallRejected,
        connectionState,
    } = useWebRTC(userEmail || "", remoteUserId || "")

    // CRITICAL: This effect handles the core call logic based on isIncomingCall
    useEffect(() => {
        // Don't do anything until we have user email and remote ID
        if (!userEmail || !remoteUserId) {
            console.log("Waiting for user email and remote ID")
            return
        }

        // Don't take action if we've already done so
        if (actionTakenRef.current) {
            console.log("Action already taken, not doing anything")
            return
        }

        // Set a timeout to ensure all hooks and state are properly initialized
        const timer = setTimeout(() => {
            if (isIncomingCall) {
                // ANSWERING LOGIC - ONLY runs if isIncomingCall is true
                console.log("🟢 ANSWERING MODE: This component will ONLY answer calls, never initiate")
                console.log("🟢 ANSWERING MODE: Accepting call from", remoteUserId)

                // Mark that we've taken action
                actionTakenRef.current = true

                // Accept the call
                acceptCall()
                setIsReceivingCall(false)
                setIsCalling(true)
                setCallerId(remoteUserId)

                toast({
                    title: "Answering Call",
                    description: `Connecting with ${remoteUserId}`,
                })
            } else {
                // CALLING LOGIC - ONLY runs if isIncomingCall is false
                console.log("🔵 CALLING MODE: This component will ONLY initiate calls, never answer")
                console.log("🔵 CALLING MODE: Initiating call to", remoteUserId)

                // Mark that we've taken action
                actionTakenRef.current = true

                // Initiate the call
                initiateCall()
                setIsCalling(true)

                toast({
                    title: "Calling...",
                    description: `Connecting with ${remoteUserId}`,
                })
            }
        }, 1000) // Short delay to ensure everything is initialized

        // If this is an audio call, turn off the camera initially
        if (initialCallType === "audio") {
            toggleCamera(false)
            setIsCameraOn(false)
        }

        return () => clearTimeout(timer)
    }, [userEmail, remoteUserId, isIncomingCall, initialCallType, acceptCall, initiateCall, toggleCamera])

    // Handle incoming call events - only relevant for the caller component
    useEffect(() => {
        if (!userEmail || !remoteUserId || isIncomingCall) return

        console.log("Setting up incoming call handler (only for caller component)")

        const handleIncomingCall = (callerId: string) => {
            console.log(`Received incoming call from ${callerId} - but we're in calling mode, so ignoring`)
            // We don't handle incoming calls in the caller component
        }

        onIncomingCall(handleIncomingCall)
    }, [userEmail, remoteUserId, onIncomingCall, isIncomingCall])

    // Handle call accepted/rejected events
    useEffect(() => {
        if (!userEmail || !remoteUserId) return

        console.log("Setting up call accepted/rejected handlers")

        // Handle call acceptance
        const handleCallAccepted = () => {
            console.log("Call was accepted")
            if (callTimeoutRef.current) {
                clearInterval(callTimeoutRef.current)
                callTimeoutRef.current = null
                setCallTimeoutSeconds(null)
            }
        }

        // Handle call rejection
        const handleCallRejected = () => {
            console.log("Call was rejected")
            toast({
                title: "Call Rejected",
                description: `${remoteUserId} rejected your call`,
                variant: "destructive",
            })

            setIsCalling(false)

            if (callTimeoutRef.current) {
                clearInterval(callTimeoutRef.current)
                callTimeoutRef.current = null
                setCallTimeoutSeconds(null)
            }
        }

        onCallAccepted(handleCallAccepted)
        onCallRejected(handleCallRejected)
    }, [userEmail, remoteUserId, onCallAccepted, onCallRejected])

    // Update connection status based on WebRTC state
    useEffect(() => {
        console.log(`Connection state changed to: ${connectionState}`)
        setConnectionStatus(connectionState)

        // If call is connected or ended, clear any timeout
        if (connectionState === "connected" || connectionState === "disconnected") {
            if (callTimeoutRef.current) {
                clearInterval(callTimeoutRef.current)
                callTimeoutRef.current = null
                setCallTimeoutSeconds(null)
            }
        }
    }, [connectionState])

    // Set up video streams
    useEffect(() => {
        // Handle local camera stream
        if (localVideoRef.current && localStream && !isScreenSharing) {
            localVideoRef.current.srcObject = localStream
        }

        // Handle screen sharing stream
        if (screenVideoRef.current && screenStream) {
            screenVideoRef.current.srcObject = screenStream
        }

        // Handle remote stream
        if (remoteVideoRef.current && remoteStream) {
            console.log("Setting remote stream to video element")
            remoteVideoRef.current.srcObject = remoteStream
        }
    }, [localStream, remoteStream, screenStream, isScreenSharing])

    const handleEndCall = () => {
        console.log("Ending call")
        endCall()
        setIsCalling(false)
        setIsScreenSharing(false)

        // Clear any timeout
        if (callTimeoutRef.current) {
            clearInterval(callTimeoutRef.current)
            callTimeoutRef.current = null
            setCallTimeoutSeconds(null)
        }
        onClose()
    }

    const handleToggleCamera = () => {
        const newState = !isCameraOn
        toggleCamera(newState)
        setIsCameraOn(newState)
    }

    const handleToggleMic = () => {
        const newState = !isMicOn
        toggleMic(newState)
        setIsMicOn(newState)
    }

    const handleToggleDeafen = () => {
        const newState = !isDeafened
        toggleDeafen(newState)
        setIsDeafened(newState)

        toast({
            title: newState ? "Deafened" : "Undeafened",
            description: newState ? "You can no longer hear the other person" : "You can now hear the other person",
            duration: 3000,
        })
    }

    const handleToggleScreenShare = async () => {
        if (isScreenSharing) {
            await stopScreenShare()
            setIsScreenSharing(false)

            // If camera was on before screen sharing, make sure it's still on
            if (isCameraOn) {
                toggleCamera(true)
            }

            toast({
                title: "Screen sharing stopped",
                duration: 3000,
            })
        } else {
            try {
                await startScreenShare()
                setIsScreenSharing(true)

                toast({
                    title: "Screen sharing started",
                    duration: 3000,
                })
            } catch (error) {
                console.error("Error starting screen share:", error)
                toast({
                    title: "Screen sharing failed",
                    description: "Could not access your screen",
                    variant: "destructive",
                })
            }
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "connected":
                return "bg-green-500/20 text-green-400 border-green-500/30"
            case "connecting":
                return "bg-blue-500/20 text-blue-400 border-blue-500/30"
            case "ringing":
                return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
            default:
                return "bg-gray-500/20 text-gray-400 border-gray-500/30"
        }
    }

    return (
        <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.5}}
            className="max-w-6xl mx-auto"
        >
            <Card className="mb-6 bg-[#1e293b]/40 backdrop-blur-sm border border-gray-700/30 shadow-[0_0_25px_rgba(14,165,233,0.07)]">
                <CardHeader className="pb-3 border-b border-gray-700/50">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-xl text-white flex items-center gap-2">
                            {isScreenSharing ? (
                                <>
                                    <MonitorSmartphone className="h-5 w-5 text-blue-400"/>
                                    Screen Sharing
                                </>
                            ) : (
                                <>
                                    <Video className="h-5 w-5 text-blue-400"/>
                                    Video Call {isIncomingCall ? "(Answering)" : "(Calling)"}
                                </>
                            )}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            {callTimeoutSeconds !== null && (
                                <Badge
                                    variant="outline"
                                    className="flex items-center gap-1 bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                                >
                                    <Clock className="h-3 w-3"/>
                                    {callTimeoutSeconds}s
                                </Badge>
                            )}
                            <Badge variant="outline" className={`border ${getStatusColor(connectionStatus)}`}>
                                {connectionStatus === "connected" ? (
                                    <span className="flex items-center gap-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                    </span>
                    Connected
                  </span>
                                ) : connectionStatus === "connecting" ? (
                                    <span className="flex items-center gap-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400"></span>
                    </span>
                    Connecting...
                  </span>
                                ) : connectionStatus === "ringing" ? (
                                    <span className="flex items-center gap-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400"></span>
                    </span>
                    Ringing...
                  </span>
                                ) : (
                                    <span className="flex items-center gap-1">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-400"></span>
                    Disconnected
                  </span>
                                )}
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-blue-400"/>
                            <span className="text-sm font-medium text-gray-300">{userEmail || "No user"}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-blue-400"/>
                            <span className="text-sm font-medium text-gray-300">
                {isReceivingCall ? `Incoming call from: ${callerId}` : `Remote user: ${remoteUserId || "Not selected"}`}
              </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="relative overflow-hidden rounded-lg border border-gray-700/50 bg-black/50 aspect-video shadow-[0_0_15px_rgba(0,0,0,0.3)]">
                            <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-black/60 rounded-md text-xs font-medium text-gray-300">
                                {isScreenSharing ? "Your Screen" : "Your Camera"}
                            </div>

                            {isScreenSharing ? (
                                <video ref={screenVideoRef} autoPlay muted playsInline className="w-full h-full object-contain"/>
                            ) : (
                                <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover"/>
                            )}

                            {!isCameraOn && !isScreenSharing && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/90">
                                    <User className="h-16 w-16 text-gray-600 mb-2"/>
                                    <span className="text-sm text-gray-500">Camera off</span>
                                </div>
                            )}

                            {isScreenSharing && (
                                <div className="absolute bottom-2 right-2 z-10 px-2 py-1 bg-blue-500/80 rounded-md text-xs font-medium text-white">
                                    Screen sharing
                                </div>
                            )}
                        </div>

                        <div className="relative overflow-hidden rounded-lg border border-gray-700/50 bg-black/50 aspect-video shadow-[0_0_15px_rgba(0,0,0,0.3)]">
                            <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-black/60 rounded-md text-xs font-medium text-gray-300">
                                Remote{" "}
                                {remoteStream?.getVideoTracks().some((track) => track.enabled && track.label.includes("screen"))
                                    ? "Screen"
                                    : "Camera"}
                            </div>

                            <video
                                ref={remoteVideoRef}
                                autoPlay
                                playsInline
                                className={`w-full h-full ${
                                    remoteStream?.getVideoTracks().some((track) => track.enabled && track.label.includes("screen"))
                                        ? "object-contain"
                                        : "object-cover"
                                }`}
                            />

                            {!remoteStream && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/90">
                                    <User className="h-16 w-16 text-gray-600 mb-2"/>
                                    <span className="text-sm text-gray-500">Waiting for remote video</span>
                                </div>
                            )}

                            {isDeafened && remoteStream && (
                                <div className="absolute top-2 right-2 z-10 px-2 py-1 bg-red-500/80 rounded-md text-xs font-medium text-white flex items-center gap-1">
                                    <HeadphonesOff className="h-3 w-3"/>
                                    Deafened
                                </div>
                            )}
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {isReceivingCall ? (
                            <motion.div
                                key="incoming"
                                initial={{opacity: 0, y: 10}}
                                animate={{opacity: 1, y: 0}}
                                exit={{opacity: 0, y: -10}}
                                className="p-6 bg-[#0f172a]/80 border border-gray-700/50 rounded-lg mb-4"
                            >
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center mb-3">
                                        <Phone className="h-8 w-8 text-blue-400 animate-pulse"/>
                                    </div>
                                    <h3 className="text-xl font-medium text-white">Auto-connecting with {callerId}</h3>
                                    <p className="text-blue-400 text-sm mt-1">Joining call automatically...</p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="controls"
                                initial={{opacity: 0, y: 10}}
                                animate={{opacity: 1, y: 0}}
                                exit={{opacity: 0, y: -10}}
                                className="flex flex-wrap justify-center gap-3"
                            >
                                {!isCalling ? (
                                    <div className="flex items-center justify-center gap-2 p-3 bg-blue-600/20 rounded-lg text-blue-400">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-400"></span>
                    </span>
                                        {isIncomingCall ? "Answering call..." : "Establishing connection..."}
                                    </div>
                                ) : (
                                    <Button
                                        onClick={handleEndCall}
                                        variant="destructive"
                                        size="lg"
                                        className="bg-red-600 hover:bg-red-700 shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                                    >
                                        <PhoneOff className="mr-2 h-5 w-5"/>
                                        End Call
                                    </Button>
                                )}

                                {isCalling && (
                                    <>
                                        <Button
                                            onClick={handleToggleCamera}
                                            variant="outline"
                                            size="lg"
                                            disabled={isScreenSharing}
                                            className={
                                                isCameraOn
                                                    ? "border-gray-700 bg-[#1e293b] text-white hover:bg-[#334155]"
                                                    : "bg-[#334155] text-white hover:bg-[#475569] border-gray-600"
                                            }
                                        >
                                            {isCameraOn ? (
                                                <>
                                                    <Video className="mr-2 h-5 w-5 text-blue-400"/> Camera On
                                                </>
                                            ) : (
                                                <>
                                                    <VideoOff className="mr-2 h-5 w-5 text-gray-400"/> Camera Off
                                                </>
                                            )}
                                        </Button>

                                        <Button
                                            onClick={handleToggleMic}
                                            variant="outline"
                                            size="lg"
                                            className={
                                                isMicOn
                                                    ? "border-gray-700 bg-[#1e293b] text-white hover:bg-[#334155]"
                                                    : "bg-[#334155] text-white hover:bg-[#475569] border-gray-600"
                                            }
                                        >
                                            {isMicOn ? (
                                                <>
                                                    <Mic className="mr-2 h-5 w-5 text-blue-400"/> Mic On
                                                </>
                                            ) : (
                                                <>
                                                    <MicOff className="mr-2 h-5 w-5 text-gray-400"/> Mic Off
                                                </>
                                            )}
                                        </Button>

                                        <Button
                                            onClick={handleToggleDeafen}
                                            variant="outline"
                                            size="lg"
                                            className={
                                                !isDeafened
                                                    ? "border-gray-700 bg-[#1e293b] text-white hover:bg-[#334155]"
                                                    : "bg-[#334155] text-white hover:bg-[#475569] border-gray-600"
                                            }
                                        >
                                            {!isDeafened ? (
                                                <>
                                                    <Headphones className="mr-2 h-5 w-5 text-blue-400"/> Audio On
                                                </>
                                            ) : (
                                                <>
                                                    <HeadphonesOff className="mr-2 h-5 w-5 text-gray-400"/> Deafened
                                                </>
                                            )}
                                        </Button>

                                        <Button
                                            onClick={handleToggleScreenShare}
                                            variant="outline"
                                            size="lg"
                                            className={
                                                !isScreenSharing
                                                    ? "border-gray-700 bg-[#1e293b] text-white hover:bg-[#334155]"
                                                    : "bg-blue-600 text-white hover:bg-blue-700 border-blue-700"
                                            }
                                        >
                                            {!isScreenSharing ? (
                                                <>
                                                    <MonitorSmartphone className="mr-2 h-5 w-5 text-blue-400"/> Share Screen
                                                </>
                                            ) : (
                                                <>
                                                    <MonitorUp className="mr-2 h-5 w-5 text-white"/> Stop Sharing
                                                </>
                                            )}
                                        </Button>
                                    </>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>
        </motion.div>
    )
}

export default VideoChatComponent
