import React, { useRef, useState } from 'react';

type InputProps = {
  length?: number;
  onComplete: (pin: string) => void;
};

const OTP = ({ length = 6, onComplete }: InputProps) => {
  const inputRef = useRef<(HTMLInputElement | null)[]>(Array(length).fill(null));
  const [OTP, setOTP] = useState<string[]>(Array(length).fill(''));

  const handleTextChange = (input: string, index: number) => {
    const newPin = [...OTP];
    newPin[index] = input;
    setOTP(newPin);

    if (input.length === 1 && index < length - 1) {
      inputRef.current[index + 1]?.focus();
    }

    if (input.length === 0 && index > 0) {
      inputRef.current[index - 1]?.focus();
    }

    if (newPin.every((digit) => digit !== '')) {
      onComplete(newPin.join(''));
    }
  };

  return (
    <div className={`flex justify-center items-center gap-1`}>
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          type="text"
          maxLength={1}
          value={OTP[index]}
          onChange={(e) => handleTextChange(e.target.value, index)}
          ref={(ref) => {
            inputRef.current[index] = ref;
          }}
          className={`border-2 border-border-slate-500 w-[3.3rem] rounded-lg h-16 focus:border-lightAccent p-5 outline-none`}
          style={{ marginRight: index === length - 1 ? '0' : '10px' }}
        />
      ))}
    </div>
  );
};
export default OTP;
