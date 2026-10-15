import { Controller } from 'react-hook-form';
import { Stepper } from '../../../components/Stepper/Stepper.jsx';
import styles from './ResultPage.module.css';

const STATUSES = [
  ['upcoming', 'Upcoming'],
  ['live', 'Live'],
  ['completed', 'Full time'],
];

/** 1 · Score steppers and the match status (a segmented radio group). */
export function ScoreSection({ form, match, turiName }) {
  return (
    <>
      {[
        ['score.turi', turiName],
        ['score.opponent', match.opponent.shortName],
      ].map(([name, label]) => (
        <Controller key={name} name={name} control={form.control} render={({ field }) => <Stepper label={label} value={field.value} onChange={field.onChange} />} />
      ))}
      <fieldset className={styles.segmented}>
        <legend className={styles.legend}>Status</legend>
        {STATUSES.map(([value, label]) => (
          <label key={value} className={styles.segment}>
            <input type="radio" value={value} className="visually-hidden" {...form.register('status')} />
            <span>{label}</span>
          </label>
        ))}
      </fieldset>
    </>
  );
}
