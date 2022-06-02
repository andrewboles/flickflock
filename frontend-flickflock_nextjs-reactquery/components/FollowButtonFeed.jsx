import { useContext } from "react";
import { UserContext } from "../lib/context";
import {
  followUser,
  unfollowUser,
} from "../lib/authServices";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "react-query";

export default function FollowButtonFeed({
  postRef,
  content,
  disabled,
  setDisabled,
  locationKey,
}) {
  const [userContext, setUserContext] = useContext(UserContext);
  const { followers } = content.author
  let followDoc = followers.filter((follower) => follower.followerId === userContext.user.id);
  const queryClient = useQueryClient();

  const followMutation = useMutation(followUser, {
    onMutate: async (newFollowerDoc) => {
      // Stop the queries that may affect this operation
      await queryClient.cancelQueries(locationKey);

      // Get a snapshot of current data
      const snapshotOfPreviousPosts = queryClient.getQueryData(locationKey);

      // Modify cache to reflect this optimistic update
      queryClient.setQueryData(locationKey, (oldPosts) => {
        oldPosts.pages.map((page) => {
          return page.results.map((post) => {
            if (post.id === content.id) {
              post.author.followers = [newFollowerDoc]
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
      queryClient.setQueryData(locationKey, snapshotOfPreviousPosts);
    },

    onSettled: () =>{
      // Refetch or invalidate related queries
      queryClient.invalidateQueries(locationKey);
    },
  });

  const unfollowMutation = useMutation(unfollowUser, {
    onMutate: async (authorId) => {
      // Stop the queries that may affect this operation
      await queryClient.cancelQueries(locationKey);

      // Get a snapshot of current data
      const snapshotOfPreviousPosts = queryClient.getQueryData(locationKey);

      // Modify cache to reflect this optimistic update
      queryClient.setQueryData(locationKey, (oldPosts) => {
        oldPosts.pages.map((page) => {
          return page.results.map((post) => {
            if (post.id === content.id) {
              post.author.followers = []
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
      queryClient.setQueryData(locationKey, snapshotOfPreviousPosts);
    },

    onSettled: () =>{
      // Refetch or invalidate related queries
      queryClient.invalidateQueries(locationKey);
    },
  });

  const addFollow = async (e) => {
    e.stopPropagation();
    const newFollowerDoc = {
      followerId: userContext.user.id,
      followingId: content.author.id,
    };

    try {
      setDisabled(true);
      setTimeout(() => {
        setDisabled(false);
      }, 1500);
      followMutation.mutate(newFollowerDoc);
      
    } catch (err) {
      toast.error(`failed to follow due to error: ${err}`);
    }
  };

  // Remove a user-to-post relationship
  const removeFollow = async (e) => {
    e.stopPropagation();
    try {
      /* heartDoc = []; */
      setDisabled(true);
      setTimeout(() => {
        setDisabled(false);
      }, 1500);
      unfollowMutation.mutate(content.author.id)
    } catch (err) {
      toast.error(`failed to unfollow due to error: ${err}`);
    }
  };
  return userContext.user.id===content.author.id ? null : followDoc.length<1 ? (
    <button disabled={disabled} onClick={addFollow}>
      Follow
    </button>
  ) : (
    <button disabled={disabled} onClick={removeFollow}>
      Unfollow
    </button>
  );
}
