import styles from "./NotificationsPanel.module.css";

type NotificationItem = {
  id: string;
  username: string;
  action: string;
  time: string;
  avatar: string;
  postImage: string;
};

const notifications: NotificationItem[] = [
  {
    id: "liked-photo",
    username: "sashaa",
    action: "liked your photo.",
    time: "2 d",
    avatar: "/icons/ICH_Profile.png",
    postImage:
      "https://res.cloudinary.com/demo/image/upload/w_80,h_80,c_fill,g_auto/sample.jpg",
  },
  {
    id: "commented-photo",
    username: "sashaa",
    action: "commented your photo.",
    time: "2 wek",
    avatar: "/icons/ICH_Profile.png",
    postImage:
      "https://res.cloudinary.com/demo/image/upload/w_80,h_80,c_fill,g_auto/sample.jpg",
  },
  {
    id: "started-following",
    username: "sashaa",
    action: "started following.",
    time: "2 d",
    avatar: "/icons/ICH_Profile.png",
    postImage:
      "https://res.cloudinary.com/demo/image/upload/w_80,h_80,c_fill,g_auto/sample.jpg",
  },
];

function NotificationsPanel() {
  return (
    <section className={styles.notificationsPanel}>
      <h2 className={styles.title}>Notifications</h2>
      <h3 className={styles.subtitle}>New</h3>

      <ul className={styles.list}>
        {notifications.map((notification) => (
          <li className={styles.item} key={notification.id}>
            <img
              className={styles.avatar}
              src={notification.avatar}
              alt=""
              aria-hidden="true"
            />

            <p className={styles.text}>
              <span>{notification.username}</span> {notification.action}{" "}
              <time>{notification.time}</time>
            </p>

            <img
              className={styles.postImage}
              src={notification.postImage}
              alt=""
              aria-hidden="true"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

export default NotificationsPanel;
