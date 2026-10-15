import { useHomeSchool } from '../../hooks/schools.js';
import { sidesOf } from '../../lib/match.js';
import { Avatar } from '../Avatar/Avatar.jsx';
import styles from './Matchup.module.css';

/** Home then away, each with H/A, crest, name and (once played) their score. */
export function Matchup({ match }) {
  const school = useHomeSchool();
  return (
    <div className={styles.matchup}>
      {sidesOf(match, school.data).map((side) => {
        const score = match.score?.[side.key];
        const won = match.status === 'completed' && score > match.score[side.key === 'turi' ? 'opponent' : 'turi'];
        return (
          <div key={side.key} className={styles.side}>
            <span className={styles.flag} title={side.label}>
              {side.label[0]}
            </span>
            <Avatar src={side.crestUrl} name={side.name} size="sm" shape="square" tone="neutral" />
            <span className={side.key === 'turi' ? styles.turi : styles.name}>{side.name}</span>
            {score != null && <span className={won ? styles.winner : styles.score}>{score}</span>}
          </div>
        );
      })}
    </div>
  );
}
