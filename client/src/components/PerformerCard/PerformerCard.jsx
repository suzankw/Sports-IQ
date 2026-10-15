import { Avatar } from '../Avatar/Avatar.jsx';
import styles from './PerformerCard.module.css';

/** A top performer: photo, name, position and two headline stats. stats: [{ label, value }] */
export function PerformerCard({ player, position, stats }) {
  return (
    <article className={styles.card}>
      <Avatar src={player.photoUrl} name={`${player.firstName} ${player.lastName}`} size="xl" shape="square" className={styles.photo} />
      <h3 className={styles.name}>{player.shortName}</h3>
      <p className={styles.position}>{position}</p>
      <dl className={styles.stats}>
        {stats.map((s) => (
          <div key={s.label}>
            <dd className={styles.value}>{s.value}</dd>
            <dt className={styles.label}>{s.label}</dt>
          </div>
        ))}
      </dl>
    </article>
  );
}
