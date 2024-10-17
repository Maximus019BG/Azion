import React from 'react';
import { Meeting } from '@/app/types/types';

interface DashboardMeetingCardRowProps {
    meetings: Meeting[];
}

const DashboardMeetingCardRow: React.FC<DashboardMeetingCardRowProps> = ({ meetings }) => {
    // Function to calculate the top position and height based on meeting time
    const calculatePosition = (start: string, end: string) => {
        const [startHour, startMin] = start.split(':').map(Number);
        const [endHour, endMin] = end.split(':').map(Number);
        
        // Assuming a 12-hour block starting from 9:00 to 21:00
        const startInMinutes = (startHour - 9) * 60 + startMin; // 9:00 as the base time
        const endInMinutes = (endHour - 9) * 60 + endMin;

        // Top position is based on the start time in percentage of the total block
        const top = (startInMinutes / (12 * 60)) * 100; // 12 hours total (9:00 to 21:00)
        // Height is the difference between end and start time in percentage
        const height = ((endInMinutes - startInMinutes) / (12 * 60)) * 100;

        return { top: `${top}%`, height: `${height}%` };
    };

    return (
        <div className="relative w-full h-full">
            {meetings.map((meeting, index) => {
                const { top, height } = calculatePosition(meeting.start, meeting.end);
                
                return (
                    <div
                        key={index}
                        className="absolute left-0 w-full bg-blue-600 p-2 rounded-lg text-white shadow-lg"
                        style={{ top, height }}
                    >
                        <h3 className="font-bold">{meeting.topic}</h3>
                        <p>{meeting.description}</p>
                        <p>{meeting.start} - {meeting.end}</p>
                        <a href={meeting.link} className="text-blue-200 underline">{meeting.link}</a>
                    </div>
                );
            })}
        </div>
    );
};

export default DashboardMeetingCardRow;