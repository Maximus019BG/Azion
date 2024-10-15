import React from 'react';
import {Meeting} from '@/app/types/types';

interface DashboardMeetingCardRowProps {
    meetings: Meeting[];
}

const DashboardMeetingCardRow: React.FC<DashboardMeetingCardRowProps> = ({meetings}) => {
    return (
        <div className="w-[75vw] h-[100vh] bg-base-300 flex justify-evenly items-center rounded-xl">
            {meetings.length > 0 ? (
                meetings.map((meeting) => (
                    <div key={meeting.id}
                         className="w-full h-full flex flex-col justify-start items-center border-r-2 border-gray-300">
                        <h1 className="bg-base-100 w-full p-2 flex justify-center items-center">{meeting.date}</h1>
                        <div className="bg-base-300 w-full h-full grid grid-rows-auto gap-2 p-3">
                            <div className="bg-[#101010] w-full h-full rounded-md p-2">
                                <p className="text-red-600">{meeting.time}</p>
                                <p>{meeting.title}</p>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-gray-500">No meetings available</div>
            )}
        </div>
    );
};

export default DashboardMeetingCardRow;