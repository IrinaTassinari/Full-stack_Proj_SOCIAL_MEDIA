import { useState } from "react";
import styles from "./SearchPanel.module.css";

function SearchPanel() {
  const [searchValue, setSearchValue] = useState("");

  return (
    <section className={styles.searchPanel}>
      <h2 className={styles.title}>Search</h2>

      <label className={styles.searchField}>
        <span className={styles.visuallyHidden}>Search</span>
        <input
          className={styles.input}
          type="text"
          placeholder="Search"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
        />

        <button
          className={styles.clearButton}
          type="button"
          aria-label="Clear search"
          onClick={() => setSearchValue("")}
        >
          <img src="/icons/button-close.png" alt="" aria-hidden="true" />
        </button>
      </label>

      <div className={styles.recentBlock}>
        <h3 className={styles.subtitle}>Recent</h3>

        <button className={styles.userButton} type="button">
          <img
            className={styles.avatar}
            src="/icons/ICH_Profile.png"
            alt=""
            aria-hidden="true"
          />
          <span>sashaa</span>
        </button>
      </div>
    </section>
  );
}

export default SearchPanel;
