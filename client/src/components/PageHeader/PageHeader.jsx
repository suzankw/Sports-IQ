import styles from './PageHeader.module.css';

/** Page title block: optional eyebrow, the h1, a subtitle and actions on the right. */
export function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <header className={styles.header}>
      <div className={styles.text}>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {actions && (
        <div className={styles.actions} data-print="hide">
          {actions}
        </div>
      )}
    </header>
  );
}
