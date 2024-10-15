import React from 'react';
import DashboardMeetingCardRow from "@/app/components/_Dashboard-Elements/Dashboard_Meeting_Card_Row";
import {Meeting} from '@/app/types/types';

interface DashboardProgramCardProps {
    meetings: Meeting[];
}

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const DashboardProgramCard: React.FC<DashboardProgramCardProps> = ({meetings}) => {
    return (
        <div className="w-full h-full bg-[#090909] rounded-md flex flex-col relative">
            <div className="w-full h-full flex flex-col justify-start items-center">
                <div className="w-full flex justify-between items-center p-4 bg-gray-800 rounded-t-md">
                    {daysOfWeek.map(day => (
                        <div key={day} className="text-white font-bold">{day}</div>
                    ))}
                </div>
                <div>
                    <DashboardMeetingCardRow meetings={meetings}/>
                </div>
            </div>
            <div className="absolute w-fit h-full flex flex-col justify-around items-center rounded-xl p-3">
                {["9:00", "10:00", "11:00", "12:00", "14:00", "17:00", "21:00"].map(time => (
                    <p key={time}>{time}</p>
                ))}
            </div>
        </div>
    );
};

export default DashboardProgramCard;