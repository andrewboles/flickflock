import Link from "next/link";
import { useContext } from "react";
import { UserContext } from "../lib/context";
import Uploader from "./Uploader";
import Image from "next/image";
import { Button } from "@mantine/core";

// Top navbar
export default function Navbar() {
  const [userContext, setUserContext] = useContext(UserContext);
  let username = userContext?.user?.username?.username;
  return !username ? null : (
    <nav className="navbar">
      <ul>
        <li>
          <Link href="/" passHref>
            <Button
              variant="light"
              type="submit"
              color="violet"
              radius="md"
              size="md"
            >
              Feed
            </Button>
          </Link>
        </li>

        {/* user is signed-in and has username */}
        {username && (
          <>
            <li>
              <Uploader currentUser={username} />
            </li>

            <li>
              <Link href={`/${username}`}>
                {userContext?.user?.profilePictureUrl ? (
                  <img
                    src={userContext?.user?.profilePictureUrl}
                    alt="profile"
                  />
                ) : (
                  <Button
                    variant="light"
                    type="submit"
                    color="indigo"
                    radius="md"
                    size="md"
                  >
                    Profile
                  </Button>
                )}
              </Link>
            </li>
          </>
        )}

        {/* user is not signed OR has not created username */}
        {!username && (
          <li>
            <Link href="/signinup">
              <button className="btn-blue">Log in</button>
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
