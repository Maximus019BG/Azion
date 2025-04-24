"use client"
import type React from "react"
import {Minus, Plus} from "lucide-react"

interface QuantitySelectorProps {
    quantity: number
    setQuantity: (quantity: number) => void
    min?: number
    max?: number
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({quantity, setQuantity, min = 1, max = 100}) => {
    const handleIncrement = () => {
        if (quantity < max) {
            setQuantity(quantity + 1)
        }
    }

    const handleDecrement = () => {
        if (quantity > min) {
            setQuantity(quantity - 1)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number.parseInt(e.target.value)
        if (!isNaN(value) && value >= min && value <= max) {
            setQuantity(value)
        }
    }

    return (
        <div className="flex items-center">
            <button
                onClick={handleDecrement}
                disabled={quantity <= min}
                className="h-9 w-9 flex items-center justify-center rounded-l-md bg-[#111] border border-[#333] text-gray-400 hover:text-[#0ea5e9] hover:border-[#0ea5e9] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
                <Minus className="h-4 w-4"/>
                <span className="sr-only">Decrease quantity</span>
            </button>

            <input
                type="number"
                value={quantity}
                onChange={handleChange}
                min={min}
                max={max}
                className="h-9 w-16 bg-[#111] border-y border-[#333] text-center text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none"
            />

            <button
                onClick={handleIncrement}
                disabled={quantity >= max}
                className="h-9 w-9 flex items-center justify-center rounded-r-md bg-[#111] border border-[#333] text-gray-400 hover:text-[#0ea5e9] hover:border-[#0ea5e9] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
                <Plus className="h-4 w-4"/>
                <span className="sr-only">Increase quantity</span>
            </button>
        </div>
    )
}

export default QuantitySelector
