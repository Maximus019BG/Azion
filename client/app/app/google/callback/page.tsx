'use client';
import dynamic from 'next/dynamic';
import {useRouter, useSearchParams} from 'next/navigation';
import axios from 'axios';
import {useEffect} from 'react';
import {apiUrl} from '@/app/api/config';
import Cookies from 'js-cookie';

const GoogleCallback: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const code = searchParams.get('code');
    useEffect(() => {
        if (code) {
            (async () => {
                try {
                    const response = await axios.post(
                        `${apiUrl}/auth/google`,
                        {code},
                        {
                            headers: {
                                'X-Requested-With': 'XMLHttpRequest',
                            },
                        }
                    );
                    Cookies.set('azionAccessToken', response.data.accessToken, {SameSite: 'Strict', Secure: true});
                    Cookies.set('azionRefreshToken', response.data.refreshToken, {SameSite: 'Strict', Secure: true});
                    router.push('/organizations');
                } catch (error) {
                    console.error('Error during Google login:', error);
                }
            })();
        } else {
            console.error('No authorization code found.');
        }
    }, [code]);

    return (
        <div className="flex items-center justify-center h-screen">
            <div className="text-2xl font-bold text-white">
                Processing Google Login...
            </div>
        </div>
    );
};

export default dynamic(() => Promise.resolve(GoogleCallback), {ssr: false});