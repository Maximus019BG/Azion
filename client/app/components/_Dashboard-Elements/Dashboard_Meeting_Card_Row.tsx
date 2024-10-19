import React from "react";
import { Meeting } from "@/app/types/types";

interface DashboardMeetingCardRowProps {
  meetings: Meeting[];
}

const DashboardMeetingCardRow: React.FC<DashboardMeetingCardRowProps> = ({
  meetings,
}) => {
  const calculatePosition = (start: string, end: string) => {
    const [startHour, startMin] = start.split(":").map(Number);
    const [endHour, endMin] = end.split(":").map(Number);

    // Convert start and end time to minutes since 09:00
    const startInMinutes = (startHour - 9) * 60 + startMin;
    const endInMinutes = (endHour - 9) * 60 + endMin;

    // Total minutes from 09:00 to 21:00 (12 hours = 720 minutes)
    const totalMinutes = (21 - 9) * 60;

    // Calculate the top position as a percentage of the total time span
    const top = (startInMinutes / totalMinutes) * 100; // Top position in percentage
    const height = ((endInMinutes - startInMinutes) / totalMinutes) * 100; // Height in percentage

    return { top: `${top}%`, height: `${height}%` };
  };

  return (
    <div className="relative w-full h-full">
      {meetings.map((meeting, index) => {
        const { top, height } = calculatePosition(meeting.start, meeting.end);

        return (
          <div
            key={index}
            className="absolute left-0 w-full bg-blue-600 p-2 rounded-lg text-white shadow-lg flex justify-around items-centerl"
            style={{ top, height }}
          >
            <div className="w-full flex flex-col justify-around items-center">
              <h3 className="font-bold">{meeting.topic}</h3>
              <p>{meeting.description}</p>
            </div>
            <div className="w-full flex flex-col justify-around items-center">
              <p>
                {meeting.start} - {meeting.end}
              </p>
              {meeting.link && (
                <a href={meeting.link} className="text-blue-200 underline">
                  {meeting.link}
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardMeetingCardRow;
