import SearchPanel from "../../components/layout/SearchPanel/SearchPanel";
import styles from "./SearchPage.module.css";

function SearchPage() {
  return (
    <div className={styles.page}>
      <SearchPanel />
    </div>
  );
}

export default SearchPage;
