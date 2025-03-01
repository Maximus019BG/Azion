"use client";
import React, {FC, useEffect, useRef} from "react";
import {Bold, Italic, Underline} from "lucide-react";

interface AzionEditorProps {
    value: string;
    onChange: (value: string) => void;
}

const AzionEditor: FC<AzionEditorProps> = ({value, onChange}) => {
    const contentEditableRef = useRef<HTMLDivElement>(null);

    const applyFormatting = (command: string) => {
        document.execCommand(command, false);
    };

    const handleInput = () => {
        if (contentEditableRef.current) {
            onChange(contentEditableRef.current.innerHTML);
        }
    };

    useEffect(() => {
        if (contentEditableRef.current) {
            contentEditableRef.current.innerHTML = value;
        }
    }, [value]);

    return (
        <div className="w-full h-full flex flex-col overflow-hidden bg-background text-white">
            {/* Toolbar */}
            <div className="flex justify-center p-3 bg-base-100 shadow-md border-b border-gray-700">
                <button
                    onClick={() => applyFormatting("bold")}
                    className="p-2 mx-1 rounded-lg hover:bg-gray-700 transition"
                >
                    <Bold size={18}/>
                </button>
                <button
                    onClick={() => applyFormatting("italic")}
                    className="p-2 mx-1 rounded-lg hover:bg-gray-700 transition"
                >
                    <Italic size={18}/>
                </button>
                <button
                    onClick={() => applyFormatting("underline")}
                    className="p-2 mx-1 rounded-lg hover:bg-gray-700 transition"
                >
                    <Underline size={18}/>
                </button>
            </div>
            {/* Editable Area */}
            <div
                ref={contentEditableRef}
                className="w-full flex-grow p-4 bg-base-300 outline-none overflow-auto text-lg"
                contentEditable
                onInput={handleInput}
            />
        </div>
    );
};

export default AzionEditor;
