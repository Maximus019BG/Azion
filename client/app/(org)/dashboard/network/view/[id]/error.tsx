"use client"

import {useEffect} from "react"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import {AlertTriangle} from 'lucide-react'

export default function Error({
                                  error,
                                  reset,
                              }: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-950 p-4">
            <Card className="max-w-md w-full bg-gray-900 border-gray-800">
                <CardHeader>
                    <div className="flex items-center justify-center mb-4">
                        <div className="bg-red-900/20 p-3 rounded-full">
                            <AlertTriangle className="h-8 w-8 text-red-500"/>
                        </div>
                    </div>
                    <CardTitle className="text-center text-xl text-gray-100">Error Loading Network Data</CardTitle>
                    <CardDescription className="text-center text-gray-400">
                        There was a problem loading the network monitoring data.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-gray-300">
                    <p className="text-sm text-center">
                        {error.message || "An unexpected error occurred. Please try again later."}
                    </p>
                </CardContent>
                <CardFooter className="flex justify-center gap-4">
                    <Button
                        variant="outline"
                        onClick={() => window.history.back()}
                        className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800"
                    >
                        Go Back
                    </Button>
                    <Button
                        onClick={reset}
                        className="bg-blue-700 hover:bg-blue-600 text-white"
                    >
                        Try Again
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
