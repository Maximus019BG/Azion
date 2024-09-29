import React, { useState } from 'react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { HiDotsVertical } from "react-icons/hi";

interface SortMenuProps {
    sortCriteria: string;
    sortOrder: string;
    setSortCriteria: (criteria: string) => void;
    setSortOrder: (order: string) => void;
}

const SortMenu: React.FC<SortMenuProps> = ({ sortCriteria, sortOrder, setSortCriteria, setSortOrder }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="fixed top-10 right-10">
            <button
                className="bg-gray-800 text-white p-2 w-36 rounded shadow-lg flex items-center justify-center hover:bg-gray-600"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
                Sort by <HiDotsVertical />
            </button>
            {isMenuOpen && (
                <div className="bg-gray-800 text-white p-4 rounded shadow-lg mt-2 flex flex-col gap-y-3">
                    <button className=" flex justify-between items-center gap-2" onClick={() => {
                        setSortCriteria("date");
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    }}>
                        Date {sortCriteria === "date" && (sortOrder === "asc" ? <FaArrowDown /> : <FaArrowUp />)}
                    </button>
                    <button className="flex justify-between gap-2" onClick={() => {
                        setSortCriteria("priority");
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    }}>
                        Priority {sortCriteria === "priority" && (sortOrder === "asc" ? <FaArrowDown /> : <FaArrowUp />)}
                    </button>
                    <button className="flex justify-between gap-2" onClick={() => {
                        setSortCriteria("status");
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    }}>
                        Status {sortCriteria === "status" && (sortOrder === "asc" ? <FaArrowDown /> : <FaArrowUp />)}
                    </button>
                </div>
            )}
        </div>
    );
};

export default SortMenu;