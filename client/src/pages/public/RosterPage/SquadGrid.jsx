import { useState } from 'react';
import { Badge } from '../../../components/Badge/Badge.jsx';
import { Button } from '../../../components/Button/Button.jsx';
import { Card, CardHeader } from '../../../components/Card/Card.jsx';
import { PhotoCard } from '../../../components/PhotoCard/PhotoCard.jsx';
import { fullName } from '../../../lib/people.js';
import styles from './RosterPage.module.css';

const FIRST_VIEW = 12;

export function SquadGrid({ teamSeason, positions }) {
  const [showAll, setShowAll] = useState(false);
  const members = [...teamSeason.members].sort((a, b) => a.number - b.number);
  const visible = showAll ? members : members.slice(0, FIRST_VIEW);
  return (
    <Card>
      <CardHeader title="Active Roster" actions={<Badge tone="neutral">{members.length} Players</Badge>} />
      <ul className={styles.squad}>
        {visible.map((m) => {
          const isCaptain = m.player.id === teamSeason.captain?.id;
          return (
            <li key={m.player.id}>
              <PhotoCard
                photoUrl={m.player.photoUrl}
                name={fullName(m.player)}
                eyebrow={isCaptain ? 'Team Captain' : null}
                detail={`${positions[m.position] ?? m.position} • #${m.number}`}
                badge={isCaptain ? 'C' : null}
                highlight={isCaptain}
              />
            </li>
          );
        })}
      </ul>
      {members.length > FIRST_VIEW && (
        <div className={styles.more}>
          <Button variant="navy" size="sm" iconEnd={showAll ? 'expand_less' : 'expand_more'} onClick={() => setShowAll(!showAll)} aria-expanded={showAll}>
            {showAll ? 'Show fewer' : 'View full squad'}
          </Button>
        </div>
      )}
    </Card>
  );
}
