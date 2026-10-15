import { Icon } from '../../../components/Icon/Icon.jsx';
import styles from './OverviewPage.module.css';

export function HistoryAndFacts({ history, facts = [] }) {
  return (
    <section aria-labelledby="history" className={styles.history}>
      <h2 id="history" className={styles.sectionTitle}>
        Global Origins &amp; History
      </h2>
      {history?.imageUrl && <img src={history.imageUrl} alt="" className={styles.historyImage} />}
      {history?.text && <p className={styles.historyText}>{history.text}</p>}
      <dl className={styles.facts}>
        {facts.map((fact) => (
          <div key={fact.label} className={styles.fact}>
            <Icon name={fact.icon} className={styles.factIcon} />
            <dt className={styles.factLabel}>{fact.label}</dt>
            <dd className={styles.factText}>{fact.text}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
