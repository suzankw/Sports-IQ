import styles from './Footer.module.css';

export function Footer({ schoolName }) {
  return (
    <footer className={styles.footer} data-print="hide">
      <p className={styles.brand}>{schoolName} Sports</p>
      <p className={styles.copy}>
        © {new Date().getFullYear()} St. Andrew&apos;s School, Turi. Excellence in the Highlands.
      </p>
    </footer>
  );
}
