"use client"
import React, {useEffect} from "react";
import axios, {AxiosResponse} from "axios";

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
              }
              else{
                localStorage.removeItem('azionAccessToken')
                localStorage.removeItem('azionRefreshToken')
              }
            }
            else {
              console.log('An error occurred, but no server response was received.');
            }
      });
};

const Home = () => {
    //NEEDS useEffect
    useEffect(() => {
        SessionCheck();
    });
    return (
        <div className="neon-text h-screen w-screen bg-[#f7f3e8] overflow-x-hidden">
            organizations
        </div>
    );
};

export default Home;