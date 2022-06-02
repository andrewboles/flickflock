import { useEffect, useState, useCallback, useContext } from 'react';
import { useRouter } from 'next/router'
const useSyncLogout = () => {
  const syncLogout = useCallback((event) => {
    if (event.key === "logout") {
      // If using react-router-dom, you may call history.push("/")
      window.location.reload();
    }
  }, []);

  useEffect(() => {
    window.addEventListener("storage", syncLogout);
    return () => {
      window.removeEventListener("storage", syncLogout);
    };
  }, [syncLogout]);
}


const useRouterRefresh = () =>  {
  const { asPath, replace } = useRouter()

  return useCallback(() => replace(asPath), [asPath, replace])
}

export { useSyncLogout, useRouterRefresh }