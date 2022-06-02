/* eslint-disable react/display-name */
import Link from "next/link";
import { useRouter } from "next/router";
import HeartButton from "./HeartButton";
import AuthCheck from "./AuthCheck";
import { useState, useEffect, useRef, memo } from "react";
import Comments from "./CommentsWindow";
import { CommentButton } from "./CommentsWindow";
import { useInView } from "react-intersection-observer";
import Image from "next/image";
import InfiniteScroll from "react-infinite-scroll-component";
import FollowButton from "../components/FollowButtonFeed";

export default function PostFeed({ posts, admin, hasNextPage, fetchNextPage, locationKey }) {
  return (
    <InfiniteScroll
      dataLength={posts.length}
      hasMore={hasNextPage}
      next={fetchNextPage}
    >
      {posts.map((post) => (
        <PostItem post={post} key={post.id} admin={admin} locationKey={locationKey} />
      ))}
    </InfiniteScroll>
  );
}

const PostItem = ({ post, admin = false, locationKey }) => {
  const router = useRouter();
  const [postRef, setPostRef] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [play, setPlay] = useState(true);
  const [mute, setMute] = useState(true);
  const [disabled, setDisabled] = useState(false);
  const [followDisabled, setFollowDisabled] = useState(false);
  const { ref, inView, entry } = useInView({
    threshold: 0.75,
  });

  const handleClick = (e) => {
    if (play) {
      e.target.pause();
      setPlay(false);
    } else {
      e.target.play();
      setPlay(true);
    }
  };

  useEffect(() => {
    if (inView) {
      if (entry) {
        setPlay(true);
        setMute(false);
        entry.target.play();
      }
    } else if (!inView) {
      if (entry) {
        setPlay(false);
        entry.target.pause();
        setShowComments(false);
        setMute(true);
      }
    }
  }, [inView, entry]);

  return (
    <div className="full-card">
      <video
        ref={ref}
        onClick={handleClick}
        className="vid-full"
        playsInline
        loop
        muted={mute}
        preload="metadata"
      >
        <source src={post.downloadUrl} type="video/mp4" />
        <source src={post.downloadUrl} type="video/quicktime" />
      </video>
      <div className="card-full-username">
        <Link href={`/${post.author.username.username}`}>
          <a>@{post.author.username.username}</a>
        </Link>
      </div>
      <AuthCheck
        fallback={
          <div className="heart-set">
            <Link href="/signinup">
              <button>💗 Sign Up</button>
            </Link>
          </div>
        }
      >
        <div>
          <Comments
            mainFeed={true}
            content={post}
            commentCount={post._count.comments}
            setshow={setShowComments}
            postRef={post.id}
            show={showComments}
            locationKey={locationKey}
          />
          <div className="heart-set">
            <Link passHref href={`/${post.author.username.username}`}>
              <img src={post.author.profilePictureUrl} />
            </Link>
            <FollowButton
              content={post}
              postRef={post.id}
              disabled={followDisabled}
              setDisabled={setFollowDisabled}
              locationKey={locationKey}
            />
            <HeartButton
              mainFeed={true}
              content={post}
              postRef={post.id}
              disabled={disabled}
              setDisabled={setDisabled}
              locationKey={locationKey}
            />
            <strong>{post._count.hearts || 0}</strong>
            <CommentButton postRef={post.id} setshow={setShowComments} />
            <strong>{post._count.comments || 0}</strong>
          </div>
        </div>
      </AuthCheck>
    </div>
  );
};
