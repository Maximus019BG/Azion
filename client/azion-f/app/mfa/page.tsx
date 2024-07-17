"use client";
import React, { useState, useEffect } from 'react';
import axios, {AxiosResponse} from 'axios';
import Image from "next/image";

interface Token {
  refreshToken: string;
  accessToken: string;
}

const SessionCheck = () => {
  const refreshToken: string|null = localStorage.getItem('azionRefreshToken');
  const accessToken: string|null = localStorage.getItem('azionAccessToken');

  const data: Token = {
    refreshToken: refreshToken ? refreshToken : '',
    accessToken: accessToken ? accessToken : ''
  };
  axios
      .post("http://localhost:8080/api/token/session/check", data, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(function (response: AxiosResponse) {
        const message = response.data.message;

        if(message === 'newAccessToken generated') {
          const accessToken = response.data.accessToken;
          localStorage.removeItem('azionAccessToken')
          localStorage.setItem('azionAccessToken', accessToken);

        }
        else if(message === 'success') {

        }
        else if(message === 'sessionCheck failed'){
          localStorage.removeItem('azionAccessToken')
          localStorage.removeItem('azionRefreshToken')
          window.location.href = '/log-in';

        }
        else{
          localStorage.removeItem('azionAccessToken')
          localStorage.removeItem('azionRefreshToken')
          window.location.href = '/log-in';

        }

      })
      .catch(function (error: any) {
        // console.log(error.response ? error.response : error);
        if (error.response) {
          const message = error.response.data.message;

          if(message === 'sessionCheck failed'){
            localStorage.removeItem('azionAccessToken')
            localStorage.removeItem('azionRefreshToken')
            window.location.href = '/log-in';
          }
          else{
            localStorage.removeItem('azionAccessToken')
            localStorage.removeItem('azionRefreshToken')
            window.location.href = '/log-in';
          }
        }
        else {
          console.log('An error occurred, but no server response was received.');
        }

      });
};
const MfaSetupPage = () => {
  const [qrCodeUri, setQrCodeUri] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    SessionCheck();
  }, []);



useEffect(() => {
  const fetchQrCodeUri = async () => {
    const accessToken: string|null = localStorage.getItem('azionAccessToken');
    if (!accessToken) {
      setError('Access Token is missing');
      setLoading(false);
      return;
    }
    const url = `http://localhost:8080/api/mfa/qr-code?accessToken=${encodeURIComponent(accessToken)}`;
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
      <Image src={qrCodeUri} alt="QR Code" width={400} height={400} />
    </div>
  );
};

export default MfaSetupPage;