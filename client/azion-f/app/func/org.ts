import {apiUrl} from "@/app/api/config";
import axios, {AxiosResponse} from "axios";
import Cookies from "js-cookie";


const OrgConnString = (): Promise<string> => {
    return new Promise((resolve, reject) => {
        axios
            .get(`${apiUrl}/org/conn/${Cookies.get("azionAccessToken")}`, {
                headers: {
                    "Content-Type": "application/json",
                },
            })
            .then(function (response: AxiosResponse) {
                const connectionString = response.data;
                resolve(connectionString);
            })
            .catch(function (error) {
                console.error(error.response ? error.response : error);
                reject(error);
            });
    });
}


export {OrgConnString};