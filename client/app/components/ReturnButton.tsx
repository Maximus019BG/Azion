import React from 'react';
import {ArrowLeft} from "lucide-react";
import Link from "next/link";

const ReturnButton = () => {
    return (
        <div>
            <Link href="/dashboard" className="btn btn-outline btn-sm">
                <ArrowLeft className="mr-2 h-4 w-4"/>
                Back to Dashboard
            </Link>
        </div>
    );
};

export default ReturnButton;