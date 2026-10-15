import { useFieldArray, useWatch } from 'react-hook-form';
import { Button } from '../../../components/Button/Button.jsx';
import { Checkbox } from '../../../components/Checkbox/Checkbox.jsx';
import { Select } from '../../../components/Select/Select.jsx';
import { NumberInput, TextInput } from '../../../components/TextInput/TextInput.jsx';
import { newEvent } from '../../../lib/resultForm.js';
import styles from './ResultPage.module.css';

const TYPES = [
  { value: 'goal', label: 'Goal' },
  { value: 'yellow', label: 'Yellow card' },
  { value: 'red', label: 'Red card' },
  { value: 'sub', label: 'Substitution' },
];

function EventRow({ form, index, event, sides, options, onRemove }) {
  const path = `events.${index}`;
  const turi = event.side === 'turi' || event.type === 'sub';
  const field = (name) => form.register(`${path}.${name}`);
  return (
    <li className={styles.event}>
      <Select label="Event" options={TYPES} {...field('type')} />
      {event.type !== 'sub' && <Select label="For" options={sides} {...field('side')} />}
      <NumberInput label="Minute" max={130} className={styles.minute} {...field('minute')} />
      {turi && !(event.type === 'goal' && event.ownGoal) ? (
        <Select label={event.type === 'sub' ? 'Came on' : event.type === 'goal' ? 'Scorer' : 'Player'} placeholder="Choose" options={options} {...field('player')} />
      ) : (
        <TextInput label="Their player" placeholder="Name (optional)" {...field('playerName')} />
      )}
      {event.type === 'goal' && turi && !event.ownGoal && <Select label="Assist" placeholder="None" options={options} {...field('assist')} />}
      {event.type === 'sub' && <Select label="Went off" placeholder="Choose" options={options} {...field('playerOff')} />}
      {event.type === 'goal' && <Checkbox label="Own goal" {...field('ownGoal')} />}
      <Button variant="ghost" size="sm" icon="delete" aria-label={`Remove event ${index + 1}`} className={styles.removeEvent} onClick={onRemove} />
    </li>
  );
}

/** 3 · Football: goals, cards and substitutions — they give the scorers, assists and cards. */
export function EventsSection({ form, people, turiName, opponentName }) {
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'events' });
  const events = useWatch({ control: form.control, name: 'events' });
  const options = [...people.values()].filter((p) => p.inSquad).map((p) => ({ value: p.id, label: p.label }));
  const sides = [
    { value: 'turi', label: turiName },
    { value: 'opponent', label: opponentName },
  ];
  return (
    <>
      {fields.length === 0 && <p className={styles.muted}>No events yet.</p>}
      <ol className={styles.events}>
        {fields.map((f, i) => (
          <EventRow key={f.id} form={form} index={i} event={events[i] ?? f} sides={sides} options={options} onRemove={() => remove(i)} />
        ))}
      </ol>
      <div className={styles.addEvents}>
        <Button variant="outline" icon="sports_soccer" onClick={() => append(newEvent('goal'))}>
          Goal
        </Button>
        <Button variant="outline" icon="style" onClick={() => append(newEvent('yellow'))}>
          Card
        </Button>
        <Button variant="outline" icon="swap_horiz" onClick={() => append(newEvent('sub'))}>
          Sub
        </Button>
      </div>
    </>
  );
}
