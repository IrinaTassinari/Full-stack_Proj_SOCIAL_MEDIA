import NotificationsPanel from "../../components/layout/NotificationsPanel/NotificationsPanel";
import styles from "./NotificationsPage.module.css";

function NotificationsPage() {
  return (
    <div className={styles.page}>
      <NotificationsPanel />
    </div>
  );
}

export default NotificationsPage;
