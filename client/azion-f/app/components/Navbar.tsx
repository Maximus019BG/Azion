import { apiUrl } from "../api/config";
import { useEffect, useState } from "react";
import Link from "next/link";
import axios, { AxiosResponse } from "axios";
import Cookies from "js-cookie";
import {getOrgName} from "@/app/func/org";

interface Token {
  refreshToken: string;
  accessToken: string;
}

const Navbar = () => {
  const [isLogged, setIsLogged] = useState(false);
  const [org, setOrg] = useState<string | null>(null);

  const sessionCheck = (data: Token) => {
    const url = `${apiUrl}/token/session/check`;
    axios
        .post(url, data, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then((response: AxiosResponse) => {
          const { message, accessToken } = response.data;
          if (message === 'newAccessToken generated') {
            Cookies.set('azionAccessToken', accessToken);
            setIsLogged(true);
          } else if (message !== 'success') {
            setIsLogged(true);
          } else {
            setIsLogged(true);
          }
        })
        .catch((error) => {
          setIsLogged(false);
        });
  };

  useEffect(() => {
      const refreshToken = Cookies.get("azionRefreshToken");
      const accessToken = Cookies.get("azionAccessToken");

    if (refreshToken && accessToken) {
      const data = { refreshToken, accessToken };
      sessionCheck(data);
    } else {
      setIsLogged(false);
    }
  }, []);
    useEffect(() => {
    const fetchOrgName = async () => {
        const result: string = await getOrgName();
        if (result !== org) {
            setOrg(result);
        }
    };
    fetchOrgName();
    }, []);

  return (
    <div className="navbar bg-transparent px-16">
      <div className="flex-1">
        <a className="btn btn-ghost neon-text text-6xl">Azion</a>
      </div>
      <div className="flex justify-center gap-12 items-center">
        {isLogged ? (
          <>
          <Link href={`/dashboard/${org}`}>
            <button className="btn border-none neon-text text-lg shadow-none bg-transparent ">
              Dashboard
            </button>
            </Link>
              <Link href={"/organizations"}>
                <button className="btn border-none neon-text text-lg shadow-none bg-transparent ">
                    Organizations
                </button>
            </Link>
          </>
        ) : (
          <>
          <Link href={"/register"}>
                <button className="btn border-none neon-text text-lg shadow-none bg-transparent ">
                    Register
                </button>
            </Link>
            <Link href={"login"}>
                <button className="btn border-none neon-text text-lg shadow-none bg-transparent ">
                    Login
                </button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;
