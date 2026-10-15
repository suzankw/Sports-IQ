import { Icon } from '../../../components/Icon/Icon.jsx';
import styles from './OverviewPage.module.css';

export function ApproachAndBenefits({ approach, benefits = [] }) {
  if (!approach && benefits.length === 0) return null;
  return (
    <section aria-labelledby="approach" className={styles.approach}>
      <h2 id="approach" className={styles.approachTitle}>
        <Icon name="psychology" /> The Turi Approach
      </h2>
      {approach && (
        <div className={styles.approachColumns}>
          <div>
            <h3 className={styles.smallCaps}>Strategic foundation</h3>
            <p>{approach.strategic}</p>
          </div>
          <div>
            <h3 className={styles.smallCaps}>Character development</h3>
            <p>{approach.character}</p>
          </div>
        </div>
      )}
      {benefits.length > 0 && (
        <>
          <h3 className={styles.smallCaps}>Core benefits</h3>
          <ul className={styles.benefits}>
            {benefits.map((b) => (
              <li key={b.title} className={styles.benefit}>
                <Icon name={b.icon} className={styles.benefitIcon} />
                <p>
                  <strong>{b.title}:</strong> {b.text}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
