import { useWatch } from 'react-hook-form';
import { NumberInput } from '../../../components/TextInput/TextInput.jsx';
import { eventTotals, typedStats } from '../../../lib/resultForm.js';
import styles from './ResultPage.module.css';

/** 4 · Team stats, Turi beside the opponent. Turi's cards come from the events, so they're shown, not typed. */
export function TeamStatsSection({ form, sport, turiName, opponentName }) {
  const events = useWatch({ control: form.control, name: 'events' });
  const typedForTuri = new Set(typedStats(sport.teamStats).map((d) => d.key));
  const fromEvents = eventTotals(events).team;
  return (
    <div className={styles.statTable}>
      <div className={styles.statHead} aria-hidden="true">
        <span>Stat</span>
        <span>{turiName}</span>
        <span>{opponentName}</span>
      </div>
      {typedStats(sport.teamStats, { allowEvents: true }).map((d) => (
        <div key={d.key} className={styles.statRow}>
          <span className={styles.statLabel}>
            {d.label}
            {d.type === 'percent' && ' (%)'}
          </span>
          {typedForTuri.has(d.key) ? (
            <NumberInput label={`${turiName} ${d.label}`} hideLabel {...form.register(`teamStats.turi.${d.key}`)} />
          ) : (
            <output className={styles.fromEvents} title="Counted from the events">
              {fromEvents[d.key] ?? 0}
            </output>
          )}
          <NumberInput label={`${opponentName} ${d.label}`} hideLabel {...form.register(`teamStats.opponent.${d.key}`)} />
        </div>
      ))}
    </div>
  );
}
