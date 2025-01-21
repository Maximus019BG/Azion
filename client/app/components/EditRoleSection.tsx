"use client"
import React, {useState} from 'react';

const EditRoleSection = () => {

    const [accesField0, setAccesField0] = useState(false);
    const [accesField1, setAccesField1] = useState(false);
    const [accesField2, setAccesField2] = useState(false);
    const [accesField3, setAccesField3] = useState(false);
    const [accesField4, setAccesField4] = useState(false);
    const [accesField5, setAccesField5] = useState(false);
    const [accesField6, setAccesField6] = useState(false);
    const [accesField7, setAccesField7] = useState(false);

    return (
        <div className="h-fit w-full flex flex-col justify-center items-center space-y-4 p-4">
            {[{label: 'Calendar', state: accesField0, setState: setAccesField0},
                {label: 'Settings', state: accesField1, setState: setAccesField1},
                {label: 'Employees', state: accesField2, setState: setAccesField2},
                {label: 'Roles', state: accesField3, setState: setAccesField3},
                {label: 'Create Tasks', state: accesField4, setState: setAccesField4},
                {label: 'View Tasks', state: accesField5, setState: setAccesField5},
                {label: 'Azion Cameras (Write)', state: accesField6, setState: setAccesField6},
                {label: 'Azion Cameras (Read)', state: accesField7, setState: setAccesField7}]
                .map((field, index) => (
                    <div key={index}
                         className="flex justify-between items-center w-full max-w-md p-4 bg-gray-800 rounded-md shadow-md">
                        <h1 className="text-white text-lg">{field.label}</h1>
                        <input
                            className={`toggle ${field.state ? 'toggle-accent' : ''}`}
                            type="checkbox"
                            checked={field.state}
                            onChange={() => field.setState(!field.state)}
                        />
                    </div>
                ))}
        </div>
    );
};

export default EditRoleSection;