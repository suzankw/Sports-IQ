import styles from './SaveBar.module.css';

/** Sticky bottom bar for long forms (sport editor, roster, result entry): the save error, then the actions. */
export function SaveBar({ error, children }) {
  return (
    <div className={styles.bar}>
      {error && (
        <div role="alert" className={styles.error}>
          {error}
        </div>
      )}
      {children}
    </div>
  );
}
