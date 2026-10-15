import { useId } from 'react';
import { Button } from '../Button/Button.jsx';
import styles from './Stepper.module.css';

/** Big − value + control for scores: thumb-sized targets for entering a result at the pitch. */
export function Stepper({ label, value, onChange, min = 0, max = 300 }) {
  const id = useId();
  const current = Number(value) || 0;
  const set = (next) => onChange(Math.max(min, Math.min(max, next)));
  return (
    <div className={styles.stepper}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <Button variant="outline" icon="remove" aria-label={`One less for ${label}`} disabled={current <= min} onClick={() => set(current - 1)} />
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        className={styles.value}
        value={value}
        onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
      />
      <Button variant="outline" icon="add" aria-label={`One more for ${label}`} onClick={() => set(current + 1)} />
    </div>
  );
}
