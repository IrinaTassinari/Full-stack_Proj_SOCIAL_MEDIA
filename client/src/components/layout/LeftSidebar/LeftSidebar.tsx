import { NavLink } from "react-router-dom";
import styles from "./LeftSidebar.module.css";

const navItems = [
  { label: "Explore", to: "/explore", icon: "/icons/explore.png" },
  { label: "Messages", to: "/messages", icon: "/icons/messages.png" },
];

type LeftSidebarProps = {
  isSearchOpen?: boolean;
  isNotificationsOpen?: boolean;
  onSearchClick: () => void;
  onNotificationsClick: () => void;
};

function LeftSidebar({
  isSearchOpen = false,
  isNotificationsOpen = false,
  onSearchClick,
  onNotificationsClick,
}: LeftSidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <NavLink className={styles.logoLink} to="/" aria-label="ICHgram home">
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
              <NavLink
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.active : ""}`
                }
                to={item.to}
              >
                <img
                  className={styles.icon}
                  src={item.icon}
                  alt=""
                  aria-hidden="true"
                />
                <span>{item.label}</span>
              </NavLink>
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
      >
        <img
          className={styles.profileIcon}
          src="/icons/ICH_Profile.png"
          alt=""
          aria-hidden="true"
        />
        <span>Profile</span>
      </NavLink>
    </aside>
  );
}

export default LeftSidebar;
