"use client";
import {useState} from "react";
import VideoChatComponent from "./VideoChat";

export default function VideoChatPage() {
    const [remoteUserId, setRemoteUserId] = useState("");

    return (
        <div className="min-h-screen bg-zinc-950 p-4 text-white">
            <div className="mb-6">
                <label htmlFor="remote-id" className="block mb-2 font-medium">
                    Enter Remote User ID:
                </label>
                <input
                    id="remote-id"
                    type="text"
                    value={remoteUserId}
                    onChange={(e) => setRemoteUserId(e.target.value)}
                    className="p-2 w-full rounded bg-zinc-800 border border-zinc-700 text-white"
                    placeholder="remote@example.com"
                />
            </div>

            {remoteUserId && <VideoChatComponent remoteUserId={remoteUserId}/>}
        </div>
    );
}