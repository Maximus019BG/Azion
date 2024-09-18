import {apiUrl} from "@/app/api/config";
import axios, {AxiosResponse} from "axios";
import Cookies from "js-cookie";
import {PartOfOrg} from "@/app/func/funcs";

interface User {
    name: string;
    email: string;
    age: string;
    role: string;
    orgid: string;
    projects: any;
}

interface Task {
    id: string;
    name: string;
    description: string;
    project: string;
    status: string;
    date: string;
    createdBy?: User;
}

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

const getOrgName = async () => {
    const data = await PartOfOrg(true);
    if (data === null) {
        return null;
    }
    return data.orgName;
}

const getTasks = async (taskId: string): Promise<Task> => {
    try {
        const response = await axios.get(`${apiUrl}/projects/${taskId}`, {
            headers: {
                "Content-Type": "application/json",
                authorization: Cookies.get("azionAccessToken")
            },
        });
        const taskData: Task = response.data;
        return taskData;
    } catch (error) {
        console.error('Failed to fetch task', error);
        throw new Error('Failed to fetch task');
    }
};


export {OrgConnString, getOrgName, getTasks};