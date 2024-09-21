"use client";
import React, { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import Cookies from "js-cookie";
import { apiUrl } from "@/app/api/config";
import CustomAlert from "./CustomAlert";
import CircularProgress from "@/app/components/diagram";
import { OrgConnString } from "@/app/func/org";
import { CheckMFA, PartOfOrg, UserData } from "@/app/func/funcs";

const SessionCheck = () => {
  const refreshToken = Cookies.get("azionRefreshToken");
  const accessToken = Cookies.get("azionAccessToken");

  const data = { refreshToken, accessToken };

  const url = `${apiUrl}/token/session/check`;
  axios
    .post(url, data, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((response: AxiosResponse) => {
      const { message, accessToken } = response.data;
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

const OrgSettingsForm = () => {
  const [orgData, setOrgData] = useState<{
    [key: string]: string;
  }>({
    orgName: "",
    orgAddress: "",
    orgEmail: "",
    orgType: "",
    orgPhone: "",
    orgDescription: "",
  });
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrgData = async () => {
      try {
        const response: AxiosResponse = await axios.get(
          `${apiUrl}/org/${Cookies.get("azionAccessToken")}`,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        setOrgData({
          orgName: response.data.orgName,
          orgAddress: response.data.orgAddress,
          orgEmail: response.data.orgEmail,
          orgType: response.data.orgType,
          orgPhone: response.data.orgPhone,
          orgDescription: response.data.orgDescription,
        });
      } catch (error) {
        console.error(error);
      }
    };

    fetchOrgData();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setOrgData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      await axios.put(
        `${apiUrl}/org/update/${Cookies.get("azionAccessToken")}`,
        orgData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      setAlertMessage("Organization details updated successfully");
    } catch (error) {
      console.error(error);
      setAlertMessage("Failed to update organization details");
    }
  };

  const [loading, setLoading] = useState<boolean>(true);
  const [conString, setConString] = useState<string>("");

  CheckMFA(false);
  PartOfOrg(true);

  useEffect(() => {
    const refreshToken = Cookies.get("azionRefreshToken");
    const accessToken = Cookies.get("azionAccessToken");

    if (refreshToken && accessToken) {
      PartOfOrg(true).then();
      SessionCheck();
      setTimeout(() => {
        UserData().then(() => {
          setLoading(false);
        });
      }, 1000);
    } else if (!accessToken && !refreshToken) {
      window.location.href = "/login";
    }
  }, []);

  useEffect(() => {
    OrgConnString()
      .then((data: string) => {
        setConString(data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return (
    <div className="w-[65vw] h-auto p-8 bg-gray-800 shadow-lg rounded-md flex flex-col justify-center items-center gap-12">
      <h2 className="text-3xl font-semibold text-white text-center mb-6">
        Organization Settings
      </h2>

      <div className="w-full grid grid-cols-2 gap-6">
        {["orgName", "orgAddress", "orgEmail", "orgType", "orgPhone"].map(
          (field, index) => (
            <div className="flex flex-col" key={index}>
              <label className="text-sm font-medium text-gray-400 capitalize">
                {field.replace("org", "").replace(/([A-Z])/g, " $1")}:
              </label>
              <input
                name={field}
                type={field === "orgEmail" ? "email" : "text"}
                value={orgData[field]}
                onChange={handleInputChange}
                className="mt-2 p-3 bg-gray-700 text-white border-none focus:outline-none rounded-lg w-full"
              />
            </div>
          )
        )}

        <div className="col-span-2 flex flex-col">
          <label className="text-sm font-medium text-gray-400">
            Description:
          </label>
          <textarea
            name="orgDescription"
            value={orgData.orgDescription}
            onChange={handleInputChange}
            className="mt-2 p-3 bg-gray-700 text-white border-none focus:outline-none rounded-lg w-full"
            rows={4}
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200"
      >
        Save Changes
      </button>

      <h2 className="text-foreground text-2xl text-white mt-6 text-center ">
        Connection String: {conString}
      </h2>

      {alertMessage && (
        <div className="mt-4 text-white bg-gray-700 p-3 rounded">
          {alertMessage}
        </div>
      )}
    </div>
  );
};

export default OrgSettingsForm;
