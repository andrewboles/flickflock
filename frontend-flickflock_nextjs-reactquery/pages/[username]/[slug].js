import Link from 'next/link';
import HeartButton from '../../components/HeartButton'
import AuthCheck from '../../components/AuthCheck';
import Comments from '../../components/CommentsWindow';
import { useState } from 'react';
import { CommentButton } from '../../components/CommentsWindow';
import {getPost} from '../../lib/authServices'
import useSWR from 'swr'
const fetcher = slug => getPost(slug)
export async function getServerSideProps({ query }) {

	const { slug } = query;

	const post = await getPost(slug);
	if (!post) {
    return {
      notFound: true,
    };
  }	

	return {
		props: { post, slug },
	};

} 
  
  export default function Post({post, slug}) {
  
    const [showComments, setShowComments]=useState(false)
    const { data, error, mutate } = useSWR(slug,fetcher, { fallbackData: post, refreshInterval: 30000 } )
    const [disabled, setDisabled] = useState(false)
    return (
        <div className="full-card">
            <video className="vid-full" playsInline autoPlay muted loop>
                <source src={data.downloadUrl} type="video/mp4" />
            </video> 
            <div className='card-full-username'>
                <Link href={`/${data.author.username.username}`}>
                <a >
                    @{data.author.username.username}
                </a>
                </Link>
            </div>
            <AuthCheck
              fallback={
                <div className='heart-set'>
                  <Link href="/signinup" passHref>
                    <button>💗 Sign Up</button>
                  </Link>
                </div>
              }
            >
              <div>
                 <Comments mutate={mutate} content={data} commentCount={data.commentCount} setshow={setShowComments} postRef={data.id} show={showComments}/>
                <div className='heart-set'>
                   <HeartButton mutate={mutate} content={data} postRef={data.id} disabled={disabled} setDisabled={setDisabled} />
                  <strong>{data.heartCount || 0}🤍</strong>
                  <CommentButton  postRef={data.id} setshow={setShowComments} />
                </div>
              </div>
            </AuthCheck>
            
        </div> 
    );
  }