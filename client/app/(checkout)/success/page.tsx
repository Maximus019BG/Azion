"use client"

import {useEffect, useState} from "react"
import axios from "axios"
import Cookies from "js-cookie"
import {useSearchParams} from "next/navigation"
import {apiUrl} from "@/app/api/config"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {ArrowLeft, CheckCircle, Loader2, XCircle} from "lucide-react"
import Link from "next/link"

export default function VerifyCheckoutCallback() {
    const searchParams = useSearchParams()
    const sessionId = searchParams.get("session_id")
    const [response, setResponse] = useState(null)
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (sessionId) {
            handleVerifyCheckout()
        }
    }, [sessionId])

    const handleVerifyCheckout = async () => {
        setIsLoading(true)
        setError(null)
        setResponse(null)

        try {
            const token = Cookies.get("azionAccessToken")
            const res = await axios.post(
                `${apiUrl}/verify-checkout`,
                {sessionId},
                {
                    headers: {
                        authorization: `${token}`,
                    },
                },
            )
            setResponse(res.data)
        } catch (err: any) {
            setError(err.response?.data || "An error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex items-center justify-center p-4">
            <Card className="w-full max-w-md border-0 bg-gray-800/50 backdrop-blur-sm">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-white">Payment Verification</CardTitle>
                    <CardDescription className="text-gray-300">We&apos;re processing your payment details</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                            <div className="relative">
                                <div className="h-16 w-16 rounded-full border-4 border-gray-700"></div>
                                <Loader2 className="absolute top-0 left-0 h-16 w-16 animate-spin text-primary"/>
                            </div>
                            <p className="text-gray-300 text-center">Verifying your payment...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center space-y-6 py-6">
                            <div className="h-20 w-20 rounded-full bg-red-900/20 flex items-center justify-center">
                                <XCircle className="h-12 w-12 text-red-500"/>
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-xl font-semibold text-white">Payment Failed</h3>
                                <p className="text-gray-300 text-sm">We couldn&apos;t process your payment. Please try again.</p>
                            </div>
                            <div className="bg-gray-700/50 rounded-lg p-4 w-full mt-4 overflow-auto max-h-40">
                                <h4 className="text-sm font-medium text-gray-300 mb-2">Error Details:</h4>
                                <pre className="text-xs text-red-400 whitespace-pre-wrap">{JSON.stringify(error, null, 2)}</pre>
                            </div>
                            <div className="flex gap-4 mt-4">
                                <Button className="bg-accent hover:bg-accent-content" size="sm" asChild>
                                    <Link href="/">
                                        <ArrowLeft className="mr-2 h-4 w-4"/>
                                        Return Home
                                    </Link>
                                </Button>
                                <Button onClick={handleVerifyCheckout} size="sm" className="bg-accent hover:bg-accent-content">
                                    Try Again
                                </Button>
                            </div>
                        </div>
                    ) : response ? (
                        <div className="flex flex-col items-center space-y-6 py-6">
                            <div className="h-20 w-20 rounded-full bg-green-900/20 flex items-center justify-center">
                                <CheckCircle className="h-12 w-12 text-green-500"/>
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-xl font-semibold text-white">Payment Successful</h3>
                                <p className="text-gray-300 text-sm">
                                    Thank you for your purchase. Your order has been processed successfully.
                                </p>
                            </div>
                            <div className="bg-gray-700/50 rounded-lg p-4 w-full mt-4 overflow-auto max-h-40">
                                <h4 className="text-sm font-medium text-gray-300 mb-2">Order Details:</h4>
                                <pre className="text-xs text-gray-300 whitespace-pre-wrap">{JSON.stringify(response, null, 2)}</pre>
                            </div>
                            <Button className="mt-4" asChild>
                                <Link href="/">
                                    <ArrowLeft className="mr-2 h-4 w-4"/>
                                    Return to Dashboard
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8">
                            <p className="text-gray-300 text-center">No session ID found. Please try again.</p>
                            <Button className="mt-4" asChild>
                                <Link href="/">Return Home</Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
