"use client"

import {Suspense, useEffect, useState} from "react"
import axios from "axios"
import Cookies from "js-cookie"
import {useSearchParams} from "next/navigation"
import {apiUrl} from "@/app/api/config"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {ArrowLeft, CheckCircle, Loader2, XCircle} from "lucide-react"
import Link from "next/link"

function VerifyCheckoutCallback() {
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
        <div
            className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#020617] text-white flex items-center justify-center p-4">
            <Card
                className="w-full max-w-md border border-[#1e293b] bg-[#0f172a]/80 backdrop-blur-sm shadow-[0_0_25px_rgba(14,165,233,0.15)] overflow-hidden">
                <div
                    className="absolute inset-0 bg-gradient-to-br from-[#0ea5e9]/10 to-transparent opacity-50 pointer-events-none"></div>

                <CardHeader className="text-center relative z-10">
                    <CardTitle
                        className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                        Payment Verification
                    </CardTitle>
                    <CardDescription className="text-gray-300">We&apos;re processing your payment
                        details</CardDescription>
                </CardHeader>

                <CardContent className="relative z-10">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-6">
                            <div className="relative">
                                <div className="h-20 w-20 rounded-full border-4 border-[#1e293b]"></div>
                                <div
                                    className="absolute top-0 left-0 h-20 w-20 rounded-full border-4 border-t-[#0ea5e9] animate-spin"></div>
                            </div>
                            <p className="text-gray-300 text-center animate-pulse">Verifying your payment...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center space-y-6 py-6">
                            <div
                                className="h-20 w-20 rounded-full bg-red-900/20 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                                <XCircle className="h-12 w-12 text-red-500"/>
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                    Payment Failed
                                </h3>
                                <p className="text-gray-300 text-sm">We couldn&apos;t process your payment. Please try
                                    again.</p>
                            </div>
                            <div
                                className="bg-[#1e293b]/50 rounded-lg p-5 w-full mt-4 overflow-auto max-h-40 border border-red-900/30 shadow-inner">
                                <h4 className="text-sm font-medium text-gray-300 mb-2">Error Details:</h4>
                                <pre
                                    className="text-xs text-red-400 whitespace-pre-wrap">{JSON.stringify(error, null, 2)}</pre>
                            </div>
                            <div className="flex gap-4 mt-4">
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
                                    onClick={handleVerifyCheckout}
                                    size="default"
                                    className="bg-[#1e293b] hover:bg-[#334155] text-white border border-[#0ea5e9]/30 hover:border-[#0ea5e9] transition-all duration-300"
                                >
                                    Try Again
                                </Button>
                            </div>
                        </div>
                    ) : response ? (
                        <div className="flex flex-col items-center space-y-6 py-6">
                            <div
                                className="h-20 w-20 rounded-full bg-green-900/20 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                                <CheckCircle className="h-12 w-12 text-green-500"/>
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                    Payment Successful
                                </h3>
                                <p className="text-gray-300 text-sm">
                                    Thank you for your purchase. Your order has been processed successfully.
                                </p>
                            </div>
                            <div
                                className="bg-[#1e293b]/50 rounded-lg p-5 w-full mt-4 overflow-auto max-h-40 border border-green-900/30 shadow-inner">
                                <h4 className="text-sm font-medium text-gray-300 mb-2">Order Details:</h4>
                                <pre
                                    className="text-xs text-gray-300 whitespace-pre-wrap">{JSON.stringify(response, null, 2)}</pre>
                            </div>
                            <Button
                                className="mt-4 bg-[#0ea5e9] hover:bg-[#0284c7] text-white shadow-[0_0_10px_rgba(14,165,233,0.3)] hover:shadow-[0_0_15px_rgba(14,165,233,0.4)] transition-all duration-300"
                                asChild
                            >
                                <Link href="/">
                                    <ArrowLeft className="mr-2 h-4 w-4"/>
                                    Return to Dashboard
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 space-y-6">
                            <div className="h-20 w-20 rounded-full bg-[#1e293b]/50 flex items-center justify-center">
                                <Loader2 className="h-10 w-10 text-[#0ea5e9] animate-spin"/>
                            </div>
                            <p className="text-gray-300 text-center">No session ID found. Please try again.</p>
                            <Button
                                className="mt-4 bg-[#0ea5e9] hover:bg-[#0284c7] text-white shadow-[0_0_10px_rgba(14,165,233,0.3)] hover:shadow-[0_0_15px_rgba(14,165,233,0.4)] transition-all duration-300"
                                asChild
                            >
                                <Link href="/">Return Home</Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default function Page() {
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
            <VerifyCheckoutCallback/>
        </Suspense>
    )
}
