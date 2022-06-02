import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { Modal, Button } from "@mantine/core";
import { useQueryClient } from "react-query";
import { deletePost } from '../lib/authServices'
import toast from "react-hot-toast";

export default function PostGrid({ posts, admin, username }) {
  return posts
    ? posts.map((post) => (
        <PostItem post={post} key={post.id} admin={admin} username={username} />
      ))
    : null;
}

function PostItem({ post, admin = false, username }) {
  const queryClient = useQueryClient();
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const router = useRouter();

  const handleClick = (e) => {
    router.push(`/${username}/feed`);
  };
  const deletePostClick = async (e) => {
    e.stopPropagation();
    setDeleteModalOpened(true);
  };

  const confirmDelete = async () => {
    try {
      await deletePost(post.id);
      queryClient.invalidateQueries(username)
      toast.success('deleted post')
    } catch (err) {
      toast.error(`failed to remove post due to error: ${err}`);
    }
    setDeleteModalOpened(false);
  };

  return (
    <div className="card">
      <video
        onClick={handleClick}
        className="vid-preview"
        playsInline
        autoPlay
        muted
        loop
      >
        <source src={post.downloadUrl} type="video/mp4" />
      </video>
      {admin && (
        <div className="postDeleteButton" onClick={deletePostClick}>
          x
        </div>
      )}
      <Modal
        centered
        opened={deleteModalOpened}
        onClose={() => setDeleteModalOpened(false)}
      >
        <h2>you sure you want to delete your post?</h2>
        <Button
          variant="light"
          type="submit"
          color="grape"
          radius="md"
          size="md"
          onClick={confirmDelete}
        >
          Delete Post
        </Button>
      </Modal>
    </div>
  );
}
