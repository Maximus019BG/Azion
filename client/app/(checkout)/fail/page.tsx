"use client"
import {Suspense} from "react"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import {AlertTriangle, ArrowLeft} from "lucide-react"
import Link from "next/link"
import {useSearchParams} from "next/navigation"

function TransactionFailedContent() {
    const searchParams = useSearchParams()
    const errorCode = searchParams.get("code") || "unknown"
    const errorMessage =
        searchParams.get("message") || "We couldn't process your transaction. Please try again or contact support."

    return (
        <div
            className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#020617] text-white flex items-center justify-center p-4">
            <Card
                className="w-full max-w-md border border-[#1e293b] bg-[#0f172a]/80 backdrop-blur-sm shadow-[0_0_25px_rgba(14,165,233,0.15)] overflow-hidden">
                <div
                    className="absolute inset-0 bg-gradient-to-br from-[#0ea5e9]/10 to-transparent opacity-50 pointer-events-none"></div>

                <CardHeader className="text-center relative z-10">
                    <div
                        className="mx-auto w-20 h-20 rounded-full bg-red-900/20 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                        <AlertTriangle className="h-10 w-10 text-red-500"/>
                    </div>
                    <CardTitle
                        className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                        Transaction Failed
                    </CardTitle>
                    <CardDescription className="text-gray-300">Your payment could not be processed</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6 relative z-10">
                    <div
                        className="bg-[#1e293b]/50 rounded-lg p-5 border border-red-900/30 shadow-inner transform transition-all duration-300 hover:shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                        <h3 className="text-sm font-medium text-gray-300 mb-2">Error Details:</h3>
                        <p className="text-sm text-red-400">{errorMessage}</p>
                        {errorCode !== "unknown" &&
                            <p className="text-xs text-gray-400 mt-2">Error code: {errorCode}</p>}
                    </div>

                    <div className="bg-[#1e293b]/50 rounded-lg p-5 shadow-inner">
                        <h3 className="text-sm font-medium text-gray-300 mb-3">What happened?</h3>
                        <ul className="text-sm text-gray-300 space-y-2.5 list-disc pl-5">
                            <li>Your payment may have been declined by your bank</li>
                            <li>There might be an issue with your payment method</li>
                            <li>The transaction timed out or was interrupted</li>
                            <li>Our payment system encountered a temporary error</li>
                        </ul>
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center pb-6 relative z-10">
                    <Button
                        className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white shadow-[0_0_10px_rgba(14,165,233,0.3)] hover:shadow-[0_0_15px_rgba(14,165,233,0.4)] transition-all duration-300"
                        size="default"
                        asChild
                    >
                        <Link href="/">
                            <ArrowLeft className="mr-2 h-4 w-4"/>
                            Return Home
                        </Link>
                    </Button>
                    <Button
                        size="default"
                        className="bg-[#1e293b] hover:bg-[#334155] text-white border border-[#0ea5e9]/30 hover:border-[#0ea5e9] transition-all duration-300"
                    >
                        Try Again
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

export default function TransactionFailed() {
    return (
        <Suspense
            fallback={
                <div
                    className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#020617] text-white flex items-center justify-center">
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="h-20 w-20 bg-[#1e293b] rounded-full mb-4"></div>
                        <div className="h-6 w-40 bg-[#1e293b] rounded mb-3"></div>
                        <div className="h-4 w-60 bg-[#1e293b] rounded"></div>
                    </div>
                </div>
            }
        >
            <TransactionFailedContent/>
        </Suspense>
    )
}
