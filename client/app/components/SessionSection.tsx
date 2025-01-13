import React from 'react';
import Link from 'next/link';

const SessionSection = () => {
    return (
        <div
            className="w-fit h-full relative bg-base-300 rounded-xl flex flex-col justify-between p-8 text-white shadow-lg">
            <Link href="/account/sessions">
                <button>
                    Session
                </button>
            </Link>
        </div>
    );
};

export default SessionSection;