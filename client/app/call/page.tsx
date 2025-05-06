import VideoChat from "./VideoChat";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
            <div className="w-full max-w-6xl space-y-8">
                <h1 className="text-3xl font-bold text-center">WebRTC Video Chat Demo</h1>
                <p className="text-center text-gray-600 mb-8">
                    Enter your email and the recipient&apos;s email to start a video call
                </p>

                <VideoChat/>
            </div>
        </main>
    );
}
