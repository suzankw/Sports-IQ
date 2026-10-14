import { cx } from '../../lib/cx.js';
import styles from './Pitch.module.css';

/**
 * Starting players placed by their formation slot: x = % from the left, y = % from Turi's own end.
 * players: [{ id, number, name, captain, x, y }] · surface: 'pitch' (football) or 'court'.
 */
export function Pitch({ players, surface = 'pitch', label }) {
  return (
    <div className={cx(styles.field, styles[surface])}>
      <div className={styles.markings} aria-hidden="true">
        <span className={styles.halfway} />
        <span className={styles.circle} />
        <span className={styles.boxTop} />
        <span className={styles.boxBottom} />
      </div>
      <ul className={styles.players} aria-label={label}>
        {players.map((p) => (
          <li key={p.id} className={styles.player} style={{ '--x': `${p.x}%`, '--y': `${p.y}%` }}>
            <span className={styles.number}>{p.number ?? '–'}</span>
            <span className={styles.name}>
              {p.name}
              {p.captain && ' (C)'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
