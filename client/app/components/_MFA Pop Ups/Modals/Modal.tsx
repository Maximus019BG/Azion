import React from "react";

const Modal = ({isOpen, onClose, children}: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) => {
    if (!isOpen) return null;

    const handleOutsideClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto"
             onClick={handleOutsideClick}>
            <div
                className="bg-black shadow-2xl border-gray-700 w-full max-w-lg h-auto rounded-2xl p-4 flex flex-col justify-center items-center overflow-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-2 right-2 text-white text-2xl">
                    &times;
                </button>
                {children}
            </div>
        </div>
    );
};

export default Modal;