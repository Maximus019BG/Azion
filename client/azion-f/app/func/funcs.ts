import Cookies from 'js-cookie';
import axios from 'axios';
import {apiUrl} from '../api/config';

//Checks if user has MFA
const CheckMFA = async (onMFAPage:boolean) =>{
    const accessToken:string|undefined = Cookies.get('azionAccessToken');
    const data = {accessToken: accessToken};
    axios.put(`${apiUrl}/mfa/check/mfa`, {accessToken: accessToken},
         {      headers: {
                    'Content-Type': 'application/json',
                },
         })
         .then(function (response) {
             if(onMFAPage){
                 if(response.data === true) {
                     window.location.href = '/organizations';
                 }
                 else {
                     return;
                 }
             }
             else if(!onMFAPage){
                 if(response.data === true) {
                     return;
                 }
                 else {
                     window.location.href = '/mfa';
                 }
             }
         }).catch(function (error) {

     });


}


export {CheckMFA};