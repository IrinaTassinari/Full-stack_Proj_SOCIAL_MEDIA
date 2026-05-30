import { useEffect } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import styles from "./OverlayPanel.module.css";

type OverlayPanelProps = {
  children: ReactNode;
  onClose: () => void;
};

function OverlayPanel({ children, onClose }: OverlayPanelProps) {
  useEffect(() => {
    const scrollY = window.scrollY;
    const originalPosition = document.body.style.position;
    const originalTop = document.body.style.top;
    const originalWidth = document.body.style.width;
    const originalOverflow = document.body.style.overflow;

    // Lock background scrolling while the overlay panel is open.
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.position = originalPosition;
      document.body.style.top = originalTop;
      document.body.style.width = originalWidth;
      document.body.style.overflow = originalOverflow;
      window.scrollTo(0, scrollY);
    };
  }, []);

  useEffect(() => {
    // Allow Escape to close the overlay from anywhere in the panel.
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

  return createPortal(
    <div className={styles.overlay}>
      <button
        className={styles.backdrop}
        type="button"
        aria-label="Close panel"
        onClick={onClose}
      />

      <aside className={styles.panel}>
        <button
          className={styles.closeButton}
          type="button"
          aria-label="Close panel"
          onClick={onClose}
        />

        {children}
      </aside>
    </div>,
    document.body,
  );
}

export default OverlayPanel;
