import { NumberInput } from '../../../components/TextInput/TextInput.jsx';
import { periodName } from '../../../lib/resultForm.js';
import styles from './ResultPage.module.css';

/** 3 · Basketball / netball: points per quarter for each side (optional; they must add up when given). */
export function PeriodsSection({ form, count, turiName, opponentName }) {
  const name = periodName(count);
  return (
    <table className={styles.periods}>
      <thead>
        <tr>
          <th scope="col">{name}</th>
          <th scope="col">{turiName}</th>
          <th scope="col">{opponentName}</th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: count }, (_, i) => (
          <tr key={i}>
            <th scope="row">{`${name[0]}${i + 1}`}</th>
            {['turi', 'opponent'].map((side) => (
              <td key={side}>
                <NumberInput label={`${side === 'turi' ? turiName : opponentName}, ${name.toLowerCase()} ${i + 1}`} hideLabel {...form.register(`periodScores.${i}.${side}`)} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
