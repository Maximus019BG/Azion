"use client"

import {useCallback, useEffect, useRef, useState} from "react"
import {Client, type IMessage} from "@stomp/stompjs"
import SockJS from "sockjs-client"
import {chatUrl} from "@/app/api/config"

const SIGNALING_ENDPOINT = chatUrl

type CallStatus = "disconnected" | "connecting" | "connected" | "ringing" | "failed"

export function useWebRTC(userId: string, remoteUserId: string) {
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
    const [connectionState, setConnectionState] = useState<CallStatus>("disconnected")
    const localStreamRef = useRef<MediaStream | null>(null)
    const screenStreamRef = useRef<MediaStream | null>(null)
    const peerRef = useRef<RTCPeerConnection | null>(null)
    const stompClientRef = useRef<Client | null>(null)
    const incomingCallHandlerRef = useRef<((callerId: string) => void) | null>(null)
    const callAcceptedHandlerRef = useRef<(() => void) | null>(null)
    const callRejectedHandlerRef = useRef<(() => void) | null>(null)
    const pendingCandidatesRef = useRef<RTCIceCandidate[]>([])
    const isCallInitiatorRef = useRef<boolean>(false)
    const videoSenderRef = useRef<RTCRtpSender | null>(null)
    const audioSenderRef = useRef<RTCRtpSender | null>(null)

    // Initialize WebRTC and signaling
    useEffect(() => {
        if (!userId) return // Don't initialize until we have a userId

        console.log("Initializing WebRTC with userId:", userId)

        // Create and configure the STOMP client
        const stompClient = new Client({
            webSocketFactory: () => new SockJS(SIGNALING_ENDPOINT),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                console.log(`[WebRTC] Connected to signaling server as ${userId}`)

                // Subscribe to signaling messages
                stompClient.subscribe(`/user/${userId}/signal`, async (msg: IMessage) => {
                    try {
                        const data = JSON.parse(msg.body)
                        console.log(`[WebRTC] Received signal: ${data.type} from: ${data.from}`)

                        switch (data.type) {
                            case "call-request":
                                // Notify about incoming call
                                console.log(`[WebRTC] Incoming call request from: ${data.from}`)
                                if (incomingCallHandlerRef.current) {
                                    incomingCallHandlerRef.current(data.from)
                                }
                                break

                            case "call-accepted":
                                console.log(`[WebRTC] Call accepted by: ${data.from}`)
                                if (callAcceptedHandlerRef.current) {
                                    callAcceptedHandlerRef.current()
                                }
                                // Create and send offer since we're the initiator
                                if (isCallInitiatorRef.current) {
                                    console.log(`[WebRTC] We are the initiator, creating and sending offer`)
                                    createAndSendOffer()
                                }
                                break

                            case "call-rejected":
                                console.log("Call rejected by remote user")
                                if (callRejectedHandlerRef.current) {
                                    callRejectedHandlerRef.current()
                                }
                                cleanupCall()
                                setConnectionState("disconnected")
                                break

                            case "call-ended":
                                console.log("Call ended by remote user")
                                cleanupCall()
                                setConnectionState("disconnected")
                                break

                            case "offer":
                                console.log("Received offer, setting remote description")
                                await handleOffer(data.offer, data.from)
                                break

                            case "answer":
                                console.log("Received answer, setting remote description")
                                await handleAnswer(data.answer)
                                break

                            case "ice-candidate":
                                await handleIceCandidate(data.candidate)
                                break
                        }
                    } catch (error) {
                        console.error("[WebRTC] Error handling signal:", error)
                    }
                })

                // Initialize local media stream
                initializeLocalStream()
            },
            onStompError: (frame) => {
                console.error("STOMP error:", frame)
            },
        })

        stompClient.activate()
        stompClientRef.current = stompClient

        // Cleanup function
        return () => {
            cleanupCall()
            if (stompClient.connected) {
                stompClient.deactivate()
            }
        }
    }, [userId])

    // Create and configure peer connection
    const createPeerConnection = useCallback(() => {
        console.log("Creating new peer connection")

        // Close any existing connection
        if (peerRef.current) {
            peerRef.current.close()
        }

        const pc = new RTCPeerConnection({
            iceServers: [
                {urls: "stun:stun.l.google.com:19302"},
                {urls: "stun:stun1.l.google.com:19302"},
                {urls: "stun:stun2.l.google.com:19302"},
                {
                    urls: "turn:numb.viagenie.ca",
                    credential: "muazkh",
                    username: "webrtc@live.com",
                },
            ],
            iceCandidatePoolSize: 10,
        })

        pc.ontrack = (event) => {
            console.log("Received remote track", event.streams)
            if (event.streams && event.streams[0]) {
                setRemoteStream(event.streams[0])
            }
        }

        pc.onicecandidate = (event) => {
            if (event.candidate && stompClientRef.current?.connected) {
                console.log("Sending ICE candidate to", remoteUserId)
                stompClientRef.current.publish({
                    destination: `/app/signal/${remoteUserId}`,
                    body: JSON.stringify({
                        type: "ice-candidate",
                        candidate: event.candidate,
                        from: userId,
                    }),
                })
            }
        }

        pc.oniceconnectionstatechange = () => {
            console.log("ICE connection state:", pc.iceConnectionState)

            switch (pc.iceConnectionState) {
                case "connected":
                case "completed":
                    setConnectionState("connected")
                    break
                case "disconnected":
                case "failed":
                    setConnectionState("failed")
                    break
                case "checking":
                    setConnectionState("connecting")
                    break
            }
        }

        pc.onsignalingstatechange = () => {
            console.log("Signaling state:", pc.signalingState)
        }

        pc.onconnectionstatechange = () => {
            console.log("Connection state:", pc.connectionState)
        }

        peerRef.current = pc

        // Add local tracks to the connection if available
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => {
                if (localStreamRef.current) {
                    console.log("Adding local track to peer connection:", track.kind)
                    const sender = pc.addTrack(track, localStreamRef.current)

                    // Store senders for later replacement
                    if (track.kind === "video") {
                        videoSenderRef.current = sender
                    } else if (track.kind === "audio") {
                        audioSenderRef.current = sender
                    }
                }
            })
        }

        return pc
    }, [remoteUserId, userId])

    // Initialize local media stream
    const initializeLocalStream = async () => {
        try {
            if (localStreamRef.current) {
                // Already initialized
                return localStreamRef.current
            }

            console.log("Initializing local media stream")
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            })

            localStreamRef.current = stream
            return stream
        } catch (err) {
            console.error("Error accessing media devices:", err)
            return null
        }
    }

    // Handle incoming offer
    const handleOffer = async (offer: RTCSessionDescriptionInit, from: string) => {
        try {
            // Create peer connection if it doesn't exist
            const pc = peerRef.current || createPeerConnection()

            // Set remote description
            await pc.setRemoteDescription(new RTCSessionDescription(offer))
            console.log("Set remote description from offer")

            // Apply any pending ICE candidates
            if (pendingCandidatesRef.current.length > 0) {
                console.log("Applying pending ICE candidates:", pendingCandidatesRef.current.length)
                for (const candidate of pendingCandidatesRef.current) {
                    await pc.addIceCandidate(candidate)
                }
                pendingCandidatesRef.current = []
            }

            // Create and set local description (answer)
            const answer = await pc.createAnswer()
            await pc.setLocalDescription(answer)
            console.log("Created and set local answer")

            // Send answer to remote peer
            if (stompClientRef.current?.connected) {
                stompClientRef.current.publish({
                    destination: `/app/signal/${from}`,
                    body: JSON.stringify({
                        type: "answer",
                        answer,
                        from: userId,
                    }),
                })
                console.log("Sent answer to:", from)
            }

            setConnectionState("connecting")
        } catch (error) {
            console.error("Error handling offer:", error)
            setConnectionState("failed")
        }
    }

    // Handle incoming answer
    const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
        try {
            if (!peerRef.current) {
                console.error("No peer connection when receiving answer")
                return
            }

            if (peerRef.current.signalingState === "stable") {
                console.log("Signaling state already stable, ignoring answer")
                return
            }

            await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer))
            console.log("Set remote description from answer")

            // Apply any pending ICE candidates
            if (pendingCandidatesRef.current.length > 0) {
                console.log("Applying pending ICE candidates after answer:", pendingCandidatesRef.current.length)
                for (const candidate of pendingCandidatesRef.current) {
                    await peerRef.current.addIceCandidate(candidate)
                }
                pendingCandidatesRef.current = []
            }
        } catch (error) {
            console.error("Error handling answer:", error)
        }
    }

    // Handle incoming ICE candidate
    const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
        try {
            if (peerRef.current && peerRef.current.remoteDescription) {
                await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate))
                console.log("Added ICE candidate")
            } else {
                // Store candidate to apply later
                console.log("Storing ICE candidate for later")
                pendingCandidatesRef.current.push(new RTCIceCandidate(candidate))
            }
        } catch (error) {
            console.error("Error handling ICE candidate:", error)
        }
    }

    // Create and send offer
    const createAndSendOffer = async () => {
        try {
            if (!peerRef.current) {
                console.error("No peer connection when creating offer")
                return
            }

            // Create offer
            const offer = await peerRef.current.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true,
            })

            // Set local description
            await peerRef.current.setLocalDescription(offer)
            console.log("Created and set local offer")

            // Send offer to remote peer
            if (stompClientRef.current?.connected) {
                stompClientRef.current.publish({
                    destination: `/app/signal/${remoteUserId}`,
                    body: JSON.stringify({
                        type: "offer",
                        offer,
                        from: userId,
                    }),
                })
                console.log("Sent offer to:", remoteUserId)
            }
        } catch (error) {
            console.error("Error creating offer:", error)
            setConnectionState("failed")
        }
    }

    // Clean up call resources
    const cleanupCall = () => {
        if (peerRef.current) {
            peerRef.current.close()
            peerRef.current = null
        }

        // Stop screen sharing if active
        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach((track) => track.stop())
            screenStreamRef.current = null
        }

        setRemoteStream(null)
        pendingCandidatesRef.current = []
        isCallInitiatorRef.current = false
        videoSenderRef.current = null
        audioSenderRef.current = null
    }

    // Initiate a call to remote user
    const initiateCall = async () => {
        if (!stompClientRef.current?.connected || !remoteUserId) {
            console.error("Cannot initiate call: not connected or no remote user ID")
            return
        }

        try {
            // Ensure we have local media
            await initializeLocalStream()

            // Mark as call initiator
            isCallInitiatorRef.current = true
            console.log(`[WebRTC] Initiating call as ${userId} to ${remoteUserId}`)

            // Send call request
            stompClientRef.current.publish({
                destination: `/app/signal/${remoteUserId}`,
                body: JSON.stringify({
                    type: "call-request",
                    from: userId,
                }),
            })

            console.log(`[WebRTC] Sent call request to: ${remoteUserId}`)
            setConnectionState("ringing")

            // Create peer connection (but don't send offer yet - wait for acceptance)
            createPeerConnection()
        } catch (err) {
            console.error("Error initiating call:", err)
        }
    }

    // Accept an incoming call
    const acceptCall = async () => {
        if (!stompClientRef.current?.connected || !remoteUserId) {
            console.error("Cannot accept call: not connected or no remote user ID")
            return
        }

        try {
            // Ensure we have local media
            await initializeLocalStream()

            // Create peer connection
            createPeerConnection()
            console.log(`[WebRTC] Accepting call as ${userId} from ${remoteUserId}`)

            // Send call accepted message
            stompClientRef.current.publish({
                destination: `/app/signal/${remoteUserId}`,
                body: JSON.stringify({
                    type: "call-accepted",
                    from: userId,
                }),
            })

            console.log(`[WebRTC] Sent call acceptance to: ${remoteUserId}`)
            setConnectionState("connecting")
        } catch (err) {
            console.error("Error accepting call:", err)
        }
    }

    // Reject an incoming call
    const rejectCall = () => {
        if (!stompClientRef.current?.connected || !remoteUserId) {
            console.error("Cannot reject call: not connected or no remote user ID")
            return
        }

        // Send call rejected message
        stompClientRef.current.publish({
            destination: `/app/signal/${remoteUserId}`,
            body: JSON.stringify({
                type: "call-rejected",
                from: userId,
            }),
        })

        console.log("Sent call rejection to:", remoteUserId)
        setConnectionState("disconnected")
    }

    // End an ongoing call
    const endCall = () => {
        if (stompClientRef.current?.connected && remoteUserId) {
            // Send call ended message
            stompClientRef.current.publish({
                destination: `/app/signal/${remoteUserId}`,
                body: JSON.stringify({
                    type: "call-ended",
                    from: userId,
                }),
            })

            console.log("Sent call end to:", remoteUserId)
        }

        cleanupCall()
        setConnectionState("disconnected")
    }

    // Toggle camera on/off
    const toggleCamera = (enabled: boolean) => {
        if (localStreamRef.current) {
            localStreamRef.current.getVideoTracks().forEach((track) => {
                track.enabled = enabled
            })
        }
    }

    // Toggle microphone on/off
    const toggleMic = (enabled: boolean) => {
        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach((track) => {
                track.enabled = enabled
            })
        }
    }

    // Toggle deafen (mute incoming audio)
    const toggleDeafen = (deafened: boolean) => {
        if (remoteStream) {
            remoteStream.getAudioTracks().forEach((track) => {
                track.enabled = !deafened
            })
        }
    }

    // Start screen sharing
    const startScreenShare = async () => {
        try {
            // Get screen sharing stream
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: false,
            })

            screenStreamRef.current = screenStream

            // Replace video track if we have a connection
            if (peerRef.current && videoSenderRef.current) {
                const videoTrack = screenStream.getVideoTracks()[0]
                await videoSenderRef.current.replaceTrack(videoTrack)

                // Handle when user stops sharing via the browser UI
                videoTrack.onended = () => {
                    stopScreenShare()
                }
            }

            return screenStream
        } catch (error) {
            console.error("Error starting screen share:", error)
            throw error
        }
    }

    // Stop screen sharing
    const stopScreenShare = async () => {
        try {
            // Stop all tracks in the screen stream
            if (screenStreamRef.current) {
                screenStreamRef.current.getTracks().forEach((track) => track.stop())
                screenStreamRef.current = null
            }

            // Switch back to camera if we have a connection
            if (peerRef.current && videoSenderRef.current && localStreamRef.current) {
                const videoTrack = localStreamRef.current.getVideoTracks()[0]
                if (videoTrack) {
                    await videoSenderRef.current.replaceTrack(videoTrack)
                }
            }

            return true
        } catch (error) {
            console.error("Error stopping screen share:", error)
            return false
        }
    }

    // Register callback for incoming calls
    const onIncomingCall = useCallback((handler: (callerId: string) => void) => {
        incomingCallHandlerRef.current = handler
    }, [])

    // Register callback for call acceptance
    const onCallAccepted = useCallback((handler: () => void) => {
        callAcceptedHandlerRef.current = handler
    }, [])

    // Register callback for call rejection
    const onCallRejected = useCallback((handler: () => void) => {
        callRejectedHandlerRef.current = handler
    }, [])

    return {
        localStream: localStreamRef.current,
        remoteStream,
        screenStream: screenStreamRef.current,
        connectionState,
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
    }
}
