import { Avatar } from '../Avatar/Avatar.jsx';
import { Badge } from '../Badge/Badge.jsx';
import { Icon } from '../Icon/Icon.jsx';
import styles from './Scoreboard.module.css';

function Side({ side }) {
  return (
    <div className={styles.side}>
      <Avatar src={side.crestUrl} name={side.name} size="lg" shape="square" tone="neutral" />
      <p className={styles.team}>{side.name}</p>
      <Badge tone={side.label === 'Home' ? 'navy' : 'gold'}>{side.label}</Badge>
    </div>
  );
}

const Scorers = ({ side, lines }) => (
  <ul className={styles.scorers} aria-label={`${side.name} scorers`}>
    {lines.map((line) => (
      <li key={line}>{line}</li>
    ))}
  </ul>
);

/**
 * The match header card: both sides (home on the left), the score or kick-off time, status and date.
 * `children` sits at the bottom of the card (the tab bar).
 */
export function Scoreboard({ sides, score, status, live, when, scorers, children }) {
  const [home, away] = sides;
  return (
    <section className={styles.card} aria-label="Score">
      <div className={styles.grid}>
        <Side side={home} />
        <div className={styles.centre}>
          <p className={live ? styles.live : styles.status}>{status}</p>
          {score ? (
            <p className={styles.score} aria-label={`${home.name} ${score[home.key]}, ${away.name} ${score[away.key]}`}>
              <span>{score[home.key]}</span>
              <span className={styles.dash} aria-hidden="true">–</span>
              <span>{score[away.key]}</span>
            </p>
          ) : (
            <p className={styles.versus}>vs</p>
          )}
          <p className={styles.when}>
            <Icon name="calendar_month" size="sm" />
            {when}
          </p>
        </div>
        <Side side={away} />
      </div>
      {scorers[home.key].length + scorers[away.key].length > 0 && (
        <div className={styles.scorerRow}>
          <Scorers side={home} lines={scorers[home.key]} />
          <Scorers side={away} lines={scorers[away.key]} />
        </div>
      )}
      {children && <div className={styles.footer}>{children}</div>}
    </section>
  );
}
