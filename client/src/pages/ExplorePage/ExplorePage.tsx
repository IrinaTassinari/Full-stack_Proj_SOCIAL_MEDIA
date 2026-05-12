import { useEffect } from "react";
import { fetchExplorePosts } from "../../features/posts/postsThunks";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import styles from "./ExplorePage.module.css";

function ExplorePage() {
  const dispatch = useAppDispatch();
  const { explorePosts, status, error } = useAppSelector((state) => state.posts);

  useEffect(() => {
    dispatch(fetchExplorePosts());
  }, [dispatch]);

  if (status === "loading") {
    return <p className={styles.stateText}>Loading posts...</p>;
  }

  if (status === "failed") {
    return <p className={styles.errorText}>{error}</p>;
  }

  if (status === "succeeded" && explorePosts.length === 0) {
    return <p className={styles.stateText}>No posts yet.</p>;
  }

  return (
    <section className={styles.page} aria-label="Explore posts">
      <div className={styles.grid}>
        {/* Это логика, которая назначает разным картинкам разные размеры в сетке Explore */}
        {explorePosts.map((post, index) => (
          <article
            className={`${styles.tile} ${
              index % 7 === 2 || index % 7 === 5 ? styles.tall : ""
            } ${index % 11 === 6 ? styles.wide : ""}`}
            key={post._id}
          >
            <img
              className={styles.image}
              src={post.image}
              alt={post.description || `${post.author.username} post`}
            />
          </article>
        ))}
      </div>
    </section>
  );
}

export default ExplorePage;
