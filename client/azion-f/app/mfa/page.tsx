"use client";
import React, { useState, useEffect } from 'react';
import axios, {AxiosResponse} from 'axios';
import Image from "next/image";
import { apiUrl } from '../api/config';

interface Token {
  refreshToken: string;
  accessToken: string;
}

const sessionCheck = () => {
  const refreshToken = localStorage.getItem('azionRefreshToken');
  const accessToken = localStorage.getItem('azionAccessToken');

  const data = { refreshToken, accessToken };

  const url = `${apiUrl}/token/session/check`
  axios
      .post(url, data, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then((response: AxiosResponse) => {
        const { message, accessToken } = response.data;
        if (message === 'newAccessToken generated') {
          localStorage.setItem('azionAccessToken', accessToken);
        }
      })
      .catch((error) => {
        console.error(error.response ? error.response : error);
        localStorage.removeItem('azionAccessToken');
        localStorage.removeItem('azionRefreshToken');
        window.location.href = '/log-in';
      });
};
  const MfaSetupPage = () => {

    const [qrCodeUri, setQrCodeUri] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
      const refreshToken = localStorage.getItem('azionRefreshToken');
      const accessToken = localStorage.getItem('azionAccessToken');

      if (refreshToken && accessToken) {
        sessionCheck();
      } else if (!accessToken && !refreshToken) {
        window.location.href = '/log-in';
      }

        const fetchQrCodeUri = async () => {
          const accessToken = localStorage.getItem('azionAccessToken');
          if (!accessToken) {
            setError('Access Token is missing');
            setLoading(false);
            return;
          }

          const url = `${apiUrl}/mfa/qr-code?accessToken=${encodeURIComponent(accessToken)}`;
          try {
            const response = await axios.get(url, {
              headers: {
                'Content-Type': 'application/json',
              }
            });
            setQrCodeUri(response.data.qrCodeUri);
            setLoading(false);
          } catch (err) {
            setError('Failed to fetch QR code URI');
            setLoading(false);
          }
        };

        fetchQrCodeUri();

    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div>
          <h1>Setup MFA</h1>
          <Image src={qrCodeUri} alt="QR Code" width={400} height={400}/>
        </div>
    );
 };

export default MfaSetupPage;