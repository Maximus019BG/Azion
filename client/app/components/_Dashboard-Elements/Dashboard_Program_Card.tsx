import React from 'react';
import DashboardMeetingCardRow from "@/app/components/_Dashboard-Elements/Dashboard_Meeting_Card_Row";
import { Meeting } from '@/app/types/types';

interface DashboardProgramCardProps {
    meetings: Meeting[];
}

const daysOfWeek = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
const DashboardProgramCard: React.FC<DashboardProgramCardProps> = ({ meetings }) => {

    const getMeetingsForDay = (day: string) => {
        return meetings.filter(meeting => 
            meeting.day && meeting.day.toUpperCase() === day
        );
    };

    return (
        <div className="w-full h-full bg-[#090909] rounded-md flex flex-col relative">
            <div className="w-full h-full flex flex-col justify-start items-center">
                <div className="w-full flex justify-between items-center p-4 bg-gray-800 rounded-t-md">
                    {daysOfWeek.map(day => (
                        <div key={day} className="text-white font-bold w-1/5 text-center">{day}</div>
                    ))}
                </div>
                <div className="w-full flex justify-between ml-24">
                    {daysOfWeek.map(day => (
                        <div key={day} className="w-1/5 relative h-[800px] border-l border-gray-700">
                            {getMeetingsForDay(day).length > 0 ? (
                                <DashboardMeetingCardRow meetings={getMeetingsForDay(day)} />
                            ) : (
                                <p className="text-gray-400 text-center">No meetings</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            {/* Hour labels on the left */}
            <div className="absolute w-fit h-full flex flex-col justify-around items-center left-0 text-gray-500 top-10">
                {["9:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"].map(time => (
                    <p key={time}>{time}</p>
                ))}
            </div>
        </div>
    );
};

export default DashboardProgramCard;