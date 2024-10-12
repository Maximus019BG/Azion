import React, {useState} from 'react';

const MeetingCard = () => {

    const [nameMeeting, setNameMeeting] = useState<string>('');
    const [hourMeeting, setHourMeeting] = useState<string>('');
    const [dateMeeting, setDateMeeting] = useState<string>('');

    return (
        <div className="flex justify-around w-full h-fit py-2 border-2 border-accent rounded-md">
            <div>Name</div>
            <div>15:30</div>
            <div>18.11.24</div>
        </div>
    );
};

export default MeetingCard;