"use client"

import {useEffect, useRef, useState} from "react"
import {useWebRTC} from "@/hooks/use-web-rtc"
import {BluetoothOffIcon as HeadphonesOff, CheckCircle, Clock, Headphones, Mic, MicOff, MonitorSmartphone, MonitorUp, Phone, PhoneOff, User, Video, VideoOff, XCircle} from 'lucide-react'
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {UserData} from "@/app/func/funcs"
import {toast} from "@/components/ui/use-toast"

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

    return (
        <div className="p-6 max-w-6xl mx-auto bg-zinc-900 text-zinc-100 rounded-lg">
            <Card className="mb-6 bg-zinc-800 border-zinc-700">
                <CardHeader className="pb-2 border-b border-zinc-700">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-xl text-zinc-100">
                            {isScreenSharing ? "Screen Sharing" : "Video Conference"}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            {callTimeoutSeconds !== null && (
                                <Badge variant="outline" className="flex items-center gap-1">
                                    <Clock className="h-3 w-3"/>
                                    {callTimeoutSeconds}s
                                </Badge>
                            )}
                            <Badge
                                variant={
                                    connectionStatus === "connected"
                                        ? "default"
                                        : connectionStatus === "connecting"
                                            ? "outline"
                                            : connectionStatus === "ringing"
                                                ? "secondary"
                                                : "destructive"
                                }
                            >
                                {connectionStatus === "connected"
                                    ? "Connected"
                                    : connectionStatus === "connecting"
                                        ? "Connecting..."
                                        : connectionStatus === "ringing"
                                            ? "Ringing..."
                                            : "Disconnected"}
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-4">
                        <User className="h-5 w-5 text-zinc-400"/>
                        <span className="text-sm font-medium text-zinc-300">{userEmail || "No user"}</span>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                        <User className="h-5 w-5 text-zinc-400"/>
                        <span className="text-sm font-medium text-zinc-300">
              {isReceivingCall ? `Incoming call from: ${callerId}` : `Remote user: ${remoteUserId || "Not selected"}`}
            </span>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card className="overflow-hidden bg-zinc-800 border-zinc-700">
                    <CardHeader className="py-2 px-4 bg-zinc-700/50">
                        <CardTitle className="text-sm font-medium text-zinc-200">
                            {isScreenSharing ? "Your Screen" : "Your Camera"}
                            {isScreenSharing && <span className="ml-2 text-xs text-blue-400">(Screen sharing active)</span>}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 aspect-video bg-zinc-900 relative">
                        {/* Show screen share if active, otherwise show camera */}
                        {isScreenSharing ? (
                            <video
                                ref={screenVideoRef}
                                autoPlay
                                muted
                                playsInline
                                className="w-full h-full object-contain bg-black"
                            />
                        ) : (
                            <video
                                ref={localVideoRef}
                                autoPlay
                                muted
                                playsInline
                                className="w-full h-full object-cover"
                            />
                        )}

                        {!isCameraOn && !isScreenSharing && (
                            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80">
                                <VideoOff className="h-12 w-12 text-zinc-500"/>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="overflow-hidden bg-zinc-800 border-zinc-700">
                    <CardHeader className="py-2 px-4 bg-zinc-700/50">
                        <CardTitle className="text-sm font-medium text-zinc-200">
                            Remote{" "}
                            {remoteStream?.getVideoTracks().some((track) => track.label.includes("screen")) ? "Screen" : "Camera"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 aspect-video bg-zinc-900 relative">
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            className={`w-full h-full ${remoteStream?.getVideoTracks().some(track => track.label.includes("screen")) ? "object-contain bg-black" : "object-cover"}`}
                        />
                        {!remoteStream && (
                            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80">
                                <User className="h-12 w-12 text-zinc-500"/>
                            </div>
                        )}
                        {isDeafened && remoteStream && (
                            <div className="absolute top-2 right-2 bg-red-600 rounded-full p-1">
                                <HeadphonesOff className="h-5 w-5"/>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {isReceivingCall ? (
                <div className="flex flex-wrap justify-center gap-4 p-4 bg-zinc-800 rounded-lg mb-4 border border-zinc-700">
                    <div className="w-full text-center mb-2">
                        <p className="text-lg font-medium">
                            Incoming call from {callerId}
                            {callTimeoutSeconds !== null && (
                                <span className="ml-2 text-amber-400 text-sm">
                  Auto-reject in {callTimeoutSeconds}s
                </span>
                            )}
                        </p>
                    </div>
                    <Button onClick={handleAcceptCall} className="bg-blue-700 hover:bg-blue-800 text-white" size="lg">
                        <CheckCircle className="mr-2 h-5 w-5"/>
                        Accept Call
                    </Button>
                    <Button onClick={handleRejectCall} variant="destructive" size="lg" className="bg-red-600 hover:bg-red-700">
                        <XCircle className="mr-2 h-5 w-5"/>
                        Reject Call
                    </Button>
                </div>
            ) : (
                <div className="flex flex-wrap justify-center gap-4">
                    {!isCalling ? (
                        <Button onClick={handleStartCall} className="bg-blue-700 hover:bg-blue-800 text-white" size="lg">
                            <Phone className="mr-2 h-5 w-5"/>
                            Start Call
                        </Button>
                    ) : (
                        <Button onClick={handleEndCall} variant="destructive" size="lg" className="bg-red-600 hover:bg-red-700">
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
                                        ? "border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                                        : "bg-zinc-700 text-zinc-200 hover:bg-zinc-600"
                                }
                            >
                                {isCameraOn ? (
                                    <>
                                        <Video className="mr-2 h-5 w-5"/> Camera On
                                    </>
                                ) : (
                                    <>
                                        <VideoOff className="mr-2 h-5 w-5"/> Camera Off
                                    </>
                                )}
                            </Button>

                            <Button
                                onClick={handleToggleMic}
                                variant="outline"
                                size="lg"
                                className={
                                    isMicOn
                                        ? "border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                                        : "bg-zinc-700 text-zinc-200 hover:bg-zinc-600"
                                }
                            >
                                {isMicOn ? (
                                    <>
                                        <Mic className="mr-2 h-5 w-5"/> Mic On
                                    </>
                                ) : (
                                    <>
                                        <MicOff className="mr-2 h-5 w-5"/> Mic Off
                                    </>
                                )}
                            </Button>

                            <Button
                                onClick={handleToggleDeafen}
                                variant="outline"
                                size="lg"
                                className={
                                    !isDeafened
                                        ? "border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                                        : "bg-zinc-700 text-zinc-200 hover:bg-zinc-600"
                                }
                            >
                                {!isDeafened ? (
                                    <>
                                        <Headphones className="mr-2 h-5 w-5"/> Audio On
                                    </>
                                ) : (
                                    <>
                                        <HeadphonesOff className="mr-2 h-5 w-5"/> Deafened
                                    </>
                                )}
                            </Button>

                            <Button
                                onClick={handleToggleScreenShare}
                                variant="outline"
                                size="lg"
                                className={
                                    !isScreenSharing
                                        ? "border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                                        : "bg-blue-700 text-white hover:bg-blue-800"
                                }
                            >
                                {!isScreenSharing ? (
                                    <>
                                        <MonitorSmartphone className="mr-2 h-5 w-5"/> Share Screen
                                    </>
                                ) : (
                                    <>
                                        <MonitorUp className="mr-2 h-5 w-5"/> Stop Sharing
                                    </>
                                )}
                            </Button>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

export default VideoChatComponent
