import Cookies from 'js-cookie';
import axios, {AxiosResponse} from 'axios';
import {apiUrl} from '../api/config';
import {Token} from "@/app/types/types";

//Checks if user has MFA
const CheckMFA = async (onMFAPage: boolean) => {
    const accessToken: string | undefined = Cookies.get('azionAccessToken');
    const data = {accessToken: accessToken};
    axios.put(`${apiUrl}/mfa/check/mfa`, {accessToken: accessToken},
        {
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(function (response) {
            if (onMFAPage) {
                if (response.data === true) {
                    window.location.href = '/organizations';
                } else {
                    return;
                }
            } else if (!onMFAPage) {
                if (response.data === true) {
                    return;
                } else {
                    window.location.href = '/mfa';
                }
            }
        }).catch(function (error) {

    });

}

//Check if user is in org...
const PartOfOrg = async (afterDashboard: boolean,) => {
    const data = {accessToken: Cookies.get("azionAccessToken")};
    try {
        const response = await axios.post(`${apiUrl}/org/partOfOrg`, data, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        return response.data;
    } catch (error: any) {
        if (afterDashboard && window.location.pathname !== "/organizations" && window.location.pathname !== "/" && window.location.pathname !== "/account") {
            window.location.href = "/organizations";
        }
        if (error.response.status === 404) {
            return null;
        }
        return null;
    }
};

//Get user data
const UserData = async (): Promise<{ name: string, email: string, age: string, role: string, roleLevel: number, projects: string[], profilePicture: string }> => {
    const data = {accessToken: Cookies.get("azionAccessToken")};
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
                projects: response.data.projects,
                profilePicture: response.data.profilePicture
            };
        })
        .catch((error: any) => {
            throw error;
        });
};


const DeleteSession = async () => {
    const data = {accessToken: Cookies.get("azionAccessToken"), refreshToken: Cookies.get("azionRefreshToken")};
    axios
        .put(`${apiUrl}/token/sessions/delete`, data, {
            headers: {
                "Content-Type": "application/json",
            },
        })
        .then(function (response: AxiosResponse) {
            window.location.href = window.location.pathname;
        })
        .catch(function (error) {
            console.error(error);
        });
}

//!Session check for auth
const authSessionCheck = () => {
    const refreshToken: string | undefined = Cookies.get("azionRefreshToken");
    const accessToken: string | undefined = Cookies.get("azionAccessToken");

    const data: Token = {
        refreshToken: refreshToken ? refreshToken : "",
        accessToken: accessToken ? accessToken : "",
    };
    axios
        .post(`${apiUrl}/token/session/check`, data, {
            headers: {
                "Content-Type": "application/json",
            },
        })
        .then(function (response: AxiosResponse) {
            const message = response.data.message;

            if (message === "newAccessToken generated") {
                const accessToken = response.data.accessToken;

                Cookies.set("azionAccessToken", accessToken, {
                    secure: true,
                    sameSite: "Strict",
                });
                window.location.href = "/organizations";
            } else if (message === "success") {
                window.location.href = "/organizations";
            } else if (message === "sessionCheck failed") {
                Cookies.remove("azionAccessToken");
                Cookies.remove("azionRefreshToken");
            } else {
                Cookies.remove("azionAccessToken");
                Cookies.remove("azionRefreshToken");
            }
        })
        .catch(function (error: any) {
            if (error.response) {
                const message = error.response.data.message;
                if (message === "sessionCheck failed") {
                    Cookies.remove("azionAccessToken");
                    Cookies.remove("azionRefreshToken");
                } else {
                    Cookies.remove("azionAccessToken");
                    Cookies.remove("azionRefreshToken");
                }
            } else {
                console.log("An error occurred, but no server response was received.");
            }
        });
};

//!Org page only session check after register
const orgSessionCheck = async () => {
    const refreshToken = Cookies.get("azionRefreshToken");
    const accessToken = Cookies.get("azionAccessToken");
    const data = {refreshToken, accessToken};
    await CheckMFA(false);
    const url = `${apiUrl}/token/session/check`;
    try {
        const response = await axios.post(url, data, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        const {message, accessToken} = response.data;
        if (message === "newAccessToken generated") {
            Cookies.set("azionAccessToken", accessToken, {
                secure: true,
                sameSite: "Strict",
            });
        }
        return true;
    } catch (error: any) {
        console.error(error.response ? error.response : error);
        //Remove session
        Cookies.remove("azionAccessToken");
        Cookies.remove("azionRefreshToken");
        window.location.href = "/login";
        return false;
    }
};

//*Session check for everything else (not auth, not org)
const sessionCheck = () => {
    const refreshToken: string | undefined = Cookies.get("azionRefreshToken");
    const accessToken: string | undefined = Cookies.get("azionAccessToken");

    const data: Token = {
        refreshToken: refreshToken ? refreshToken : "",
        accessToken: accessToken ? accessToken : "",
    };
    axios
        .post(`${apiUrl}/token/session/check`, data, {
            headers: {
                "Content-Type": "application/json",
            },
        })
        .then(function (response: AxiosResponse) {
            const message = response.data.message;
            if (message === "newAccessToken generated") {
                const accessToken = response.data.accessToken;
                Cookies.set("azionAccessToken", accessToken, {
                    secure: true,
                    sameSite: "Strict",
                });
            } else if (message === "sessionCheck failed") {
                Cookies.remove("azionAccessToken");
                Cookies.remove("azionRefreshToken");
            } else {
                Cookies.remove("azionAccessToken");
                Cookies.remove("azionRefreshToken");
            }
        })
        .catch(function (error: any) {
            if (error.response) {
                const message = error.response.data.message;
                if (message === "sessionCheck failed") {
                    Cookies.remove("azionAccessToken");
                    Cookies.remove("azionRefreshToken");
                    window.location.href = "/log-in";
                } else {
                    Cookies.remove("azionAccessToken");
                    Cookies.remove("azionRefreshToken");
                    window.location.href = "/log-in";
                }
            } else {
                console.log("An error occurred, but no server response was received.");
            }
        });
};

export {CheckMFA, PartOfOrg, UserData, DeleteSession, authSessionCheck, orgSessionCheck, sessionCheck};