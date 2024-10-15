import React from 'react';
import {Meeting} from '@/app/types/types';

interface DashboardMeetingCardRowProps {
    meetings: Meeting[];
}

const DashboardMeetingCardRow: React.FC<DashboardMeetingCardRowProps> = ({meetings}) => {
    return (
        <div className="flex justify-center items-center gap-4">
            {meetings.map((meeting, index) => (
                <div key={index} className="p-4 bg-gray-800 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-white">{meeting.topic}</h3>
                    <p className="text-sm text-gray-400">{meeting.description}</p>
                    <p className="text-sm text-gray-400">{meeting.dayOfWeek}</p>
                    <p className="text-sm text-gray-400">{meeting.startHour} - {meeting.endHour}</p>
                    <a href={meeting.link} className="text-blue-500 hover:underline">{meeting.link}</a>
                </div>
            ))}
        </div>
    );
};

export default DashboardMeetingCardRow;