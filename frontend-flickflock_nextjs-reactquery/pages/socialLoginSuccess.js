import cookies from "next-cookies";
import { useContext, useEffect } from 'react'
import { useRouter} from 'next/router'
import { UserContext } from "../lib/context";
import { setTokens} from '../lib/authServices'
import Loader from '../components/Loader'


export async function getServerSideProps(ctx) {
  const response = cookies(ctx)?.data
  if (!response) {
    return {
      notFound: true,
    };
  }	
  return {
    props: {response},
  }
}

function Page({ response }) {
  const router = useRouter()
  const [userContext, setUserContext] = useContext(UserContext);
  useEffect(()=>{
    setTokens(response.accessToken, response.refreshToken);
   localStorage.setItem("refreshToken", response.refreshToken);
  setUserContext((oldValues) => {
    return { ...oldValues, user: response.user };
  });
  router.push('/signinup')
  },[response.accessToken, response.refreshToken, response.user, router, setUserContext])
  return <Loader show/>
} 

export default Page;
