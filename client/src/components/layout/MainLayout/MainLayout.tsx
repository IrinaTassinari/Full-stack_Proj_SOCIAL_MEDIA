import { useState } from "react";
import { Outlet } from "react-router-dom";
import LeftSidebar from "../LeftSidebar/LeftSidebar";
import Footer from "../Footer/Footer";
import NotificationsPanel from "../NotificationsPanel/NotificationsPanel";
import OverlayPanel from "../OverlayPanel/OverlayPanel";
import SearchPanel from "../SearchPanel/SearchPanel";
import styles from "./MainLayout.module.css";

function MainLayout() {
  const [activePanel, setActivePanel] = useState<"search" | "notifications" | null>(
    null,
  );

  const closePanel = () => {
    setActivePanel(null);
  };

  return (
    <div className={styles.layout}>
      <LeftSidebar
        isSearchOpen={activePanel === "search"}
        isNotificationsOpen={activePanel === "notifications"}
        onSearchClick={() => setActivePanel("search")}
        onNotificationsClick={() => setActivePanel("notifications")}
      />
      <main className={styles.content}>
        <div className={styles.pageContent}>
          <Outlet />
        </div>
        <Footer />
      </main>

      {activePanel === "search" && (
        <OverlayPanel onClose={closePanel}>
          <SearchPanel />
        </OverlayPanel>
      )}

      {activePanel === "notifications" && (
        <OverlayPanel onClose={closePanel}>
          <NotificationsPanel />
        </OverlayPanel>
      )}
    </div>
  );
}

export default MainLayout;
