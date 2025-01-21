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
        <div className="h-full w-full flex flex-col justify-center items-center space-y-4 p-4">
            {[accesField0, accesField1, accesField2, accesField3, accesField4, accesField5, accesField6, accesField7].map((field, index) => (
                <div key={index}
                     className="flex justify-between items-center w-full max-w-md p-4 bg-gray-800 rounded-md shadow-md">
                    <h1 className="text-white text-lg">Func{index + 1}: {field.toString()}</h1>
                    <input
                        className="toggle theme-controller"
                        type="checkbox"
                        checked={field}
                        onChange={() => {
                            const setters = [setAccesField0, setAccesField1, setAccesField2, setAccesField3, setAccesField4, setAccesField5, setAccesField6, setAccesField7];
                            setters[index](!field);
                        }}
                    />
                </div>
            ))}
        </div>
    );
};

export default EditRoleSection;