import { useContext } from "react";
import { UserContext } from "../lib/context";
import {
  addCommentHeart,
  removeCommentHeart,
} from "../lib/authServices";
import toast from "react-hot-toast";
import { useQueryClient } from "react-query";

export default function HeartComment({
  content,
  disabled,
  setDisabled,
  locationKey
}) {
  const [userContext, setUserContext] = useContext(UserContext);
  const { CommentHearts } = content;
  const docHeartCount = content?._count?.CommentHearts;
  let heartDoc=[]
  if(docHeartCount){
    heartDoc = CommentHearts.filter((heart) => heart.userId === userContext.user.id);
  }
  const queryClient = useQueryClient();

  const addCommentHeartToPost = async (e) => {
    e.stopPropagation();
    const newCommentHeart = {
      userId: userContext.user.id,
      commentId: content.id,
    };

    try {
      setDisabled(true);
      setTimeout(() => {
        setDisabled(false);
      }, 1500);

      await addCommentHeart(newCommentHeart)
      queryClient.invalidateQueries(locationKey)
    } catch (err) {
      toast.error(`failed to add comment heart due to error: ${err}`);
    }
  };

  // Remove a user-to-post relationship
  const removeCommentHeartFromPost = async (e) => {
    e.stopPropagation();
    try {
      setDisabled(true);
      setTimeout(() => {
        setDisabled(false);
      }, 1500);
      
        await removeCommentHeart(content.id)
        queryClient.invalidateQueries(locationKey)
    } catch (err) {
      toast.error(`failed to remove heart due to error: ${err}`);
    }
  };
  return heartDoc.length > 0 ? (
    <button disabled={disabled} onClick={removeCommentHeartFromPost}>
      💗
    </button>
  ) : (
    <button disabled={disabled} onClick={addCommentHeartToPost}>
      💔
    </button>
  );
}
