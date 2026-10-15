import { ResourceForm } from '../../../components/ResourceForm/ResourceForm.jsx';
import formStyles from '../../../components/ResourceForm/ResourceForm.module.css';
import { ResourceScreen } from '../../../components/ResourceScreen/ResourceScreen.jsx';
import { NumberInput, TextInput } from '../../../components/TextInput/TextInput.jsx';
import { Select } from '../../../components/Select/Select.jsx';
import { SportFilter } from '../../../components/SportFilter/SportFilter.jsx';
import { useList, useResource } from '../../../hooks/resources.js';
import { useSports } from '../../../hooks/sports.js';
import { useUrlState } from '../../../hooks/useUrlState.js';
import { optionsOf } from '../../../lib/options.js';
import { slugify } from '../../../lib/slug.js';
import { TeamsInSeason } from './TeamsInSeason.jsx';

const GENDERS = [
  { value: 'boys', label: 'Boys' },
  { value: 'girls', label: 'Girls' },
  { value: 'mixed', label: 'Mixed' },
];
const genderLabel = (value) => GENDERS.find((g) => g.value === value).label;

const columns = [
  { key: 'name', header: 'Team', isRowHeader: true },
  { key: 'sport', header: 'Sport', render: (t) => t.sport.name },
  { key: 'ageGroup', header: 'Age group' },
  { key: 'gender', header: 'Gender', render: (t) => genderLabel(t.gender) },
  { key: 'order', header: 'Order', align: 'end' },
];

function TeamForm({ item, sportId, ...props }) {
  const sports = useSports();
  return (
    <ResourceForm
      item={item}
      {...props}
      defaultValues={{ sport: sportId ?? '', name: item?.name ?? '', ageGroup: item?.ageGroup ?? 'Open', gender: item?.gender ?? 'boys', order: item?.order ?? 0 }}
      toBody={({ sport, ...values }) => (item ? values : { sport, slug: slugify(values.name), ...values })}
    >
      {({ register, formState: { errors } }) => (
        <>
          {!item && <Select label="Sport" placeholder="Choose a sport" options={optionsOf(sports.data)} error={errors.sport?.message} {...register('sport', { required: 'Choose a sport' })} />}
          <TextInput label="Name" placeholder="First XI" error={errors.name?.message} {...register('name', { required: 'Enter the team name' })} />
          <div className={formStyles.pair}>
            <TextInput label="Age group" placeholder="U16 or Open" error={errors.ageGroup?.message} {...register('ageGroup', { required: 'Enter the age group' })} />
            <Select label="Gender" options={GENDERS} {...register('gender')} />
          </div>
          <NumberInput label="Order" hint="Lower numbers come first in team tabs" error={errors.order?.message} {...register('order', { valueAsNumber: true })} />
        </>
      )}
    </ResourceForm>
  );
}

/** D6 Teams, and which of them play in each season. */
export function TeamsPage() {
  const [url, setUrl] = useUrlState({ sport: '' });
  const sports = useSports();
  const teams = useList('/teams', { sport: url.sport });
  return (
    <ResourceScreen
      title="Teams"
      subtitle="Each sport's teams. Enter them in a season to give them a squad and fixtures."
      noun="team"
      nameOf={(t) => t.name}
      filters={<SportFilter value={url.sport} onChange={(sport) => setUrl({ sport })} />}
      query={teams}
      resource={useResource('/teams')}
      columns={columns}
      Form={TeamForm}
      formProps={{ sportId: sports.data?.find((s) => s.slug === url.sport)?.id }}
    >
      <TeamsInSeason sport={url.sport} teams={teams.data ?? []} />
    </ResourceScreen>
  );
}
