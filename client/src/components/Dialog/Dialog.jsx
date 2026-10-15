import { useEffect, useId, useRef } from 'react';
import { Icon } from '../Icon/Icon.jsx';
import styles from './Dialog.module.css';

/**
 * Modal built on the native <dialog> (focus trap, Esc, inert background for free).
 * Children only render while open, so forms inside start fresh each time.
 */
export function Dialog({ open, onClose, title, children, wide }) {
  const ref = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className={wide ? `${styles.dialog} ${styles.wide}` : styles.dialog}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      {open && (
        <>
          <header className={styles.header}>
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
              <Icon name="close" />
            </button>
          </header>
          <div className={styles.body}>{children}</div>
        </>
      )}
    </dialog>
  );
}
