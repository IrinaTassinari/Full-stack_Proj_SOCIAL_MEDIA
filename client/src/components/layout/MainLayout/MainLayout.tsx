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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const closePanel = () => {
    setActivePanel(null);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  const handleNavigate = () => {
    closePanel();
    closeMobileSidebar();
  };

  const togglePanel = (panel: "search" | "notifications") => {
    setActivePanel((currentPanel) => (currentPanel === panel ? null : panel));
    closeMobileSidebar();
  };

  return (
    <div className={styles.layout}>
      <button
        className={styles.mobileMenuButton}
        type="button"
        aria-label="Open menu"
        aria-expanded={isMobileSidebarOpen}
        onClick={() => setIsMobileSidebarOpen((isOpen) => !isOpen)}
      >
        <span />
        <span />
        <span />
      </button>
      {isMobileSidebarOpen && (
        <button
          className={styles.mobileBackdrop}
          type="button"
          aria-label="Close menu"
          onClick={closeMobileSidebar}
        />
      )}
      <LeftSidebar
        isSearchOpen={activePanel === "search"}
        isNotificationsOpen={activePanel === "notifications"}
        isMobileOpen={isMobileSidebarOpen}
        onSearchClick={() => togglePanel("search")}
        onNotificationsClick={() => togglePanel("notifications")}
        onNavigate={handleNavigate}
      />
      <main className={styles.content}>
        <div className={styles.pageContent}>
          <Outlet />
        </div>
        <Footer />
      </main>

      {activePanel === "search" && (
        <OverlayPanel onClose={closePanel}>
          <SearchPanel onClose={closePanel} />
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
