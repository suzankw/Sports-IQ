import { useWatch } from 'react-hook-form';
import { NumberInput } from '../../../components/TextInput/TextInput.jsx';
import { appearedPlayers, eventTotals, statsKey, typedStats } from '../../../lib/resultForm.js';
import styles from './ResultPage.module.css';

/** 5 · One card per player who appeared (from the lineup and subs). Event stats are shown, not typed. */
export function PlayerStatsSection({ form, sport, people }) {
  const values = useWatch({ control: form.control });
  const appeared = appearedPlayers(values, sport);
  const typed = typedStats(sport.playerStats);
  const counted = sport.playerStats.filter((d) => d.source === 'events');
  const totals = eventTotals(values.events).player;
  if (appeared.length === 0) return <p className={styles.muted}>Pick the lineup first — starters and subs who came on get a card here.</p>;
  return (
    <div className={styles.playerCards}>
      {appeared.map((id) => {
        const p = people.get(id);
        return (
          <fieldset key={id} className={styles.playerCard}>
            <legend className={styles.playerName}>
              {p?.label ?? 'Unknown player'} <span className={styles.muted}>{values.playerStats?.[statsKey(id)]?.position ?? p?.position}</span>
            </legend>
            <div className={styles.statGrid}>
              {typed.map((d) => (
                <NumberInput key={d.key} label={d.abbr} title={d.label} aria-label={`${d.label}, ${p?.shortName}`} {...form.register(`playerStats.${statsKey(id)}.stats.${d.key}`)} />
              ))}
              {counted.map((d) => (
                <div key={d.key} className={styles.counted} title={`${d.label} — counted from the events`}>
                  <span>{d.abbr}</span>
                  <output>{totals[id]?.[d.key] ?? 0}</output>
                </div>
              ))}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}
