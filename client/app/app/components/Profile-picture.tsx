import React, {useEffect, useState} from "react";
import Image from "next/image";

const ProfilePicture = ({displayImage, onFileChange}: {
    displayImage: string | null,
    onFileChange: (file: File | null) => void
}) => {
    const [profileImage, setProfileImage] = useState<string | null>(displayImage);

    useEffect(() => {
        if (displayImage) {
            setProfileImage(`data:image/png;base64,${displayImage}`);
        }
    }, [displayImage]);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result as string);
            };
            reader.readAsDataURL(file);
            onFileChange(file);
        } else {
            onFileChange(null);
        }
    };

    return (
        <div className="w-fit h-fit flex flex-col items-center justify-center">
            <div className="relative w-fit h-fit flex flex-col justify-center items-center">
                <div className="relative flex flex-col justify-center items-center">
                    <Image
                        src={profileImage || "/user.png"}
                        alt="Profile"
                        width={150}
                        height={150}
                        className="rounded-full object-cover border-2 border-accent"
                    />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                    />
                </div>
            </div>
        </div>
    );
};

export default ProfilePicture;