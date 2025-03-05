import React from 'react';
import {ArrowLeft} from "lucide-react";
import Link from "next/link";

interface Btn {
    to: string;
}

const ReturnButton: React.FC<Btn> = ({to}) => {
    return (
        <div>
            <Link href={to} className="btn hover:bg-lightAccent hover:border-lightAccent btn-outline btn-sm">
                <ArrowLeft className="mr-2 h-4 w-4"/>
                <h1>Back</h1>
            </Link>
        </div>
    );
};

export default ReturnButton;