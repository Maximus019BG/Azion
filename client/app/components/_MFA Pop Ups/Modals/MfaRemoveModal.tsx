import React, {useEffect, useRef} from 'react';
import ReactDOM from 'react-dom';
import OTP from '@/app/components/OTP';
import {apiUrl} from '@/app/api/config';
import {mfaSessionCheck} from '@/app/func/funcs';
import axios, {AxiosResponse} from 'axios';
import Cookies from 'js-cookie';

interface MfaRemoveModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const RemMFAAxios = (data: any) => {
    axios
        .put(`${apiUrl}/mfa/rem`, data, {
            headers: {
                "Content-Type": "application/json",
            },
        })
        .then(function (response: AxiosResponse) {
            Cookies.set("mfaChecked" + response.data.email, "true", {
                secure: true,
                sameSite: "Strict",
            });
            window.location.href = "/account";
        })
        .catch(function (error: any) {
            console.log(error.response ? error.response : error);
        });
};

const removeMFA = async (otp: string) => {
    const userData = {
        OTP: otp,
        accessToken: Cookies.get("azionAccessToken"),
    };
    if (!Cookies.get("azionAccessToken")) {
        window.location.href = "/login"
        return;
    } else if (otp.length !== 6) {
        console.log("OTP is invalid");
        return;
    } else {
        RemMFAAxios(userData);
    }
};

const MfaRemoveModal: React.FC<MfaRemoveModalProps> = ({isOpen, onClose}) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    useEffect(() => {
        const refreshToken = Cookies.get("azionRefreshToken");
        const accessToken = Cookies.get("azionAccessToken");
        if (refreshToken && accessToken) {
            mfaSessionCheck(true);
        } else {
            window.location.href = "/login";
        }
    }, []);

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div
                ref={modalRef}
                className="bg-black shadow-2xl border-gray-700 w-full max-w-lg h-auto rounded-2xl p-4 flex flex-col justify-center items-center"
            >
                <button onClick={onClose} className="absolute top-2 right-2 text-white text-2xl">
                    &times;
                </button>
                <h1 className="text-2xl md:text-4xl font-black tracking-wide mt-4 md:mt-16 text-lightAccent">Remove
                    2FA</h1>
                <p className="my-4">To remove the 2FA enter the OTP code</p>
                <OTP length={6} onComplete={removeMFA}/>
                <div className="w-full flex flex-col justify-center items-center mt-6 md:mt-10">
                    <p className="text-center">
                        &bull; <span className="font-black text-lightAccent uppercase">NOW YOU CAN REMOVE</span> THE
                        AZION ONLINE FIELD FROM YOUR AUTHENTICATOR APP &bull;
                    </p>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default MfaRemoveModal;