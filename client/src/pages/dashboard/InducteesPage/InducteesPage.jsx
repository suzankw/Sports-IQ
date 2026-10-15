import { Controller } from 'react-hook-form';
import { Avatar } from '../../../components/Avatar/Avatar.jsx';
import { PhotoField } from '../../../components/PhotoField/PhotoField.jsx';
import { ResourceForm } from '../../../components/ResourceForm/ResourceForm.jsx';
import formStyles from '../../../components/ResourceForm/ResourceForm.module.css';
import { ResourceScreen } from '../../../components/ResourceScreen/ResourceScreen.jsx';
import { Select } from '../../../components/Select/Select.jsx';
import { NumberInput, TextInput } from '../../../components/TextInput/TextInput.jsx';
import { useList, useResource } from '../../../hooks/resources.js';
import { useSports } from '../../../hooks/sports.js';
import { bind } from '../../../lib/forms.js';
import { optionsOf } from '../../../lib/options.js';
import styles from './InducteesPage.module.css';

const columns = [
  {
    key: 'name',
    header: 'Inductee',
    isRowHeader: true,
    render: (i) => (
      <span className={styles.person}>
        <Avatar src={i.photoUrl} name={i.name} size="sm" />
        {i.name}
      </span>
    ),
  },
  { key: 'sport', header: 'Sport', render: (i) => i.sport?.name ?? 'All sports' },
  { key: 'years', header: 'Years', render: (i) => i.years ?? '—' },
  { key: 'achievement', header: 'Achievement' },
  { key: 'order', header: 'Order', align: 'end' },
];

function InducteeForm({ item, ...props }) {
  const sports = useSports();
  return (
    <ResourceForm
      item={item}
      {...props}
      defaultValues={{ name: item?.name ?? '', photoUrl: item?.photoUrl ?? null, sport: item?.sport?.id ?? '', years: item?.years ?? '', achievement: item?.achievement ?? '', citation: item?.citation ?? '', order: item?.order ?? 0 }}
      toBody={({ sport, years, citation, ...values }) => ({ ...values, sport: sport || null, years: years || null, citation: citation || null })}
    >
      {(form) => (
        <>
          <Controller name="photoUrl" control={form.control} render={({ field }) => <PhotoField name={form.watch('name') || '?'} value={field.value} onChange={field.onChange} />} />
          <TextInput label="Name" {...bind(form, 'name', { required: 'Enter the name' })} />
          <div className={formStyles.pair}>
            <Select label="Sport" options={[{ value: '', label: 'All sports' }, ...optionsOf(sports.data)]} {...bind(form, 'sport')} />
            <TextInput label="Years" placeholder="2015–2019" {...bind(form, 'years')} />
          </div>
          <TextInput label="Achievement" placeholder="Captained the 2019 national champions" {...bind(form, 'achievement', { required: 'Say what they achieved' })} />
          <TextInput label="Citation" multiline rows={4} hint="Optional — a few sentences for the card" {...bind(form, 'citation')} />
          <NumberInput label="Order" hint="Lower numbers come first" {...bind(form, 'order', { valueAsNumber: true })} />
        </>
      )}
    </ResourceForm>
  );
}

/** D16 Hall of Fame. */
export function InducteesPage() {
  return (
    <ResourceScreen
      title="Hall of Fame"
      subtitle="Inductees on the public Hall of Fame page, in this order."
      noun="inductee"
      nameOf={(i) => i.name}
      query={useList('/inductees')}
      resource={useResource('/inductees')}
      columns={columns}
      Form={InducteeForm}
    />
  );
}
