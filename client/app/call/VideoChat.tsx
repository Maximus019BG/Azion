"use client"

import {useEffect, useRef, useState} from "react"
import {useWebRTC} from "@/hooks/use-web-rtc"
import {BluetoothOffIcon as HeadphonesOff, CheckCircle, Clock, Headphones, Mic, MicOff, MonitorSmartphone, MonitorUp, Phone, PhoneOff, User, Video, VideoOff, XCircle,} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {UserData} from "@/app/func/funcs"
import {toast} from "@/components/ui/use-toast"
import {AnimatePresence, motion} from "framer-motion"

interface VideoChatProps {
    remoteUserId: string
}

const VideoChatComponent = ({remoteUserId}: VideoChatProps) => {
    const [isCalling, setIsCalling] = useState(false)
    const [isReceivingCall, setIsReceivingCall] = useState(false)
    const [isCameraOn, setIsCameraOn] = useState(true)
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
    const [userEmail, setUserEmail] = useState<string>("")

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await UserData()
                setUserEmail(data.email)
            } catch (err) {
                console.error("Failed to load user data", err)
            }
        }
        fetchUser()
    }, [])

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
    } = useWebRTC(userEmail, remoteUserId)

    // Update connection status based on WebRTC state
    useEffect(() => {
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

    // Handle incoming call notifications
    useEffect(() => {
        const handleIncoming = (callerId: string) => {
            setIsReceivingCall(true)
            setCallerId(callerId)
            toast({
                title: "Incoming Call",
                description: `${callerId} is calling you`,
                duration: 60000, // 1 minute
            })

            // Set timeout for auto-rejection after 1 minute
            let timeLeft = 60
            setCallTimeoutSeconds(timeLeft)

            callTimeoutRef.current = setInterval(() => {
                timeLeft -= 1
                setCallTimeoutSeconds(timeLeft)

                if (timeLeft <= 0) {
                    clearInterval(callTimeoutRef.current!)
                    callTimeoutRef.current = null
                    setCallTimeoutSeconds(null)

                    // Auto-reject the call
                    if (isReceivingCall) {
                        handleRejectCall()
                        toast({
                            title: "Call Timed Out",
                            description: "The call was automatically rejected after 1 minute",
                            variant: "destructive",
                        })
                    }
                }
            }, 1000)
        }

        onIncomingCall(handleIncoming)
    }, [onIncomingCall, isReceivingCall])

    // Handle call rejection
    useEffect(() => {
        const handleRejected = () => {
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

        onCallRejected(handleRejected)
    }, [onCallRejected, remoteUserId])

    // Handle call acceptance
    useEffect(() => {
        const handleAccepted = () => {
            if (callTimeoutRef.current) {
                clearInterval(callTimeoutRef.current)
                callTimeoutRef.current = null
                setCallTimeoutSeconds(null)
            }
        }

        onCallAccepted(handleAccepted)
    }, [onCallAccepted])

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
            remoteVideoRef.current.srcObject = remoteStream
        }
    }, [localStream, remoteStream, screenStream, isScreenSharing])

    const handleStartCall = () => {
        if (!remoteUserId) {
            toast({
                title: "Error",
                description: "Remote user ID is not provided",
                variant: "destructive",
            })
            return
        }

        initiateCall()
        setIsCalling(true)
        toast({
            title: "Calling...",
            description: `Waiting for ${remoteUserId} to answer`,
        })

        // Set timeout for auto-cancellation after 1 minute
        let timeLeft = 60
        setCallTimeoutSeconds(timeLeft)

        callTimeoutRef.current = setInterval(() => {
            timeLeft -= 1
            setCallTimeoutSeconds(timeLeft)

            if (timeLeft <= 0) {
                clearInterval(callTimeoutRef.current!)
                callTimeoutRef.current = null
                setCallTimeoutSeconds(null)

                // Auto-end the call if still ringing
                if (connectionState === "ringing") {
                    handleEndCall()
                    toast({
                        title: "Call Timed Out",
                        description: "No answer after 1 minute. Call ended.",
                        variant: "destructive",
                    })
                }
            }
        }, 1000)
    }

    const handleAcceptCall = () => {
        acceptCall()
        setIsReceivingCall(false)
        setIsCalling(true)

        // Clear any timeout
        if (callTimeoutRef.current) {
            clearInterval(callTimeoutRef.current)
            callTimeoutRef.current = null
            setCallTimeoutSeconds(null)
        }
    }

    const handleRejectCall = () => {
        rejectCall()
        setIsReceivingCall(false)
        setCallerId(null)

        // Clear any timeout
        if (callTimeoutRef.current) {
            clearInterval(callTimeoutRef.current)
            callTimeoutRef.current = null
            setCallTimeoutSeconds(null)
        }
    }

    const handleEndCall = () => {
        endCall()
        setIsCalling(false)
        setIsScreenSharing(false)

        // Clear any timeout
        if (callTimeoutRef.current) {
            clearInterval(callTimeoutRef.current)
            callTimeoutRef.current = null
            setCallTimeoutSeconds(null)
        }
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
                                    Video Call
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
                                {remoteStream?.getVideoTracks().some((track) => track.label.includes("screen")) ? "Screen" : "Camera"}
                            </div>

                            <video
                                ref={remoteVideoRef}
                                autoPlay
                                playsInline
                                className={`w-full h-full ${
                                    remoteStream?.getVideoTracks().some((track) => track.label.includes("screen"))
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
                                    <h3 className="text-xl font-medium text-white">Incoming call from {callerId}</h3>
                                    <p className="text-gray-400 text-sm mt-1">
                                        {callTimeoutSeconds !== null && `Auto-reject in ${callTimeoutSeconds}s`}
                                    </p>
                                </div>
                                <div className="flex justify-center gap-4">
                                    <Button
                                        onClick={handleAcceptCall}
                                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                                        size="lg"
                                    >
                                        <CheckCircle className="mr-2 h-5 w-5"/>
                                        Accept Call
                                    </Button>
                                    <Button
                                        onClick={handleRejectCall}
                                        variant="destructive"
                                        size="lg"
                                        className="bg-red-600 hover:bg-red-700 shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                                    >
                                        <XCircle className="mr-2 h-5 w-5"/>
                                        Reject Call
                                    </Button>
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
                                    <Button
                                        onClick={handleStartCall}
                                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                                        size="lg"
                                    >
                                        <Phone className="mr-2 h-5 w-5"/>
                                        Start Call
                                    </Button>
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
