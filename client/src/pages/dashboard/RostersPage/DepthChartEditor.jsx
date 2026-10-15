import { useWatch } from 'react-hook-form';
import { Card, CardHeader } from '../../../components/Card/Card.jsx';
import { ListEditor } from '../../../components/ListEditor/ListEditor.jsx';
import { Select } from '../../../components/Select/Select.jsx';
import { bind } from '../../../lib/forms.js';
import { fullName } from '../../../lib/people.js';
import styles from './RostersPage.module.css';

/** Per position, the squad's players in order (first = starter). Shown on match pages. */
export function DepthChartEditor({ form, sport }) {
  const members = useWatch({ control: form.control, name: 'members' });
  const options = members.map((m) => ({ value: m.player, label: `${Number.isFinite(m.number) ? m.number : '–'} · ${fullName(m.info)}` }));
  return (
    <Card>
      <CardHeader title="Depth chart" icon="format_list_numbered" />
      <div className={styles.depth}>
        {sport.positions.map((position, i) => (
          <ListEditor key={position.key} form={form} name={`depthChart.${i}.players`} label={`${position.name} (${position.key})`} itemLabel="player" max={6} newItem={{ player: '' }}>
            {(path) => <Select label="Player" hideLabel placeholder="Choose a player" options={options} {...bind(form, `${path}.player`, { required: 'Choose a player' })} />}
          </ListEditor>
        ))}
      </div>
    </Card>
  );
}
