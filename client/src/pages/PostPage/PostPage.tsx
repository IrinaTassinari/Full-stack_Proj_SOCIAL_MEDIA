import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PostPreviewModal from "../../components/posts/PostPreviewModal";
import Spinner from "../../components/ui/Spinner/Spinner";
import { fetchPostById } from "../../features/posts/postsThunks";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import styles from "./PostPage.module.css";

function PostPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedPost, selectedStatus, error } = useAppSelector(
    (state) => state.posts,
  );

  useEffect(() => {
    if (postId) {
      dispatch(fetchPostById(postId));
    }
  }, [dispatch, postId]);

  const handleBack = () => {
    if ((window.history.state?.idx ?? 0) > 0) {
      navigate(-1);
      return;
    }

    if (selectedPost) {
      navigate(`/users/${selectedPost.author._id}`);
      return;
    }

    navigate("/");
  };

  if (selectedStatus === "loading") {
    return <Spinner label="Loading post..." />;
  }

  if (selectedStatus === "failed") {
    return <p className={styles.errorText}>{error || "Failed to load post"}</p>;
  }

  if (!selectedPost || selectedPost._id !== postId) {
    return <Spinner label="Loading post..." />;
  }

  return (
    <PostPreviewModal
      post={selectedPost}
      displayMode="page"
      showGoToPostAction={false}
      onClose={handleBack}
    />
  );
}

export default PostPage;
