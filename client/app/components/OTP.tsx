import React, { useRef, useState } from 'react';

type InputProps = {
    length?: number;
    onComplete: (pin: string) => void;
};

const OTP = ({ length = 6, onComplete }: InputProps) => {
    const inputRef = useRef<(HTMLInputElement | null)[]>(Array(length).fill(null));
    const [OTP, setOTP] = useState<string[]>(Array(length).fill(''));

    //Change ti each field
    const handleTextChange = (input: string, index: number) => {
        const newPin = [...OTP];
        newPin[index] = input; //Update value
        setOTP(newPin);

        //Move to next input
        if (input.length === 1 && index < length - 1) {
            inputRef.current[index + 1]?.focus();
        }

        //Move back when del
        if (input.length === 0 && index > 0) {
            inputRef.current[index - 1]?.focus();
        }

        //Join on completion
        if (newPin.every((digit) => digit !== '')) {
            onComplete(newPin.join(''));
        }
    };

    //Pasting bug fix
    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text'); //Get text

        //length check
        if (pastedData.length === length) {
            const newPin = pastedData.split('').slice(0, length);
            setOTP(newPin);

            //Update fields
            newPin.forEach((digit, index) => {
                if (inputRef.current[index]) {
                    inputRef.current[index]!.value = digit;
                }
            });
            onComplete(newPin.join(''));
        }
    };

    return (
        <div className="w-fit flex justify-center items-center gap-1 flex-wrap">
            {Array.from({ length }, (_, index) => (
                <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={OTP[index]}
                    onChange={(e) => handleTextChange(e.target.value, index)}
                    onPaste={handlePaste}
                    ref={(ref) => {
                        inputRef.current[index] = ref;
                    }}
                    className="border-2 border-slate-500 w-12 md:w-[3.3rem] rounded-lg h-12 md:h-16 focus:border-lightAccent p-2 md:p-5 outline-none"
                    style={{ marginRight: index === length - 1 ? '0' : '10px' }}
                />
            ))}
        </div>
    );
};

export default OTP;
