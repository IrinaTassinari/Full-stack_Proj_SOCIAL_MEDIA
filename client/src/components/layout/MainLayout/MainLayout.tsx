import { Outlet } from "react-router-dom";
import LeftSidebar from "../LeftSidebar/LeftSidebar";
import Footer from "../Footer/Footer";
import styles from "./MainLayout.module.css";

function MainLayout() {
  return (
    <div className={styles.layout}>
      <LeftSidebar />
      <main className={styles.content}>
        <div className={styles.pageContent}>
          <Outlet />
        </div>
        <Footer />
      </main>
    </div>
  );
}

export default MainLayout;
