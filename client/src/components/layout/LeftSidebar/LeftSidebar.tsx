import { useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../../../features/auth/authSlice";
import { fetchMessageNotifications } from "../../../features/messageNotifications/messageNotificationsThunks";
import { fetchMyProfile } from "../../../features/profile/profileThunks";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import styles from "./LeftSidebar.module.css";

const navItems = [
  { label: "Explore", to: "/explore", icon: "/icons/explore.png" },
  { label: "Messages", to: "/messages", icon: "/icons/messages.png" },
];

type LeftSidebarProps = {
  isSearchOpen?: boolean;
  isNotificationsOpen?: boolean;
  isMobileOpen?: boolean;
  onSearchClick: () => void;
  onNotificationsClick: () => void;
  onNavigate: () => void;
};

function LeftSidebar({
  isSearchOpen = false,
  isNotificationsOpen = false,
  isMobileOpen = false,
  onSearchClick,
  onNotificationsClick,
  onNavigate,
}: LeftSidebarProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { myProfile } = useAppSelector((state) => state.profile);
  const unreadMessageNotifications = useAppSelector(
    (state) => state.messageNotifications.unreadCount,
  );
  const profileAvatar = myProfile?.avatar || "/icons/ICH_avatar.png";

  useEffect(() => {
    dispatch(fetchMyProfile());
    dispatch(fetchMessageNotifications());
  }, [dispatch]);

  const handleLogout = () => {
    onNavigate();
    dispatch(logout()); // в authSlice.ts есть reducers logout - Redux Toolkit из этого reducer автоматически создаёт функцию logout() и через dispatch её вызываем
    navigate("/login");
  };

  const handleMessagesClick = () => {
    onNavigate();
    navigate(location.pathname === "/messages" ? "/" : "/messages");
  };

  return (
    <aside
      className={`${styles.sidebar} ${
        location.pathname === "/messages" ? styles.messagesSidebar : ""
      } ${isMobileOpen ? styles.mobileOpen : ""}`}
    >
      <NavLink
        className={styles.logoLink}
        to="/"
        aria-label="ICHgram home"
        onClick={onNavigate}
      >
        <img
          className={styles.logo}
          src="/images/ICHGRAM_logo.png"
          alt="ICHGRAM"
        />
      </NavLink>

      <nav className={styles.nav} aria-label="Main navigation">
        <ul className={styles.navList}>
          <li>
            <NavLink
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ""}`
              }
              to="/"
              onClick={onNavigate}
            >
              <img
                className={styles.icon}
                src="/icons/home.png"
                alt=""
                aria-hidden="true"
              />
              <span>Home</span>
            </NavLink>
          </li>

          <li>
            <button
              className={`${styles.navLink} ${styles.navButton} ${
                isSearchOpen ? styles.active : ""
              }`}
              type="button"
              onClick={onSearchClick}
            >
              <img
                className={styles.icon}
                src="/icons/search.png"
                alt=""
                aria-hidden="true"
              />
              <span>Search</span>
            </button>
          </li>

          {navItems.map((item) => (
            <li key={item.label}>
              {item.to === "/messages" ? (
                <button
                  className={`${styles.navLink} ${styles.navButton} ${
                    location.pathname === "/messages" ? styles.active : ""
                  }`}
                  type="button"
                  onClick={handleMessagesClick}
                >
                  <img
                    className={styles.icon}
                    src={item.icon}
                    alt=""
                    aria-hidden="true"
                  />
                  <span>{item.label}</span>
                  {unreadMessageNotifications > 0 && (
                    <span className={styles.badge}>
                      {unreadMessageNotifications > 9
                        ? "9+"
                        : unreadMessageNotifications}
                    </span>
                  )}
                </button>
              ) : (
                <NavLink
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.active : ""}`
                  }
                  to={item.to}
                  onClick={onNavigate}
                >
                  <img
                    className={styles.icon}
                    src={item.icon}
                    alt=""
                    aria-hidden="true"
                  />
                  <span>{item.label}</span>
                </NavLink>
              )}
            </li>
          ))}

          <li>
            <button
              className={`${styles.navLink} ${styles.navButton} ${
                isNotificationsOpen ? styles.active : ""
              }`}
              type="button"
              onClick={onNotificationsClick}
            >
              <img
                className={styles.icon}
                src="/icons/notification.png"
                alt=""
                aria-hidden="true"
              />
              <span>Notifications</span>
            </button>
          </li>

          <li>
            <NavLink
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ""}`
              }
              to="/create"
              onClick={onNavigate}
            >
              <img
                className={styles.icon}
                src="/icons/create.png"
                alt=""
                aria-hidden="true"
              />
              <span>Create</span>
            </NavLink>
          </li>
        </ul>
      </nav>

      <NavLink
        className={({ isActive }) =>
          `${styles.profileLink} ${isActive ? styles.active : ""}`
        }
        to="/profile"
        onClick={onNavigate}
      >
        <img
          className={styles.profileIcon}
          src={profileAvatar}
          alt=""
          aria-hidden="true"
        />
        <span>Profile</span>
      </NavLink>

      <button className={styles.logoutButton} type="button" onClick={handleLogout}>
        <img
          className={styles.logoutIcon}
          src="/icons/logout-icon.webp"
          alt=""
          aria-hidden="true"
        />
        <span>Log out</span>
      </button>
    </aside>
  );
}

export default LeftSidebar;
