import { IconSelect } from '../../../components/IconSelect/IconSelect.jsx';
import { ListEditor } from '../../../components/ListEditor/ListEditor.jsx';
import { Select } from '../../../components/Select/Select.jsx';
import { NumberInput, TextInput } from '../../../components/TextInput/TextInput.jsx';
import { bind } from '../../../lib/forms.js';
import { keyOptions, newStat } from '../../../lib/sportForm.js';

const options = (pairs) => pairs.map(([value, label]) => ({ value, label }));
const STAT_TYPES = options([['count', 'Count'], ['percent', 'Percent'], ['minutes', 'Minutes'], ['ratio', 'Ratio of two stats']]);
const SOURCES = options([['manual', 'Typed in'], ['events', 'From match events']]);
const AGGREGATIONS = options([['sum', 'Total'], ['avg', 'Average']]);
const GROUPS = options([['attack', 'Attack'], ['defense', 'Defense'], ['discipline', 'Discipline']]);

const required = { required: 'Required' };
const statKey = { ...required, pattern: { value: /^[a-z][A-Za-z0-9]*$/, message: 'Letters and digits, starting lower-case (shotsOnTarget)' } };
const positionKey = { ...required, pattern: { value: /^[A-Z]{1,4}$/, message: 'Up to 4 capital letters' } };

export function PositionsEditor({ form }) {
  return (
    <ListEditor form={form} name="positions" label="Positions" itemLabel="position" max={20} newItem={{ key: '', name: '', headlineStats: '' }}>
      {(path) => (
        <>
          <TextInput label="Key" placeholder="FW" {...bind(form, `${path}.key`, positionKey)} />
          <TextInput label="Name" placeholder="Forward" {...bind(form, `${path}.name`, required)} />
          <TextInput label="Headline stats" hint="Up to 2 player stat keys, comma separated" {...bind(form, `${path}.headlineStats`)} />
        </>
      )}
    </ListEditor>
  );
}

export function StatsEditor({ form, name, label, hint }) {
  const stats = form.watch(name);
  return (
    <ListEditor form={form} name={name} label={label} hint={hint} itemLabel="stat" max={20} newItem={newStat}>
      {(path, index) => (
        <>
          <TextInput label="Key" placeholder="shotsOnTarget" {...bind(form, `${path}.key`, statKey)} />
          <TextInput label="Label" placeholder="Shots on target" {...bind(form, `${path}.label`, required)} />
          <TextInput label="Short label" placeholder="SOT" {...bind(form, `${path}.abbr`, { ...required, maxLength: { value: 6, message: 'Up to 6 characters' } })} />
          <Select label="Type" options={STAT_TYPES} {...bind(form, `${path}.type`)} />
          <Select label="Comes from" options={SOURCES} {...bind(form, `${path}.source`)} />
          <Select label="Season figure" options={AGGREGATIONS} {...bind(form, `${path}.aggregation`)} />
          {stats[index]?.type === 'ratio' && (
            <>
              <Select label="Numerator" placeholder="Choose a stat" options={keyOptions(stats)} {...bind(form, `${path}.ratio.numerator`, required)} />
              <Select label="Denominator" placeholder="Choose a stat" options={keyOptions(stats)} {...bind(form, `${path}.ratio.denominator`, required)} />
            </>
          )}
        </>
      )}
    </ListEditor>
  );
}

export function LeaderboardsEditor({ form }) {
  const boards = form.watch('leaderboards');
  return (
    <ListEditor form={form} name="leaderboards" label="Leaderboards" itemLabel="leaderboard" max={10} newItem={{ key: '', label: '', icon: 'star', group: 'attack', stats: '' }}>
      {(path, index) => (
        <>
          <TextInput label="Key" placeholder="goals" {...bind(form, `${path}.key`, statKey)} />
          <TextInput label="Label" placeholder="Top scorers" {...bind(form, `${path}.label`, required)} />
          <IconSelect label="Icon" current={boards[index]?.icon} {...bind(form, `${path}.icon`, required)} />
          <Select label="Group" options={GROUPS} {...bind(form, `${path}.group`)} />
          <TextInput label="Ranked by" hint="Player stat keys, comma separated" {...bind(form, `${path}.stats`, required)} />
        </>
      )}
    </ListEditor>
  );
}

export function FormationsEditor({ form }) {
  const number = (path) => bind(form, path, { valueAsNumber: true, min: { value: 0, message: '0–100' }, max: { value: 100, message: '0–100' } });
  return (
    <ListEditor form={form} name="formations" label="Formations" itemLabel="formation" max={10} newItem={{ key: '', name: '', slots: [] }}>
      {(path) => (
        <>
          <TextInput label="Key" placeholder="4-3-3" {...bind(form, `${path}.key`, required)} />
          <TextInput label="Name" placeholder="4-3-3 Attacking" {...bind(form, `${path}.name`, required)} />
          <div className="full">
            <ListEditor form={form} name={`${path}.slots`} label="Slots" itemLabel="slot" max={15} hint="x and y are % across and down the pitch, from the top-left corner." newItem={{ key: '', position: '', x: 50, y: 50 }}>
              {(slot) => (
                <>
                  <TextInput label="Slot" placeholder="LW" {...bind(form, `${slot}.key`, required)} />
                  <TextInput label="Position" placeholder="FW" {...bind(form, `${slot}.position`, positionKey)} />
                  <NumberInput label="x" {...number(`${slot}.x`)} />
                  <NumberInput label="y" {...number(`${slot}.y`)} />
                </>
              )}
            </ListEditor>
          </div>
        </>
      )}
    </ListEditor>
  );
}
