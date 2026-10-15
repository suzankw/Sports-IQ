import { useWatch } from 'react-hook-form';
import { Select } from '../../../components/Select/Select.jsx';
import { slotKey } from '../../../lib/resultForm.js';
import styles from './ResultPage.module.css';

/** 2 · Formation, one player per slot, and bench chips (tap to toggle who was in the matchday squad). */
export function LineupSection({ form, sport, people }) {
  const [formationKey, starters = {}, bench = []] = useWatch({ control: form.control, name: ['formation', 'starters', 'bench'] });
  const formation = sport.formations.find((f) => f.key === formationKey);
  const starting = new Set((formation?.slots ?? []).map((slot) => starters[slotKey(slot.key)]).filter(Boolean));
  const players = [...people.values()].filter((p) => p.inSquad);
  const options = players.map((p) => ({ value: p.id, label: p.label }));
  const positionName = new Map(sport.positions.map((p) => [p.key, p.name]));
  const toggle = (id) => form.setValue('bench', bench.includes(id) ? bench.filter((b) => b !== id) : [...bench, id], { shouldDirty: true });

  return (
    <>
      {sport.formations.length > 1 && (
        <Select label="Formation" options={sport.formations.map((f) => ({ value: f.key, label: f.name }))} {...form.register('formation')} />
      )}
      <div className={styles.slots}>
        {formation?.slots.map((slot) => (
          <Select key={slot.key} label={`${slot.key} · ${positionName.get(slot.position) ?? slot.position}`} placeholder="—" options={options} {...form.register(`starters.${slotKey(slot.key)}`)} />
        ))}
      </div>
      <fieldset className={styles.bench}>
        <legend className={styles.legend}>Bench — tap the substitutes</legend>
        <div className={styles.chips}>
          {players
            .filter((p) => !starting.has(p.id))
            .map((p) => (
              <button key={p.id} type="button" className={styles.chip} aria-pressed={bench.includes(p.id)} onClick={() => toggle(p.id)}>
                {p.label}
              </button>
            ))}
        </div>
      </fieldset>
    </>
  );
}
