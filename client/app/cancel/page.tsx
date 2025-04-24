"use client"
import {useRouter} from "next/navigation"
import {AlertTriangle} from "lucide-react"

export default function CancelPage() {
    const router = useRouter()

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#050505]">
            <div
                className="w-full max-w-md rounded-lg bg-[#0a0a0a] border border-[#222] overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                <div className="p-6 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="h-16 w-16 rounded-full bg-[#450a0a] flex items-center justify-center">
                            <AlertTriangle className="h-8 w-8 text-[#ef4444]"/>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">Transaction Failed</h2>
                    <p className="text-gray-400 mb-6">
                        We were unable to process your payment. Please check your payment details and try again.
                    </p>

                    <div className="space-y-4 mt-2 text-center">
                        <p className="text-white">Common reasons for payment failures:</p>
                        <ul className="text-sm text-gray-400 space-y-1 text-left list-disc list-inside">
                            <li>Insufficient funds</li>
                            <li>Incorrect card information</li>
                            <li>Card expired or declined</li>
                            <li>Bank security restrictions</li>
                        </ul>
                    </div>
                </div>

                <div className="p-6 bg-[#111] border-t border-[#222]">
                    <div className="space-y-3">
                        <button
                            onClick={() => router.push("/billing")}
                            className="w-full py-3 px-4 rounded-md bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-medium transition-all duration-300 shadow-[0_0_15px_rgba(14,165,233,0.3)] hover:shadow-[0_0_20px_rgba(14,165,233,0.5)]"
                        >
                            Try Again
                        </button>
                        <button
                            className="w-full py-3 px-4 rounded-md bg-transparent border border-[#333] hover:border-[#0ea5e9] text-gray-300 hover:text-[#0ea5e9] font-medium transition-all duration-300 hover:shadow-[0_0_10px_rgba(14,165,233,0.2)]"
                            onClick={() => (window.location.href = "mailto:support@azion.com")}
                        >
                            Contact Support
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
