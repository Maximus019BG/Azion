"use client"
import {useEffect, useState} from "react"

export default function BackgroundGrid() {
    const [mousePosition, setMousePosition] = useState({x: 0, y: 0})

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({x: e.clientX, y: e.clientY})
        }

        window.addEventListener("mousemove", handleMouseMove)
        return () => window.removeEventListener("mousemove", handleMouseMove)
    }, [])

    return (
        <div className="fixed inset-0 z-0 opacity-10 pointer-events-none overflow-hidden">
            <div
                className="absolute inset-0 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(14,165,233,0.1),transparent_50%)]"
                style={
                    {
                        "--x": `${mousePosition.x}px`,
                        "--y": `${mousePosition.y}px`,
                    } as any
                }
            />
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" width="100%"
                 height="100%">
                <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"
                             patternTransform="rotate(45)">
                        <rect width="100%" height="100%" fill="none"/>
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"/>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)"/>
            </svg>
        </div>
    )
}
