import Cookies from 'js-cookie';
import axios, {AxiosResponse} from 'axios';
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

//Check if user is in org...
const PartOfOrg = async (afterDashboard:boolean) => {
    const data = { accessToken: Cookies.get("azionAccessToken") };
    axios
        .post(`${apiUrl}/org/partOfOrg`, data, {
            headers: {
                "Content-Type": "application/json",
            },
        })
        .then(function (response: AxiosResponse) {
            //Do nothing
        })
        .catch(function (error) {
            if(afterDashboard){
                window.location.href = "/organizations";
            }
            else if(!afterDashboard){
            }
        });
};

//Get user data
const UserData = async (): Promise<{ name: string, email: string, age: string, role: string, projects: string[] }> => {
    const data = { accessToken: Cookies.get("azionAccessToken") };
    return axios
        .post(`${apiUrl}/user/data`, data, {
            headers: {
                "Content-Type": "application/json",
            },
        })
        .then((response: AxiosResponse) => {
            return {
                name: response.data.name,
                email: response.data.email,
                age: response.data.age,
                role: response.data.role,
                projects: response.data.projects
            };
        })
        .catch((error: any) => {
            throw error;
        });
};






export {CheckMFA, PartOfOrg, UserData};