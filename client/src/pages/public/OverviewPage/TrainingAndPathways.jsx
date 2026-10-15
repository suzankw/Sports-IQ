import { Button } from '../../../components/Button/Button.jsx';
import { Icon } from '../../../components/Icon/Icon.jsx';
import styles from './OverviewPage.module.css';

const PATHWAY_ICONS = ['school', 'trending_up', 'military_tech'];

export function TrainingAndPathways({ videos = [], pathways = [] }) {
  return (
    <>
      {videos.length > 0 && (
        <section aria-labelledby="training" className={styles.block}>
          <h2 id="training" className={styles.barTitle}>
            Training Tips
          </h2>
          <ul className={styles.videos}>
            {videos.map((v) => (
              <li key={v.url}>
                <a href={v.url} target="_blank" rel="noreferrer" className={styles.video}>
                  {v.thumbnailUrl ? <img src={v.thumbnailUrl} alt="" /> : <span className={styles.videoPlaceholder} />}
                  <Icon name="play_circle" size="xl" className={styles.play} />
                  <span className={styles.videoTitle}>{v.title}</span>
                  <span className={styles.videoMeta}>{[v.duration, v.category].filter(Boolean).join(' · ')}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
      {pathways.length > 0 && (
        <section aria-labelledby="pathways" className={styles.block}>
          <h2 id="pathways" className={styles.barTitle}>
            Learning Pathways
          </h2>
          <ul className={styles.pathways}>
            {pathways.map((p, i) => (
              <li key={p.title} className={styles.pathway}>
                <Icon name={PATHWAY_ICONS[i % PATHWAY_ICONS.length]} className={styles.pathwayIcon} />
                <h3 className={styles.pathwayTitle}>{p.title}</h3>
                <p>{p.text}</p>
                {p.url && (
                  <Button variant={i === 1 ? 'navy' : 'outline'} size="sm" href={p.url} target="_blank" rel="noreferrer">
                    View playlist
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
