import styles from './DonutChart.module.css';

const RADIUS = 15.9155; // circumference = 100, so dash lengths are percentages
const TONES = ['navy', 'gold', 'blue', 'sky', 'red'];

/** segments: [{ label, value (0–100), detail }] — the legend carries the numbers for screen readers. */
export function DonutChart({ segments, centerValue, centerLabel, label }) {
  const starts = segments.map((_, i) => segments.slice(0, i).reduce((sum, s) => sum + s.value, 0));
  return (
    <figure className={styles.figure} aria-label={label}>
      <svg viewBox="0 0 42 42" className={styles.chart} aria-hidden="true">
        <circle cx="21" cy="21" r={RADIUS} className={styles.track} />
        {segments.map((s, i) => (
          <circle
            key={s.label}
            cx="21"
            cy="21"
            r={RADIUS}
            className={styles[TONES[i % TONES.length]]}
            strokeDasharray={`${s.value} ${100 - s.value}`}
            strokeDashoffset={25 - starts[i]}
          />
        ))}
        <text x="21" y="21" className={styles.value}>{centerValue}</text>
        <text x="21" y="26" className={styles.caption}>{centerLabel}</text>
      </svg>
      <ul className={styles.legend}>
        {segments.map((s, i) => (
          <li key={s.label} className={styles.item}>
            <span className={`${styles.swatch} ${styles[`swatch-${TONES[i % TONES.length]}`]}`} />
            <span>
              <span className={styles.itemLabel}>{s.label}</span>
              <span className={styles.itemDetail}>{s.detail}</span>
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
