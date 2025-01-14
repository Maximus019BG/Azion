import React, {useEffect, useState} from 'react';
import ProfilePicture from "../components/Profile-picture";
import {UserData} from "../func/funcs";
import {FaPencilAlt} from 'react-icons/fa';

const AccountUserCard = () => {
    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [displayImage, setDisplayImage] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [isEditing, setIsEditing] = useState({name: false, email: false, dateOfBirth: false});

    useEffect(() => {
        UserData().then((response) => {
            setDisplayImage(response.profilePicture);
            setName(response.name);
            setEmail(response.email);
            setRole(response.role);
            setDateOfBirth(response.age.substring(0, 10));
        });
    }, []);

    const handleSave = () => {
        // Add logic to save the updated information
        setIsEditing({name: false, email: false, dateOfBirth: false});
    };

    return (
        <div
            className="w-full max-w-3xl mx-auto border-2 border-base-100 bg-base-300 rounded-lg shadow-md overflow-hidden">
            {/* MAIN SECTION */}
            <div className="p-8 border-b-2 border-base-100 flex justify-between items-center">
                <div className="flex flex-col justify-evenly h-full items-start">
                    <div className="flex items-center group">
                        {isEditing.name ? (
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="text-3xl w-fit gap-3 font-bold text-white bg-transparent border-b border-white focus:outline-none"
                            />
                        ) : (
                            <h1 className="text-3xl w-fit gap-3 font-bold text-white flex justify-center items-center">
                                {name}
                                <FaPencilAlt
                                    className="text-base text-white cursor-pointer opacity-40 group-hover:opacity-100 transition-opacity duration-300"
                                    onClick={() => setIsEditing({...isEditing, name: !isEditing.name})}
                                />
                                <span className="bg-accent text-sm rounded-full p-[6px]">{role}</span>
                            </h1>
                        )}
                    </div>
                    <div className="flex flex-col justify-center items-start">
                        <div className="flex items-center mt-2 group">
                            {isEditing.email ? (
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="text-base font-semibold text-gray-300 bg-transparent border-b border-white focus:outline-none"
                                />
                            ) : (
                                <p className="block text-base font-semibold text-gray-300">
                                    {email}
                                </p>
                            )}
                            <FaPencilAlt
                                className="ml-2 text-white cursor-pointer opacity-40 group-hover:opacity-100 transition-opacity duration-300"
                                onClick={() => setIsEditing({...isEditing, email: !isEditing.email})}
                            />
                        </div>
                        <div className="flex items-center mt-2 group">
                            {isEditing.dateOfBirth ? (
                                <input
                                    type="date"
                                    value={dateOfBirth}
                                    onChange={(e) => setDateOfBirth(e.target.value)}
                                    className="text-base font-semibold text-gray-300 bg-transparent border-b border-white focus:outline-none"
                                />
                            ) : (
                                <p className="block text-base font-semibold text-gray-300">
                                    {new Date(dateOfBirth).toLocaleDateString('en-GB')}
                                </p>
                            )}
                            <FaPencilAlt
                                className="ml-2 text-white cursor-pointer opacity-40 group-hover:opacity-100 transition-opacity duration-300"
                                onClick={() => setIsEditing({...isEditing, dateOfBirth: !isEditing.dateOfBirth})}
                            />
                        </div>
                    </div>
                </div>
                <ProfilePicture displayImage={displayImage} onFileChange={(file) => {
                    setProfilePicture(file);
                }}/>
            </div>
            {/* END MAIN SECTION */}
            <div className="bg-base-300 p-4">
                <p className="text-gray-300 text-sm">Update your personal information here to keep your account
                    up-to-date.</p>
                {(isEditing.name || isEditing.email || isEditing.dateOfBirth) && (
                    <div className="flex justify-end">
                        <button onClick={handleSave}
                                className="mt-4 bg-accent text-white hover:bg-gray-700 font-bold py-2 px-16 rounded">
                            Save
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AccountUserCard;