import styles from './OverviewPage.module.css';

export function OverviewHero({ hero, fallbackTitle }) {
  return (
    <section className={styles.hero}>
      {hero?.imageUrl && <img src={hero.imageUrl} alt="" className={styles.heroImage} />}
      <div className={styles.heroText}>
        {hero?.eyebrow && <p className={styles.eyebrow}>{hero.eyebrow}</p>}
        <h1 className={styles.heroTitle}>{hero?.title ?? fallbackTitle}</h1>
        {hero?.text && <p className={styles.heroBody}>{hero.text}</p>}
      </div>
    </section>
  );
}
