import { createContext, useState, useCallback, useEffect } from "react";
import { useSyncLogout } from '../lib/hooks'
import axios from "axios";
import { logoutService, setTokens } from "./authServices";
const UserContext = createContext([{}, () => { }]);

let initialState = {};

const UserProvider = (props) => {
  const [state, setState] = useState(initialState);
  useSyncLogout()
  const verifyUser = useCallback(async () => {
    try {
      const response = await axios.post(
        process.env.NEXT_PUBLIC_BACKEND_URL + `/auth/refreshToken`,
        { refreshToken: localStorage.getItem("refreshToken") },
        { withCredentials: true }
      );
      if (response.data) {
        localStorage.setItem("refreshToken", response?.data.refreshToken);
        setTokens(response?.data.accessToken,response?.data.refreshToken)
        setState((oldValues) => {
          return { ...oldValues, user: response.data };
        });
      } else {
        setState((oldValues) => {
          return { ...oldValues, user: null };
        });
      }
    } catch (error) {
      console.error(error);
    }
    // call refreshToken every 5 minutes to renew the authentication token.
    setTimeout(verifyUser, 5 * 60 * 1000);
  }, [setState]);

  useEffect(() => {
    verifyUser();
  }, [verifyUser]);

  return (
    <UserContext.Provider value={[state, setState]}>
      {props.children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider };
