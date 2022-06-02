
import Loader from '../components/Loader'
import toast from 'react-hot-toast'
import PostFeed from '../components/PostFeed';
import { getHomePosts } from '../lib/authServices'
import {useInfiniteQuery} from 'react-query'
import { useContext, useEffect } from 'react';
import { UserContext } from '../lib/context';
import { useRouter} from 'next/router'
const LIMIT = 10;
const fetchHomePosts = async ({ pageParam = 0 }) => {

  const results = await getHomePosts(`?page=${pageParam}&limit=${LIMIT}`)
  if(!results || results.length<LIMIT){
    return{ results, nextPage: undefined}
  }
  return{ results, nextPage: pageParam +1}

}
/* 
export async function getServerSideProps({ query }) {
	const initialPosts = await fetchHomePosts(0)

	if (!initialPosts) {
    return {
      notFound: true,
    };
  }	
  const finalReturn = {}
  finalReturn.pages = [initialPosts]
	return {
		props: { finalReturn },
	};

} 
 */
export default function Home() {
  const router = useRouter()
  const [userContext, setUserContext] = useContext(UserContext);
  let username = userContext?.user?.username?.username
  useEffect(()=>{
    !username ? router.push('/signinup') : null
  },[username, router])
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery('homePosts', fetchHomePosts, {
    getNextPageParam: (lastPage, pages) => lastPage.nextPage })
  
  let posts= []
  if(data){
    data.pages.forEach(page=>{
      posts = [...posts, ...page.results]
    })
  } 

  if(!data) return <Loader/>
  return (
    <main className='main-window'>
      <PostFeed posts={posts} hasNextPage={hasNextPage} fetchNextPage={fetchNextPage} locationKey={"homePosts"}/>
      {!hasNextPage && <h2>this is the end of flickflock ✌🏽</h2>}
      <button onClick={()=>fetchNextPage()}>More Posts</button>
    </main>
  );
}
