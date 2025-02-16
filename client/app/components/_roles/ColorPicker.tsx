import React from 'react';

interface ColorPickerProps {
    color: string;
    setColor: (color: string) => void;
    setIsSaveEnabled: (enabled: boolean) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({color, setColor, setIsSaveEnabled}) => {
    //Sorted so it looks nice
    const presetColors = [

        // Green
        "#0A4600", "#165B16", "#1D5B3A", "#267D26",

        // Blue
        "#00005B", "#125B8B", "#2D5B7A", "#0D5454",

        // Purple
        "#4B004B", "#5C005C", "#660066", "#5C2D8B",

        // Red
        "#5C0000", "#B20000", "#B25A3A", "#B27300",

        // Black/Gray
        "#000000", "#1A1A1A", "#2D2D2D", "#4C4C4C",
    ];


    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setColor(e.target.value);
        setIsSaveEnabled(true);
    };

    return (
        <div className="z-50 w-full h-full flex flex-col space-y-5 p-4 rounded-md ">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Role color</h3>
            <div className="relative w-full h-20 cursor-pointer rounded-md">
                <div
                    className="absolute w-full h-full inset-0 rounded-md"
                    style={{backgroundColor: color}}
                ><input
                    type="text"
                    value={color}
                    onChange={handleColorChange}
                    className="absolute w-24 bottom-0 right-0 px-2 py-1 text-gray-200 rounded-tl-md rounded-br-sm caret-accent bg-gray-950"
                /></div>
                <input
                    type="color"
                    value={color}
                    onChange={handleColorChange}
                    className="absolute w-full h-full inset-0 opacity-0 cursor-pointer"
                />
            </div>
            <div className="mt-5">
                <div className="grid grid-cols-4 gap-x-6 gap-y-4">
                    {presetColors.map((preset, index) => (
                        <button
                            key={index}
                            className={`w-16 h-10 rounded-md  ${color === preset ? "ring-2 ring-blue-500" : ""}`}
                            style={{backgroundColor: preset}}
                            onClick={() => {
                                setColor(preset);
                                setIsSaveEnabled(true);
                            }}
                        ></button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ColorPicker;