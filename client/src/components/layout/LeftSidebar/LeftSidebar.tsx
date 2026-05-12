import { NavLink } from "react-router-dom";
import styles from "./LeftSidebar.module.css";

const navItems = [
  { label: "Home", to: "/", icon: "/icons/home.png" },
  { label: "Search", to: "/search", icon: "/icons/search.png" },
  { label: "Explore", to: "/explore", icon: "/icons/explore.png" },
  { label: "Messages", to: "/messages", icon: "/icons/messages.png" },
  { label: "Notification", to: "/notifications", icon: "/icons/notification.png" },
  { label: "Create", to: "/create", icon: "/icons/create.png" },
];

function LeftSidebar() {
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
