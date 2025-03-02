"use client"
import {type FC, useCallback, useEffect, useRef, useState} from "react"
import {AlignCenter, AlignLeft, AlignRight, Bold, Italic, List, Underline} from "lucide-react"
import {debounce} from "@/lib/utils/debounce"

interface AzionEditorProps {
    value: string
    onChange: (value: string) => void
    className?: string
}

const AzionEditor: FC<AzionEditorProps> = ({value, onChange, className = ""}) => {
    const contentEditableRef = useRef<HTMLDivElement>(null)
    const [isFocused, setIsFocused] = useState(false)

    // Debounced onChange to improve performance
    const debouncedOnChange = useCallback(
        debounce((html: string) => {
            onChange(html)
        }, 100),
        [],
    )

    const applyFormatting = (command: string, value: string | undefined = undefined) => {
        // Save current selection
        const selection = window.getSelection()
        const range = selection?.getRangeAt(0)

        // Apply formatting
        document.execCommand(command, false, value)

        // Restore focus to the editor
        contentEditableRef.current?.focus()

        // Update parent with new content
        if (contentEditableRef.current) {
            debouncedOnChange(contentEditableRef.current.innerHTML)
        }
    }

    const handleInput = () => {
        if (contentEditableRef.current) {
            debouncedOnChange(contentEditableRef.current.innerHTML)
        }
    }

    // Only update the innerHTML when the value prop changes from outside
    useEffect(() => {
        if (contentEditableRef.current && contentEditableRef.current.innerHTML !== value) {
            contentEditableRef.current.innerHTML = value
        }
    }, [value])

    return (
        <div
            className={`w-full h-full flex flex-col overflow-hidden bg-background text-foreground rounded-md border ${className}`}
        >
            {/* Toolbar */}
            <div className="flex items-center p-2 bg-muted/30 border-b">
                <div className="flex space-x-1">
                    <button
                        onClick={() => applyFormatting("bold")}
                        className={`p-1.5 rounded-md hover:bg-muted transition ${
                            document.queryCommandState("bold") ? "bg-muted" : ""
                        }`}
                        title="Bold"
                        type="button"
                    >
                        <Bold size={16}/>
                    </button>
                    <button
                        onClick={() => applyFormatting("italic")}
                        className={`p-1.5 rounded-md hover:bg-muted transition ${
                            document.queryCommandState("italic") ? "bg-muted" : ""
                        }`}
                        title="Italic"
                        type="button"
                    >
                        <Italic size={16}/>
                    </button>
                    <button
                        onClick={() => applyFormatting("underline")}
                        className={`p-1.5 rounded-md hover:bg-muted transition ${
                            document.queryCommandState("underline") ? "bg-muted" : ""
                        }`}
                        title="Underline"
                        type="button"
                    >
                        <Underline size={16}/>
                    </button>
                </div>

                <div className="h-4 w-px bg-border mx-2"/>

                <div className="flex space-x-1">
                    <button
                        onClick={() => applyFormatting("justifyLeft")}
                        className="p-1.5 rounded-md hover:bg-muted transition"
                        title="Align Left"
                        type="button"
                    >
                        <AlignLeft size={16}/>
                    </button>
                    <button
                        onClick={() => applyFormatting("justifyCenter")}
                        className="p-1.5 rounded-md hover:bg-muted transition"
                        title="Align Center"
                        type="button"
                    >
                        <AlignCenter size={16}/>
                    </button>
                    <button
                        onClick={() => applyFormatting("justifyRight")}
                        className="p-1.5 rounded-md hover:bg-muted transition"
                        title="Align Right"
                        type="button"
                    >
                        <AlignRight size={16}/>
                    </button>
                </div>

                <div className="h-4 w-px bg-border mx-2"/>

                <div className="flex space-x-1">
                    <button
                        onClick={() => applyFormatting("insertUnorderedList")}
                        className="p-1.5 rounded-md hover:bg-muted transition"
                        title="Bullet List"
                        type="button"
                    >
                        <List size={16}/>
                    </button>
                </div>
            </div>

            {/* Editable Area */}
            <div
                ref={contentEditableRef}
                className={`w-full flex-grow p-4 outline-none overflow-auto text-base transition-colors ${
                    isFocused ? "bg-background" : "bg-background"
                }`}
                contentEditable
                onInput={handleInput}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                suppressContentEditableWarning={true}
                spellCheck={true}
            />
        </div>
    )
}

export default AzionEditor

