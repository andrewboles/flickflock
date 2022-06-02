import Link from "next/link";
import { useContext } from "react";
import { UserContext } from "../lib/context";

export default function AuthCheck(props) {
  const [userContext, setUserContext] = useContext(UserContext);
  let username = userContext?.user?.username?.username;

  return username
    ? props.children
    : props.fallback || <Link href="/signinup">You must be signed in</Link>;
}
