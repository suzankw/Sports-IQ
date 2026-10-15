import { Badge } from '../../../components/Badge/Badge.jsx';
import { BenchAndStaff } from '../../../components/BenchAndStaff/BenchAndStaff.jsx';
import { Card, CardHeader } from '../../../components/Card/Card.jsx';
import { DepthChart } from '../../../components/DepthChart/DepthChart.jsx';
import { Pitch } from '../../../components/Pitch/Pitch.jsx';
import styles from './MatchPage.module.css';

const LINEUP_TITLES = { 11: 'Starting XI', 5: 'Starting Five', 7: 'Starting Seven' };

export function LineupsTab({ match }) {
  const formation = match.sport.formations.find((f) => f.key === match.formation);
  const slotOf = new Map((formation?.slots ?? []).map((s) => [s.key, s]));
  const starters = match.lineup
    .filter((l) => slotOf.has(l.slot))
    .map(({ player, number, slot }) => ({
      id: player.id,
      number,
      name: player.lastName,
      captain: player.id === match.captain?.id,
      x: slotOf.get(slot).x,
      y: slotOf.get(slot).y,
    }));
  const cameOn = new Map(match.events.filter((e) => e.type === 'sub').map((e) => [e.player?.id, e.minute]));
  const substitutes = match.lineup.filter((l) => !l.slot).map((l) => ({ ...l, onMinute: cameOn.get(l.player.id) }));
  const title = LINEUP_TITLES[formation?.slots.length] ?? 'Starting lineup';

  return (
    <div className={styles.lineups}>
      <Card>
        <CardHeader
          title={match.sport.formations.length > 1 ? `${title} & Formation` : title}
          actions={match.sport.formations.length > 1 && formation && <Badge tone="blue">{formation.name}</Badge>}
        />
        <div className={styles.pitch}>
          <Pitch players={starters} surface={match.sport.slug === 'football' ? 'pitch' : 'court'} label={title} />
        </div>
      </Card>
      <div className={styles.stack}>
        <BenchAndStaff substitutes={substitutes} staff={match.staff} />
        {match.depthChart.length > 0 && <DepthChart rows={match.depthChart} />}
      </div>
    </div>
  );
}
