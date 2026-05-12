import { useEffect } from "react";
import type { ReactNode } from "react";
import styles from "./OverlayPanel.module.css";

/**
 * Это тип пропсов компонента.
children: ReactNode означает: внутрь OverlayPanel можно передать любой JSX.
Например потом будет так:
<OverlayPanel onClose={closePanel}>
  <SearchPanel />
</OverlayPanel>

onClose: () => void означает: компонент ждёт функцию, которую надо вызвать, когда панель закрывается
 */
type OverlayPanelProps = {
  children: ReactNode;
  onClose: () => void;
};

// KeyboardEvent — это встроенный тип браузера из TypeScript - это событие клавиатуры.
// То есть если нажали клавишу Escape, закрываем панель
function OverlayPanel({ children, onClose }: OverlayPanelProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className={styles.overlay}>

        {/* элемент для клика по затемнённой области */}
      <button
        className={styles.backdrop}
        type="button"
        aria-label="Close panel"
        onClick={onClose}
      />

     {/* сама белая боковая панель */}
      <aside className={styles.panel}>
        <button
          className={styles.closeButton}
          type="button"
          aria-label="Close panel"
          onClick={onClose}
        />

        {children}
      </aside>
    </div>
  );
}

export default OverlayPanel;
