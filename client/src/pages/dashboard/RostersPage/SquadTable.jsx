import { Avatar } from '../../../components/Avatar/Avatar.jsx';
import { Button } from '../../../components/Button/Button.jsx';
import { Select } from '../../../components/Select/Select.jsx';
import { NumberInput } from '../../../components/TextInput/TextInput.jsx';
import { bind } from '../../../lib/forms.js';
import { fullName } from '../../../lib/people.js';
import styles from './RostersPage.module.css';

const numberRules = { valueAsNumber: true, required: 'Required', min: { value: 0, message: '0–99' }, max: { value: 99, message: '0–99' } };

/**
 * Squad rows: shirt number, position, captain (one radio group) and remove.
 * A table on wide screens; on phones each player is two lines (name, captain, remove / number, position).
 */
export function SquadTable({ form, fields, remove, positions }) {
  if (fields.length === 0) return <p className={styles.empty}>No players yet — add some below.</p>;
  return (
    <ol className={styles.squad} aria-label="Squad">
      <li className={styles.headings} aria-hidden="true">
        <span>Player</span>
        <span>No.</span>
        <span>Position</span>
        <span>Captain</span>
      </li>
      {fields.map((f, i) => {
        const name = fullName(f.info);
        return (
          <li key={f.id} className={styles.member}>
            <span className={styles.player}>
              <Avatar src={f.info.photoUrl} name={name} size="sm" />
              {name}
            </span>
            <NumberInput label={`Shirt number for ${name}`} hideLabel max={99} className={styles.number} {...bind(form, `members.${i}.number`, numberRules)} />
            <Select label={`Position for ${name}`} hideLabel placeholder="Position" options={positions} className={styles.position} {...bind(form, `members.${i}.position`, { required: 'Choose a position' })} />
            <label className={styles.captain}>
              <input type="radio" value={f.player} className={styles.radio} {...form.register('captain')} />
              <span className={styles.captainText}>Captain</span>
              <span className="visually-hidden">{name}</span>
            </label>
            <Button variant="ghost" size="sm" icon="close" className={styles.remove} title="Remove from squad" aria-label={`Remove ${name} from the squad`} onClick={() => remove(i)} />
          </li>
        );
      })}
    </ol>
  );
}
