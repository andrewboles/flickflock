import { useState, useEffect, useContext, useRef } from 'react';
import { createComment, removeComment  } from '../lib/authServices'
import Link from 'next/link';
import { UserContext } from '../lib/context';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from "react-query";
import  { createObjectID } from 'mongo-object-reader';
import { useAutoAnimate} from '@formkit/auto-animate/react'
import { Modal, Button } from '@mantine/core';
import HeartComment from './HeartComment';

export default function Comments({ postRef, show, setshow, commentCount, content, locationKey }) {
    const [userContext, setUserContext] = useContext(UserContext);
    const [commentText, setCommentText] = useState('');
    const { comments } = content;
    const docCommentCount = content._count.comments
    const queryClient = useQueryClient();
    const [animationParent] = useAutoAnimate()
    const [cancelModalOpened, setCancelModalOpened] = useState(false)
    const [commentDeleteKey, setCommentDeleteKey] = useState(null);
    const [disabled, setDisabled] = useState(false);
    
    // Create a user-to-post relationship
    const addMutation = useMutation(createComment, {
      onMutate: async ({postRef, commentText, id}) => {
        const newComment = {
          comment: commentText,
          User:{
            username:{
              username: userContext.user.username.username
            },
            profilePictureUrl: userContext.user.profilePictureUrl
          },
          id
        }
        // Stop the queries that may affect this operation
        await queryClient.cancelQueries(locationKey);
  
        // Get a snapshot of current data
        const snapshotOfPreviousPosts = queryClient.getQueryData(locationKey);
  
        // Modify cache to reflect this optimistic update
        queryClient.setQueryData(locationKey, (oldPosts) => {
          oldPosts.pages.map((page) => {
            return page.results.map((post) => {
              if (post.id === content.id) {
                post.comments = [newComment, ...comments];
                post._count.comments = docCommentCount + 1;
              }
              return post;
            });
          });
          return oldPosts;
        });
  
        // Return a snapshot so we can rollback in case of failure
        return {
          snapshotOfPreviousPosts,
        };
      },
  
      onError: (error, postId, { snapshotOfPreviousPosts }) => {
        // Rollback the changes using the snapshot
        console.log("error", error)
        queryClient.setQueryData(locationKey, snapshotOfPreviousPosts);
      },
  
      onSuccess: ()=> {
        // Refetch or invalidate related queries
        queryClient.invalidateQueries(locationKey);
      },
    });

    const deleteMutation = useMutation(removeComment, {
      onMutate: async (commentId) => {
        
        // Stop the queries that may affect this operation
        await queryClient.cancelQueries(locationKey);
  
        // Get a snapshot of current data
        const snapshotOfPreviousPosts = queryClient.getQueryData(locationKey);
  
        // Modify cache to reflect this optimistic update
        queryClient.setQueryData(locationKey, (oldPosts) => {
          let tempComments = comments.filter(comment=> comment.id !== commentId)
          oldPosts.pages.map((page) => {
            return page.results.map((post) => {
              if (post.id === content.id) {
                post.comments = tempComments;
                post._count.comments = docCommentCount - 1;
              }
              return post;
            });
          });
          return oldPosts;
        });
  
        // Return a snapshot so we can rollback in case of failure
        return {
          snapshotOfPreviousPosts,
        };
      },
  
      onError: (error, postId, { snapshotOfPreviousPosts }) => {
        // Rollback the changes using the snapshot
        og("error", error)
        queryClient.setQueryData(locationKey, snapshotOfPreviousPosts);
      },
  
      onSuccess: ()=> {
        // Refetch or invalidate related queries
        queryClient.invalidateQueries(locationKey);
      },
    });
  
    const addComment = async e => {
     
      e.preventDefault();
      e.stopPropagation();
       if (commentText == "") return null
      
      try{
        let tempId=createObjectID()
        addMutation.mutate({postRef, commentText, id: tempId})
        setCommentText('')
      } catch (err) {
        toast.error(`failed to create comment due to error: ${err}`)
      }
      
    };
    const handleChange = e => {
      setCommentText(e.target.value)
    }
  
    // Remove a user-to-post relationship
    const deleteComment = async e => {
      e.stopPropagation();
      setCommentDeleteKey(e.target.accessKey);
      setCancelModalOpened(true)
      
    };
    const toggleCommentBox = () => {
      setshow(current=>!current)
    }

    const confirmDelete = () => {
      if (!commentDeleteKey) return setCancelModalOpened(false)
      try{

        deleteMutation.mutate(commentDeleteKey)
        } catch (err){
          toast.error(`failed to remove comment due to error: ${err}`)
        }
        setCancelModalOpened(false)
    }
  
    return (
      <div className={!show ? 'hide-comments':'show-comments'}>
        <div className='commentcount-and-close'>
            <Modal
            centered
            opened={cancelModalOpened}
            onClose={() => setCancelModalOpened(false)}
          >
            <h2>you sure you want to delete your comment?</h2>
            <Button
              variant="light"
              type="submit"
              color="grape"
              radius="md"
              size="md"
              onClick={confirmDelete}
            >
              Delete Comment
            </Button>
          </Modal>
         <div className='commentcount'>{commentCount} Comments</div>
         <div className="close" onClick={toggleCommentBox}>X</div>
        </div>
        <form onSubmit={addComment} className="comment-form">
          <input type='text' placeholder='...' value={commentText} onChange={handleChange}/>
          <button type='submit'>✔️</button>
        </form>
        <div className='comment-section' ref={animationParent}>
          {comments && comments.map(comment=>
          <div key={comment.id}>
            <Link passHref href={`/${comment.User.username.username}`}>
               <img src={comment.User.profilePictureUrl} />
            </Link>
            
            <div className='comment-main'>
              <div>
               <p>{comment.User.username.username}</p>
               <h5>{comment.comment}</h5>
               {(comment.User.username.username === userContext.user.username.username) && <h5 accessKey={comment.id} onClick={deleteComment}>X</h5>}
             </div>
             <div className='commentHeartSection'>
             <HeartComment disabled={disabled} setDisabled={setDisabled} content={comment} locationKey={locationKey}/>
              {comment._count?.CommentHearts || 0}
              </div>
              </div>
          </div>
          )}
        </div>
      </div>
    );
  }

  export function CommentButton({ setshow }) {
    const toggleCommentBox = () => {
        setshow(current=>!current)
    }
    return (
      <button onClick={toggleCommentBox}>💬</button>
    );
  }