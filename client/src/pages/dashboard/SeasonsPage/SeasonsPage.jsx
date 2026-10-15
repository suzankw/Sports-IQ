import { Badge } from '../../../components/Badge/Badge.jsx';
import { Checkbox } from '../../../components/Checkbox/Checkbox.jsx';
import { ResourceForm } from '../../../components/ResourceForm/ResourceForm.jsx';
import formStyles from '../../../components/ResourceForm/ResourceForm.module.css';
import { ResourceScreen } from '../../../components/ResourceScreen/ResourceScreen.jsx';
import { TextInput } from '../../../components/TextInput/TextInput.jsx';
import { useList, useResource } from '../../../hooks/resources.js';
import { formatDate, fromEatInput, toEatInput } from '../../../lib/dates.js';
import { slugify } from '../../../lib/slug.js';

const columns = [
  {
    key: 'label',
    header: 'Season',
    isRowHeader: true,
    render: (s) => (
      <>
        {s.label} {s.isCurrent && <Badge tone="gold">Current</Badge>}
      </>
    ),
  },
  { key: 'slug', header: 'In links' },
  { key: 'start', header: 'Starts', render: (s) => formatDate(s.startDate) },
  { key: 'end', header: 'Ends', render: (s) => formatDate(s.endDate) },
];

const dayOf = (iso) => (iso ? toEatInput(iso).slice(0, 10) : '');

function SeasonForm({ item, ...props }) {
  return (
    <ResourceForm
      item={item}
      {...props}
      defaultValues={{ label: item?.label ?? '', startDate: dayOf(item?.startDate), endDate: dayOf(item?.endDate), isCurrent: item?.isCurrent ?? false }}
      toBody={({ label, startDate, endDate, isCurrent }) => ({
        ...(item ? {} : { slug: slugify(label) }),
        label,
        startDate: fromEatInput(`${startDate}T00:00`),
        endDate: fromEatInput(`${endDate}T23:59`),
        ...(isCurrent && !item?.isCurrent ? { isCurrent: true } : {}),
      })}
    >
      {({ register, formState: { errors } }) => (
        <>
          <TextInput
            label="Season"
            placeholder="2027/2028"
            error={errors.label?.message}
            {...register('label', { required: 'Enter the season', pattern: { value: /^\d{4}\/\d{4}$/, message: 'Use the form 2027/2028' } })}
          />
          <div className={formStyles.pair}>
            <TextInput label="Start date" type="date" error={errors.startDate?.message} {...register('startDate', { required: 'Choose the start date' })} />
            <TextInput label="End date" type="date" error={errors.endDate?.message} {...register('endDate', { required: 'Choose the end date' })} />
          </div>
          <Checkbox
            label="Make this the current season"
            hint={item?.isCurrent ? 'This is the current season. Make another season current to change it.' : 'Public pages open on the current season.'}
            disabled={item?.isCurrent}
            {...register('isCurrent')}
          />
        </>
      )}
    </ResourceForm>
  );
}

/** D5 Seasons. */
export function SeasonsPage() {
  return (
    <ResourceScreen
      title="Seasons"
      subtitle="School years that fixtures, squads and tables belong to."
      noun="season"
      nameOf={(s) => s.label}
      query={useList('/seasons')}
      resource={useResource('/seasons')}
      columns={columns}
      Form={SeasonForm}
      canDelete={(s) => !s.isCurrent}
    />
  );
}
