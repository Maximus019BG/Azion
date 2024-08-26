import { apiUrl } from "../api/config";
import { useEffect, useState } from "react";
import Link from "next/link";
import axios, { AxiosResponse } from "axios";

interface Token {
  refreshToken: string;
  accessToken: string;
}

const Navbar = () => {
  const [isLogged, setIsLogged] = useState(false);

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
            localStorage.setItem('azionAccessToken', accessToken);
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
    const refreshToken = localStorage.getItem("azionRefreshToken");
    const accessToken = localStorage.getItem("azionAccessToken");

    if (refreshToken && accessToken) {
      const data = { refreshToken, accessToken };
      sessionCheck(data);
    } else {
      setIsLogged(false);
    }
  }, []);

  return (
    <div className="navbar bg-transparent">
      <div className="flex-none">
        {isLogged && (
          <button className="btn btn-square btn-ghost">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block neon-text h-7 w-7 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </button>
        )}
      </div>
      <div className="flex-1">
        <a className="btn btn-ghost neon-text text-3xl">Azion</a>
      </div>
      <div className="flex justify-center gap-12 items-center mr-10">
        {isLogged ? (
          <>
          <Link href={"/dashboard"}>
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
            <Link href={"log-in"}>
                <button className="btn border-none neon-text text-lg shadow-none bg-transparent ">
                    Log-in
                </button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;
