import styles from "./HomePage.module.css";

type FeedPost = {
  id: string;
  author: {
    username: string;
    avatar: string;
  };
  createdAtLabel: string;
  image: string;
  likes: string;
  caption: string;
  previewComment: string;
  commentsCount: string;
};

const mockPosts: FeedPost[] = Array.from({ length: 4 }, (_, index) => ({
  id: `post-${index + 1}`,
  author: {
    username: "sashaa",
    avatar: "/icons/ICH_Profile.png",
  },
  createdAtLabel: "2 week",
  // Temporary Cloudinary URL for layout. Real posts will use post.image from API.
  image:
    "https://res.cloudinary.com/demo/image/upload/w_640,h_640,c_fill,g_auto/sample.jpg",
  likes: "101 824",
  caption: "It's golden, Ponyboy!",
  previewComment: "heyyyyy",
  commentsCount: "732",
}));

function HomePage() {
  return (
    <section className={styles.page}>
      <div className={styles.feedGrid}>
        {mockPosts.map((post) => (
          <article className={styles.postCard} key={post.id}>
            <header className={styles.postHeader}>
              <img
                className={styles.avatar}
                src={post.author.avatar}
                alt={`${post.author.username} avatar`}
              />

              <div className={styles.authorMeta}>
                <span className={styles.username}>{post.author.username}</span>
                <span className={styles.dot}>·</span>
                <span className={styles.time}>{post.createdAtLabel}</span>
                <span className={styles.dot}>·</span>
              </div>

              <button className={styles.followButton} type="button">
                follow
              </button>
            </header>

            <img className={styles.postImage} src={post.image} alt="" />

            <div className={styles.actions}>
              <button className={styles.iconButton} type="button" aria-label="Like">
                <img src="/icons/button-like.png" alt="" aria-hidden="true" />
              </button>
              <button
                className={styles.iconButton}
                type="button"
                aria-label="Comment"
              >
                <img src="/icons/button-comments.png" alt="" aria-hidden="true" />
              </button>
            </div>

            <p className={styles.likes}>{post.likes} likes</p>

            <p className={styles.caption}>
              <span>{post.author.username}</span> <em>{post.caption}</em>
            </p>

            <p className={styles.previewComment}>
              {post.previewComment}
              <span>| ... more</span>
            </p>

            <button className={styles.commentsButton} type="button">
              View all comments ({post.commentsCount})
            </button>
          </article>
        ))}
      </div>

      <div className={styles.updates}>
        <img
          className={styles.checkIcon}
          src="/icons/seen_all_updates.png"
          alt=""
          aria-hidden="true"
        />
        <p className={styles.updatesTitle}>You&apos;ve seen all the updates</p>
        <p className={styles.updatesText}>You have viewed all new publications</p>
      </div>
    </section>
  );
}

export default HomePage;
