import Cookies from 'js-cookie';
import axios, {AxiosResponse} from 'axios';
import {apiUrl} from '../api/config';
import {Role, Token, UserDataType} from "@/app/types/types";

//Checks if user has MFA
const CheckMFA = async (onMFAPage: boolean) => {
    const accessToken: string | undefined = Cookies.get('azionAccessToken');
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
            } else {
                if (response.data === false) {
                    window.location.href = '/organizations';
                } else {
                    return;
                }
            }
        }).catch(function (error) {
            console.error(error);
        });

}

//Check if user is in org...
const PartOfOrg = async (afterDashboard: boolean) => {
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
        if (error.response) {
            if (error.response.status === 404) {
                return null;
            }
        } else {
            console.error("Error response is undefined", error);
            return null;
        }
        return null;
    }
};

//Join btn in org page
const hideButton = async () => {
    const data = {accessToken: Cookies.get("azionAccessToken")};
    try {
        await axios.post(`${apiUrl}/org/partOfOrg`, data, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        return true;
    } catch (error: any) {
        return false
    }
};

//Get user data
const UserData = async (): Promise<UserDataType> => {
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
                orgid: response.data.orgid,
                email: response.data.email,
                age: response.data.age,
                role: response.data.role,
                access: response.data.role?.roleAccess,
                projects: response.data.projects,
                profilePicture: response.data.profilePicture,
                mfaEnabled: response.data.mfaEnabled,
                userType: response.data.userType,
                faceIdEnabled: response.data.faceIdEnabled
            };
        })
        .catch((error: any) => {
            throw error;
        });
};

//Check if user has a right to do something
/*IN ORDER:
    *
    * IN ORDER:
    *
    * Calendar                calendar:write
    *
    * Settings                settings:write  settings:read
    *
    * Employees               employees:read
    *
    * Roles                   roles:write     roles:read
    *
    * Create Tasks            tasks:write
    *
    * View Tasks              tasks:read
    *
    * Azion Cameras (Write)   cameras:write
    *
    * Azion Cameras (Read)    cameras:read
    *
    * Unify Network             network
    * </summary>
*/
const UserHasRight = async (right: string) => {
    try {
        const r = await UserData();
        if (!r.access?.includes(right)) {
            window.location.href="/organizations";
        }
    } catch (error) {
        console.error("Error checking user rights:", error);
        window.location.href="/organizations";
        return false;
    }
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
            }
        })
        .catch(function (error: any) {
            if (error.response) {
                const message = error.response.data.message;
                if (message === "sessionCheck failed") {
                    Cookies.remove("azionAccessToken");
                    Cookies.remove("azionRefreshToken");
                    window.location.href = "/login";
                } else {
                    Cookies.remove("azionAccessToken");
                    Cookies.remove("azionRefreshToken");
                    window.location.href = "/login";
                }
            } else {
                console.log("An error occurred, but no server response was received.");
            }
        });
};

//!mfa Only
const mfaSessionCheck = (mfaRem: boolean) => {
    const refreshToken = Cookies.get("azionRefreshToken");
    const accessToken = Cookies.get("azionAccessToken");

    //Check if the page is to remove the otp
    if (!mfaRem) {
        CheckMFA(true);
    } else if (mfaRem) {
        CheckMFA(false);
    }

    const data = {refreshToken, accessToken};

    const url = `${apiUrl}/token/session/check`;
    axios
        .post(url, data, {
            headers: {
                "Content-Type": "application/json",
            },
        })
        .then((response: AxiosResponse) => {
            const {message, accessToken} = response.data;
            if (message === "newAccessToken generated") {
                Cookies.set("azionAccessToken", accessToken, {
                    secure: true,
                    sameSite: "Strict",
                });
            }
        })
        .catch((error) => {
            console.error(error.response ? error.response : error);
            Cookies.remove("azionAccessToken");
            Cookies.remove("azionRefreshToken");
            window.location.href = "/login";
        });
};

//Convert byte array to base64 img
const byteArrayToBase64 = async (byteArray: number[]): Promise<string | null> => {
    const uint8Array = new Uint8Array(byteArray);
    const blob = new Blob([uint8Array], {type: "image/jpeg"}); //Convert to blob
    //Convert to base64
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

//User can edit calendar
const canEditCalendar = async ():Promise<boolean|undefined>  =>{
    try {
        const r = await UserData();
        return r.access?.includes("calendar:write");
    } catch (error) {
        console.error("Error checking user rights:", error);
        return false;
    }
}

//Roles settings check
const roleExists = async (roleName: string) => {
    const data = {roleName: roleName};
    try {
        const response: AxiosResponse<Role> = await axios.get(
            `${apiUrl}/org/get/role/${roleName}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    authorization: Cookies.get("azionAccessToken"),
                },
            }
        );
        if(response.status !== 200){
            return false;
        }
        //Check role in list
         return response.data.name === roleName;
    } catch (error) {
         return false;
    }
}

export {
    CheckMFA,
    PartOfOrg,
    UserData,
    DeleteSession,
    authSessionCheck,
    orgSessionCheck,
    sessionCheck,
    mfaSessionCheck,
    byteArrayToBase64,
    hideButton,
    UserHasRight,
    canEditCalendar,
    roleExists
};
