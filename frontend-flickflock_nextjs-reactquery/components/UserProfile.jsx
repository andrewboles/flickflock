import { useRouter } from "next/router";
import { UserContext } from "../lib/context";
import { useContext, useEffect } from "react";
import { logoutService } from "../lib/authServices";
import Image from "next/image";
import { Button } from "@mantine/core";

export default function UserProfile({ user, admin }) {
  return (
    <div className="box-center">
      {user.profilePictureUrl && (
        <img
          src={user.profilePictureUrl}
          className="card-img-center"
          alt="profile-picture"
        />
      )}
      <p>
        <i>@{user.username.username}</i>
      </p>
      <div className="follower-stats-block">
        {/* I've only included followers and followings for the purposes of this demo.
        I understand that this wouldn't scale for thousands, millions, etc, but this version
        of prisma doesn't count properly for these specific relations */}
        <div className="stat-block"><h5>Followers</h5> <h5 className="stat-count">{user.followers.length}</h5></div>
        <div className="stat-block"><h5>Following</h5> <h5 className="stat-count">{user.followings.length}</h5></div>
        <div className="stat-block"><h5>Likes</h5> <h5 className="stat-count">{user._count.hearts}</h5></div>
      </div>
      {admin && <SignOutButton />}
    </div>
  );
}

function SignOutButton() {
  const [userContext, setUserContext] = useContext(UserContext);
  const router = useRouter();
  async function handleSignOut() {
    setUserContext({});
    await logoutService();
    router.push(`/signinup`);
  }
  return <Button
  variant="light"
  type="submit"
  compact
  color="pink"
  radius="md"
  size="sm"
  onClick={handleSignOut}
>
  Sign Out
</Button>;
}
