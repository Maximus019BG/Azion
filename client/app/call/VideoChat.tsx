"use client";

import {useEffect, useRef, useState} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import VideoControls from "./video-controls";
import VideoDisplay from "./video-display";
import {Client} from "@stomp/stompjs";
import SockJS from "sockjs-client";
import {chatUrl} from "@/app/api/config";


export default function VideoChat() {
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isCallActive, setIsCallActive] = useState(false);
    const [userEmail, setUserEmail] = useState("");
    const [receiverEmail, setReceiverEmail] = useState("");
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isAudioOff, setIsAudioOff] = useState(false);

    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const stompClientRef = useRef<Client | null>(null);
    const originalStreamRef = useRef<MediaStream | null>(null);

    // Initialize WebSocket connection
    const connectWebSocket = () => {
        if (!userEmail) return;

        const socket = new SockJS(`${chatUrl}`);
        const client = new Client({
            webSocketFactory: () => socket,
            debug: (str) => {
                console.log(str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = () => {
            console.log("Connected to WebSocket");
            setIsConnected(true);

            client.subscribe(`${chatUrl}/user/${userEmail}/signal`, (message) => {
                handleSignalingMessage(JSON.parse(message.body));
            });
        };

        client.onStompError = (frame) => {
            console.error("STOMP error", frame);
        };

        client.activate();
        stompClientRef.current = client;
    };

    // Handle incoming signaling messages
    const handleSignalingMessage = async (message: any) => {
        if (!peerConnectionRef.current) {
            await initializePeerConnection();
        }

        const pc = peerConnectionRef.current;
        if (!pc) return;

        try {
            if (message.type === "offer") {
                await pc.setRemoteDescription(new RTCSessionDescription(message));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                sendSignalingMessage({
                    type: "answer",
                    sdp: pc.localDescription
                });
                setIsCallActive(true);
            } else if (message.type === "answer") {
                await pc.setRemoteDescription(new RTCSessionDescription(message));
            } else if (message.type === "candidate") {
                await pc.addIceCandidate(new RTCIceCandidate(message.candidate));
            } else if (message.type === "end-call") {
                endCall();
            }
        } catch (error) {
            console.error("Error handling signaling message:", error);
        }
    };

    // Send signaling message to the other peer
    const sendSignalingMessage = (message: any) => {
        if (!stompClientRef.current || !receiverEmail) return;

        stompClientRef.current.publish({
            destination: `/app/signal/${receiverEmail}`,
            body: JSON.stringify(message)
        });
    };

    // Initialize WebRTC peer connection
    const initializePeerConnection = async () => {
        // Create a new RTCPeerConnection
        const pc = new RTCPeerConnection({
            iceServers: [
                {urls: "stun:stun.l.google.com:19302"},
                {urls: "stun:stun1.l.google.com:19302"},
            ],
        });

        // Add local stream tracks to the connection
        if (localStream) {
            localStream.getTracks().forEach((track) => {
                pc.addTrack(track, localStream);
            });
        }

        // Create a new MediaStream for remote tracks
        const newRemoteStream = new MediaStream();
        setRemoteStream(newRemoteStream);

        // Add remote tracks to the remote stream when they arrive
        pc.ontrack = (event) => {
            event.streams[0].getTracks().forEach((track) => {
                newRemoteStream.addTrack(track);
            });
        };

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                sendSignalingMessage({
                    type: "candidate",
                    candidate: event.candidate,
                });
            }
        };

        // Handle connection state changes
        pc.onconnectionstatechange = () => {
            console.log("Connection state:", pc.connectionState);
            if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
                endCall();
            }
        };

        peerConnectionRef.current = pc;
        return pc;
    };

    // Start a call
    const startCall = async () => {
        if (!userEmail || !receiverEmail) {
            alert("Please enter both your email and the recipient's email");
            return;
        }

        try {
            if (!stompClientRef.current) {
                connectWebSocket();
            }

            if (!localStream) {
                const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
                setLocalStream(stream);
                originalStreamRef.current = stream;
            }

            const pc = await initializePeerConnection();

            // Create and send an offer
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            sendSignalingMessage({
                type: "offer",
                sdp: pc.localDescription
            });

            setIsCallActive(true);
        } catch (error) {
            console.error("Error starting call:", error);
            alert("Failed to start call. Please check console for details.");
        }
    };

    // End the call
    const endCall = () => {
        // Send end-call message to peer
        if (isCallActive) {
            sendSignalingMessage({type: "end-call"});
        }

        // Clean up peer connection
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }

        // Reset state
        setIsCallActive(false);
        setIsScreenSharing(false);

        // Stop screen sharing if active
        if (isScreenSharing && localStream) {
            localStream.getTracks().forEach(track => track.stop());

            // Restore original camera stream
            if (originalStreamRef.current) {
                setLocalStream(originalStreamRef.current);
            }
        }
    };

    // Toggle microphone
    const toggleMicrophone = () => {
        if (localStream) {
            const audioTracks = localStream.getAudioTracks();
            audioTracks.forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMuted(!isMuted);
        }
    };

    // Toggle camera
    const toggleCamera = () => {
        if (localStream) {
            const videoTracks = localStream.getVideoTracks();
            videoTracks.forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsVideoOff(!isVideoOff);
        }
    };

    // Toggle audio output
    const toggleAudio = () => {
        if (remoteStream) {
            const audioTracks = remoteStream.getAudioTracks();
            audioTracks.forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsAudioOff(!isAudioOff);
        }
    };

    // Toggle screen sharing
    const toggleScreenSharing = async () => {
        try {
            if (!isScreenSharing) {
                // Save current stream as original if not already saved
                if (!originalStreamRef.current && localStream) {
                    originalStreamRef.current = localStream;
                }

                // Get screen sharing stream
                const screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: true,
                    audio: true
                });

                // Replace tracks in the peer connection
                if (peerConnectionRef.current && localStream) {
                    const senders = peerConnectionRef.current.getSenders();
                    const videoSender = senders.find(sender =>
                        sender.track?.kind === 'video'
                    );

                    if (videoSender) {
                        videoSender.replaceTrack(screenStream.getVideoTracks()[0]);
                    }

                    // Handle screen sharing ended by user
                    screenStream.getVideoTracks()[0].onended = () => {
                        if (originalStreamRef.current && videoSender) {
                            const originalVideoTrack = originalStreamRef.current.getVideoTracks()[0];
                            if (originalVideoTrack) {
                                videoSender.replaceTrack(originalVideoTrack);
                            }
                            setIsScreenSharing(false);
                            setLocalStream(originalStreamRef.current);
                        }
                    };
                }

                setLocalStream(screenStream);
                setIsScreenSharing(true);
            } else {
                // Switch back to camera
                if (originalStreamRef.current) {
                    // Replace tracks in the peer connection
                    if (peerConnectionRef.current && localStream) {
                        const senders = peerConnectionRef.current.getSenders();
                        const videoSender = senders.find(sender =>
                            sender.track?.kind === 'video'
                        );

                        if (videoSender && originalStreamRef.current) {
                            const originalVideoTrack = originalStreamRef.current.getVideoTracks()[0];
                            if (originalVideoTrack) {
                                videoSender.replaceTrack(originalVideoTrack);
                            }
                        }
                    }

                    // Stop screen sharing tracks
                    if (localStream) {
                        localStream.getTracks().forEach(track => {
                            if (track.kind === 'video') {
                                track.stop();
                            }
                        });
                    }

                    setLocalStream(originalStreamRef.current);
                    setIsScreenSharing(false);
                }
            }
        } catch (error) {
            console.error("Error toggling screen sharing:", error);
        }
    };

    // Initialize local stream on component mount
    useEffect(() => {
        const initializeLocalStream = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
                setLocalStream(stream);
                originalStreamRef.current = stream;
            } catch (error) {
                console.error("Error accessing media devices:", error);
            }
        };

        initializeLocalStream();

        // Clean up on component unmount
        return () => {
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }

            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
            }

            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
            }
        };
    }, []);

    return (
        <div className="space-y-6">
            {!isCallActive ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Start a Video Call</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="userEmail" className="text-sm font-medium">Your Email</label>
                            <Input
                                id="userEmail"
                                type="email"
                                placeholder="your@email.com"
                                value={userEmail}
                                onChange={(e) => setUserEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="receiverEmail" className="text-sm font-medium">Recipient's Email</label>
                            <Input
                                id="receiverEmail"
                                type="email"
                                placeholder="recipient@email.com"
                                value={receiverEmail}
                                onChange={(e) => setReceiverEmail(e.target.value)}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={connectWebSocket} disabled={!userEmail || isConnected} className="mr-2">
                            {isConnected ? "Connected" : "Connect"}
                        </Button>
                        <Button onClick={startCall} disabled={!isConnected || !receiverEmail}>
                            Start Call
                        </Button>
                    </CardFooter>
                </Card>
            ) : (
                <div className="space-y-4">
                    <VideoDisplay
                        localStream={localStream}
                        remoteStream={remoteStream}
                        isVideoOff={isVideoOff}
                    />

                    <VideoControls
                        onEndCall={endCall}
                        onToggleMicrophone={toggleMicrophone}
                        onToggleCamera={toggleCamera}
                        onToggleAudio={toggleAudio}
                        onToggleScreenSharing={toggleScreenSharing}
                        isMuted={isMuted}
                        isVideoOff={isVideoOff}
                        isAudioOff={isAudioOff}
                        isScreenSharing={isScreenSharing}
                    />

                    <div className="text-center text-sm text-gray-500">
                        {isCallActive ? "Call in progress" : "Call ended"}
                    </div>
                </div>
            )}
        </div>
    );
}
