import UserProfile from "../../components/UserProfile";
import PostGrid from "../../components/PostGrid";
import { getUserAndPostsWithUsername, getFeedPosts } from "../../lib/authServices";
import { useQuery, useQueryClient } from "react-query";
import { useContext, useEffect } from "react";
import { UserContext } from "../../lib/context";

export async function getServerSideProps({ query }) {
  const { username } = query;

  const userAndPosts = await getUserAndPostsWithUsername(username);

  if (!userAndPosts) {
    return {
      notFound: true,
    };
  }

  return {
    props: { userAndPosts, username },
  };
}

export default function UserProfilePage({ userAndPosts, username }) {
  let admin;
  const queryClient = useQueryClient();
  const fetchUsernameFeedPosts = async (username, LIMIT  = 10) => {

    const results = await getFeedPosts(`?page=0&limit=${LIMIT}&username=${username}`)
    if (!results || results.length < LIMIT) {
      return { results, nextPage: undefined }
    }
    return { results, nextPage: 1 }

  }
  const [userContext, setUserContext] = useContext(UserContext)
  useEffect(() => {
    if (userContext?.user?.username?.username && username) {
      const prefetchTodos = async () => {
        await queryClient.prefetchQuery(`${username}feedPosts`, async () => await fetchUsernameFeedPosts(username))
      }
      prefetchTodos()

    }
    
  }, [queryClient, userContext?.user?.username?.username, username])
  userContext?.user?.username?.username === username ? admin = true : admin = false
  const { data } = useQuery(
    username,
    async () => await getUserAndPostsWithUsername(username),
    { initialData: userAndPosts }
  );
  if (!data) return null;
  return (
    <main className="primary">
      <UserProfile user={data} admin={admin} />
      <div className="post-grid">
        <PostGrid posts={data?.posts} username={username} admin={admin}/>
      </div>
    </main>
  );
}
