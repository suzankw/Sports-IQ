import { Badge } from '../../../components/Badge/Badge.jsx';
import { Icon } from '../../../components/Icon/Icon.jsx';
import { IconSelect } from '../../../components/IconSelect/IconSelect.jsx';
import { ResourceForm } from '../../../components/ResourceForm/ResourceForm.jsx';
import { ResourceScreen } from '../../../components/ResourceScreen/ResourceScreen.jsx';
import { NumberInput, TextInput } from '../../../components/TextInput/TextInput.jsx';
import { useList, useResource } from '../../../hooks/resources.js';
import { bind } from '../../../lib/forms.js';
import { slugify } from '../../../lib/slug.js';
import styles from './SportsPage.module.css';

const columns = [
  {
    key: 'name',
    header: 'Sport',
    isRowHeader: true,
    render: (s) => (
      <span className={styles.sport}>
        <Icon name={s.icon} />
        {s.name}
      </span>
    ),
  },
  { key: 'status', header: 'Status', render: (s) => (s.status === 'active' ? <Badge tone="positive">Active</Badge> : <Badge>Coming soon</Badge>) },
  { key: 'order', header: 'Order', align: 'end' },
];

/** New sports start as "coming soon"; everything else is set in the editor. */
function NewSportForm(props) {
  return (
    <ResourceForm {...props} defaultValues={{ name: '', icon: '', order: 10 }} toBody={(values) => ({ slug: slugify(values.name), ...values })}>
      {(form) => (
        <>
          <TextInput label="Name" placeholder="Volleyball" {...bind(form, 'name', { required: 'Enter the name' })} />
          <IconSelect label="Icon" current={form.watch('icon')} {...bind(form, 'icon', { required: 'Choose an icon' })} />
          <NumberInput label="Order" hint="Position in the sport menu" {...bind(form, 'order', { valueAsNumber: true })} />
        </>
      )}
    </ResourceForm>
  );
}

/** D3 Sports: the list; each sport has its own editor (definition + page content). */
export function SportsPage() {
  return (
    <ResourceScreen
      title="Sports"
      subtitle="What each sport records — positions, stats, formations — and what its public page says."
      noun="sport"
      nameOf={(s) => s.name}
      query={useList('/sports')}
      resource={useResource('/sports')}
      columns={columns}
      Form={NewSportForm}
      editTo={(s) => `/dashboard/sports/${s.slug}`}
      canDelete={() => false}
    />
  );
}
