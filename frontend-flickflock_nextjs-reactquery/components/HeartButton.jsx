import { useContext } from "react";
import { UserContext } from "../lib/context";
import {
  addHeart,
  removeHeart,
} from "../lib/authServices";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "react-query";

export default function Heart({
  postRef,
  content,
  locationKey,
  disabled,
  setDisabled,
}) {
  const [userContext, setUserContext] = useContext(UserContext);
  const { hearts } = content;
  const docHeartCount = content._count.hearts;
  let heartDoc = hearts.filter((heart) => heart.userId === userContext.user.id);
  const queryClient = useQueryClient();

  const addMutation = useMutation(addHeart, {
    onMutate: async (newHeart) => {
      // Stop the queries that may affect this operation
      await queryClient.cancelQueries(locationKey);

      // Get a snapshot of current data
      const snapshotOfPreviousPosts = queryClient.getQueryData(locationKey);

      // Modify cache to reflect this optimistic update
      queryClient.setQueryData(locationKey, (oldPosts) => {
        oldPosts.pages.map((page) => {
          return page.results.map((post) => {
            if (post.id === content.id) {
              post.hearts = [newHeart, ...hearts];
              post._count.hearts = docHeartCount + 1;
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

    onSettled: () => {
      // Refetch or invalidate related queries
      queryClient.invalidateQueries(locationKey);
    },
  });

  const removeMutation = useMutation(removeHeart, {
    onMutate: async (postId) => {
      // Stop the queries that may affect this operation
      await queryClient.cancelQueries(locationKey);

      // Get a snapshot of current data
      const snapshotOfPreviousPosts = queryClient.getQueryData(locationKey);

      // Modify cache to reflect this optimistic update
      queryClient.setQueryData(locationKey, (oldPosts) => {
        oldPosts.pages.map((page) => {
          return page.results.map((post) => {
            if (post.id === content.id) {
              post.hearts = [];
              post._count.hearts = docHeartCount - 1;
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

    onSettled: () => {
      // Refetch or invalidate related queries
      queryClient.invalidateQueries(locationKey);
    },
  });

  const addHeartToPost = async (e) => {
    e.stopPropagation();
    const newHeart = {
      userId: userContext.user.id,
      postId: content.id,
    };

    try {
      setDisabled(true );
      setTimeout(() => {
        setDisabled(false);
      }, 1500);

      addMutation.mutate(newHeart);

    } catch (err) {
      heartDoc = [];
      toast.error(`failed to add heart due to error: ${err}`);
    }
  };

  // Remove a user-to-post relationship
  const removeHeartFromPost = async (e) => {
    e.stopPropagation();
    try {
      /* heartDoc = []; */
      setDisabled(true);
      setTimeout(() => {
        setDisabled(false);
      }, 1500);
      
        removeMutation.mutate(content.id)
      
    } catch (err) {
      heartDoc = content.hearts.filter(
        (heart) => heart.userId === userContext.user.id
      );
      toast.error(`failed to remove heart due to error: ${err}`);
    }
  };
  return heartDoc.length > 0 ? (
    <button disabled={disabled} onClick={removeHeartFromPost}>
      💗
    </button>
  ) : (
    <button disabled={disabled} onClick={addHeartToPost}>
      💔
    </button>
  );
}
