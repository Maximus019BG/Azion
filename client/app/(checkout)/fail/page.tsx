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
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex items-center justify-center p-4">
            <Card className="w-full max-w-md border-0 bg-gray-800/50 backdrop-blur-sm">
                <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-red-900/20 flex items-center justify-center mb-4">
                        <AlertTriangle className="h-8 w-8 text-red-500"/>
                    </div>
                    <CardTitle className="text-2xl font-bold text-white">Transaction Failed</CardTitle>
                    <CardDescription className="text-gray-300">Your payment could not be processed</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="bg-gray-700/50 rounded-lg p-4 border border-red-900/30">
                        <h3 className="text-sm font-medium text-gray-300 mb-2">Error Details:</h3>
                        <p className="text-sm text-red-400">{errorMessage}</p>
                        {errorCode !== "unknown" && <p className="text-xs text-gray-400 mt-2">Error code: {errorCode}</p>}
                    </div>

                    <div className="bg-gray-700/50 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-gray-300 mb-2">What happened?</h3>
                        <ul className="text-sm text-gray-300 space-y-2 list-disc pl-5">
                            <li>Your payment may have been declined by your bank</li>
                            <li>There might be an issue with your payment method</li>
                            <li>The transaction timed out or was interrupted</li>
                            <li>Our payment system encountered a temporary error</li>
                        </ul>
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button className="bg-accent hover:bg-accent-content" size="sm" asChild>
                        <Link href="/">
                            <ArrowLeft className="mr-2 h-4 w-4"/>
                            Return Home
                        </Link>
                    </Button>
                    <Button size="sm" className="bg-accent hover:bg-accent-content">
                        Try Again
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

export default function TransactionFailed() {
    return (
        <Suspense fallback={<div className="text-white">Loading...</div>}>
            <TransactionFailedContent/>
        </Suspense>
    )
}