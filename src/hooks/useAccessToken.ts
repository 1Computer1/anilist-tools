import { useLocalStorage } from "usehooks-ts";
import { isTokenExpired } from "../util/jwt";
import { useEffect } from "react";

export default function useAccessToken() {
  const [accessToken, setAccessToken] = useLocalStorage("access_token", "");
  useEffect(() => {
    if (accessToken && isTokenExpired(accessToken)) {
      setAccessToken("");
    }
  });
  return { token: accessToken, removeToken: () => setAccessToken("") };
}
