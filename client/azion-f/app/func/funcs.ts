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
const PartOfOrg = async (afterDashboard: boolean) => {
    const data = { accessToken: Cookies.get("azionAccessToken") };
    try {
        const response = await axios.post(`${apiUrl}/org/partOfOrg`, data, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        return response.data; // Ensure response data is returned
    } catch (error) {
        if (afterDashboard) {
            window.location.href = "/organizations";
        } else if (!afterDashboard) {
            // Handle the case when afterDashboard is false
        }
        throw error; // Ensure error is thrown to be caught in fetchData
    }
};

//Get user data
const UserData = async (): Promise<{ name: string, email: string, age: string, role: string, roleLevel: number, projects: string[] }> => {
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
                roleLevel: response.data.roleLevel,
                projects: response.data.projects
            };
        })
        .catch((error: any) => {
            throw error;
        });
};


const DeleteSession = async () => {
    const data = { accessToken: Cookies.get("azionAccessToken"), refreshToken: Cookies.get("azionRefreshToken") };
    axios
        .put(`${apiUrl}/token/sessions/delete`, data, {
            headers: {
                "Content-Type": "application/json",
            },
        })
        .then(function (response: AxiosResponse) {
        })
        .catch(function (error) {
            console.error(error);
        });
}



export {CheckMFA, PartOfOrg, UserData, DeleteSession};