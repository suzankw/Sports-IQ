import styles from './Quote.module.css';

/** The "signature" block: a quote with a gold left border (match report, season review). */
export function Quote({ text, attribution }) {
  return (
    <figure className={styles.quote}>
      <blockquote className={styles.text}>“{text}”</blockquote>
      <figcaption className={styles.by}>{attribution}</figcaption>
    </figure>
  );
}
