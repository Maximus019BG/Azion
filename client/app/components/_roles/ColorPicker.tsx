"use client"

import type React from "react"
import {useEffect, useState} from "react"
import {Check} from "lucide-react"

interface ColorPickerProps {
    color: string
    setColor: (color: string) => void
    setIsSaveEnabled: (enabled: boolean) => void
}

const ColorPicker: React.FC<ColorPickerProps> = ({color, setColor, setIsSaveEnabled}) => {
    const [selectedColor, setSelectedColor] = useState<string>(color)

    useEffect(() => {
        setSelectedColor(color)
    }, [color])

    // Main color palettes with their gradients
    const colorPalettes = [
        // Blue palette (first for emphasis)
        [
            {name: "Blue 50", value: "#eff6ff"},
            {name: "Blue 100", value: "#dbeafe"},
            {name: "Blue 200", value: "#bfdbfe"},
            {name: "Blue 300", value: "#93c5fd"},
            {name: "Blue 400", value: "#60a5fa"},
            {name: "Blue 500", value: "#3b82f6"},
            {name: "Blue 600", value: "#2563eb"},
            {name: "Blue 700", value: "#1d4ed8"},
            {name: "Blue 800", value: "#1e40af"},
            {name: "Blue 900", value: "#1e3a8a"},
        ],
        // Red palette
        [
            {name: "Red 50", value: "#fef2f2"},
            {name: "Red 100", value: "#fee2e2"},
            {name: "Red 200", value: "#fecaca"},
            {name: "Red 300", value: "#fca5a5"},
            {name: "Red 400", value: "#f87171"},
            {name: "Red 500", value: "#ef4444"},
            {name: "Red 600", value: "#dc2626"},
            {name: "Red 700", value: "#b91c1c"},
            {name: "Red 800", value: "#991b1b"},
            {name: "Red 900", value: "#7f1d1d"},
        ],
        // Green palette
        [
            {name: "Green 50", value: "#f0fdf4"},
            {name: "Green 100", value: "#dcfce7"},
            {name: "Green 200", value: "#bbf7d0"},
            {name: "Green 300", value: "#86efac"},
            {name: "Green 400", value: "#4ade80"},
            {name: "Green 500", value: "#22c55e"},
            {name: "Green 600", value: "#16a34a"},
            {name: "Green 700", value: "#15803d"},
            {name: "Green 800", value: "#166534"},
            {name: "Green 900", value: "#14532d"},
        ],
        // Purple palette
        [
            {name: "Purple 50", value: "#faf5ff"},
            {name: "Purple 100", value: "#f3e8ff"},
            {name: "Purple 200", value: "#e9d5ff"},
            {name: "Purple 300", value: "#d8b4fe"},
            {name: "Purple 400", value: "#c084fc"},
            {name: "Purple 500", value: "#a855f7"},
            {name: "Purple 600", value: "#9333ea"},
            {name: "Purple 700", value: "#7e22ce"},
            {name: "Purple 800", value: "#6b21a8"},
            {name: "Purple 900", value: "#581c87"},
        ],
        // Yellow palette
        [
            {name: "Yellow 50", value: "#fefce8"},
            {name: "Yellow 100", value: "#fef9c3"},
            {name: "Yellow 200", value: "#fef08a"},
            {name: "Yellow 300", value: "#fde047"},
            {name: "Yellow 400", value: "#facc15"},
            {name: "Yellow 500", value: "#eab308"},
            {name: "Yellow 600", value: "#ca8a04"},
            {name: "Yellow 700", value: "#a16207"},
            {name: "Yellow 800", value: "#854d0e"},
            {name: "Yellow 900", value: "#713f12"},
        ],
        // Gray palette
        [
            {name: "Gray 50", value: "#f9fafb"},
            {name: "Gray 100", value: "#f3f4f6"},
            {name: "Gray 200", value: "#e5e7eb"},
            {name: "Gray 300", value: "#d1d5db"},
            {name: "Gray 400", value: "#9ca3af"},
            {name: "Gray 500", value: "#6b7280"},
            {name: "Gray 600", value: "#4b5563"},
            {name: "Gray 700", value: "#374151"},
            {name: "Gray 800", value: "#1f2937"},
            {name: "Gray 900", value: "#111827"},
        ],
    ]

    const handleColorSelect = (colorValue: string) => {
        setSelectedColor(colorValue)
        setColor(colorValue)
        setIsSaveEnabled(true)
    }

    return (
        <div className="w-full py-2 overflow-y-auto">
            {/* Color preview */}
            <div className="mb-6 flex items-center gap-4">
                <div
                    className="w-14 h-14 rounded-full border-2 border-white shadow-md"
                    style={{backgroundColor: selectedColor}}
                ></div>
                <div>
                    <div className="text-base font-medium text-white">{selectedColor.toUpperCase()}</div>
                    <div className="text-sm text-gray-400">Selected color</div>
                </div>
            </div>

            {/* Color palettes */}
            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {colorPalettes.map((palette, paletteIndex) => (
                    <div key={paletteIndex} className="space-y-3">
                        <div className="text-xs text-blue-400 uppercase tracking-wider font-semibold">
                            {palette[5].name.split(" ")[0]} Palette
                        </div>
                        <div className="grid grid-cols-5 gap-3">
                            {palette.map((colorObj, colorIndex) => (
                                <button
                                    key={colorIndex}
                                    className={`
                                      w-full aspect-square rounded-lg relative
                                      hover:scale-105 transition-transform duration-150
                                      ${selectedColor === colorObj.value ? "ring-2 ring-white ring-offset-2 ring-offset-[#0c0c14]" : ""}
                                      shadow-md
                                    `}
                                    style={{backgroundColor: colorObj.value}}
                                    onClick={() => handleColorSelect(colorObj.value)}
                                    title={`${colorObj.name}: ${colorObj.value}`}
                                >
                                    {selectedColor === colorObj.value && (
                                        <Check
                                            className={`
                                              absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-4 w-4
                                              ${colorIndex < 5 ? "text-gray-900" : "text-white"}
                                            `}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Custom color input */}
            <div className="mt-6 bg-[#0c0c14] p-3 rounded-lg border border-[#1a1a2e]">
                <label className="text-xs text-blue-400 block mb-2">Custom Color</label>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                    <input
                        type="color"
                        value={selectedColor}
                        onChange={(e) => handleColorSelect(e.target.value)}
                        className="w-full sm:w-10 h-10 rounded cursor-pointer bg-transparent"
                    />
                    <input
                        type="text"
                        value={selectedColor}
                        onChange={(e) => handleColorSelect(e.target.value)}
                        className="w-full sm:flex-1 bg-[#1a1a2e] border border-blue-900/30 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="#RRGGBB"
                    />
                </div>
            </div>
        </div>
    )
}

export default ColorPicker
