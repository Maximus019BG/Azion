"use client";
import React, { FC, useState, useRef, useEffect } from "react";

interface AzionEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const AzionEditor: FC<AzionEditorProps> = ({ value, onChange }) => {
  const contentEditableRef = useRef<HTMLDivElement>(null);

  const applyFormatting = (command: string) => {
    document.execCommand(command, false);
  };

  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      return selection.getRangeAt(0);
    }
    return null;
  };

  const restoreSelection = (range: Range | null) => {
    if (range) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  };

  const handleInput = () => {
    if (contentEditableRef.current) {
      onChange(contentEditableRef.current.innerHTML);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.ctrlKey && e.key === 'z') {
      e.preventDefault();
    }
  };

  const moveCursorToEnd = () => {
    const range = document.createRange();
    const selection = window.getSelection();
    if (contentEditableRef.current && selection) {
      range.selectNodeContents(contentEditableRef.current);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  useEffect(() => {
    if (contentEditableRef.current) {
      contentEditableRef.current.innerHTML = value;
    }
  }, [value]);

  useEffect(() => {
    moveCursorToEnd();
  }, [value]);

  return (
    <div className="w-screen h-full flex flex-col overflow-hidden">
      <div className="flex justify-center p-2 bg-gray-700 text-white">
        <button
          onClick={() => {
            const range = saveSelection();
            applyFormatting("bold");
            restoreSelection(range);
          }}
          className="mx-2"
        >
          Bold
        </button>
        <button
          onClick={() => {
            const range = saveSelection();
            applyFormatting("italic");
            restoreSelection(range);
          }}
          className="mx-2"
        >
          Italic
        </button>
        <button
          onClick={() => {
            const range = saveSelection();
            applyFormatting("underline");
            restoreSelection(range);
          }}
          className="mx-2"
        >
          Underline
        </button>
      </div>
      <div
        ref={contentEditableRef}
        className="w-full h-full p-4 bg-gray-800 text-white"
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

export default AzionEditor;