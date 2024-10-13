import React from 'react';
import Meeting_Card from "@/app/components/Meeting_Card";


const DashboardMeetingsCard = () => {
    return (
        <div className="bg-base-300 w-96 h-fit rounded-md flex flex-col justify-center items-center gap-7 p-6">
            <h1 className="w-full flex justify-center items-center text-xl text-gray-300 font-bold">Meetings</h1>
            <div className="w-full flex flex-col justify-center items-center gap-3">
                <Meeting_Card/>
                <Meeting_Card/>
                <Meeting_Card/>
            </div>
        </div>
    );
};

export default DashboardMeetingsCard;