
import Loader from '../../components/Loader'
import PostFeed from '../../components/PostFeed';
import { getFeedPosts } from '../../lib/authServices'
import {useInfiniteQuery} from 'react-query'

const LIMIT = 10;
export async function getServerSideProps({ query }) {
    const { username } = query;
  
    return {
      props: {  username },
    };
  }


export default function Home({username}) {
    const fetchUsernameFeedPosts = async ({ pageParam = 0 }) => {

        const results = await getFeedPosts(`?page=${pageParam}&limit=${LIMIT}&username=${username}`)
        if(!results || results.length<LIMIT){
          return{ results, nextPage: undefined}
        }
        return{ results, nextPage: pageParam +1}
      
      }

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery(`${username}feedPosts`, fetchUsernameFeedPosts, {
    getNextPageParam: (lastPage, pages) => lastPage.nextPage})
  
  let posts= []
  if(data){
    data.pages.forEach(page=>{
      posts = [...posts, ...page.results]
    })
  } 
  if(!data) return <Loader/>
  return (
    <main className='main-window'>
      <PostFeed posts={posts} hasNextPage={hasNextPage} fetchNextPage={fetchNextPage} locationKey={`${username}feedPosts`}/>
      {!hasNextPage && <h2>this is the end of flickflock ✌🏽</h2>}
      <button onClick={()=>fetchNextPage()}>More Posts</button>
    </main>
  );
}
