import { Controller } from 'react-hook-form';
import { Checkbox } from '../../../components/Checkbox/Checkbox.jsx';
import { ListEditor } from '../../../components/ListEditor/ListEditor.jsx';
import { PhotoField } from '../../../components/PhotoField/PhotoField.jsx';
import { ResourceForm } from '../../../components/ResourceForm/ResourceForm.jsx';
import formStyles from '../../../components/ResourceForm/ResourceForm.module.css';
import { Select } from '../../../components/Select/Select.jsx';
import { TextInput } from '../../../components/TextInput/TextInput.jsx';
import { useList } from '../../../hooks/resources.js';
import { bind } from '../../../lib/forms.js';
import { optionsOf, teamSeasonLabel } from '../../../lib/options.js';
import { STAFF_ROLES } from '../../../lib/people.js';
import { TemporaryPasswordInput } from './TemporaryPasswordInput.jsx';

const ROLES = [
  { value: 'coach', label: 'Coach — their own teams' },
  { value: 'admin', label: 'Admin — everything' },
];
const COACH_ROLES = Object.entries(STAFF_ROLES).map(([value, { label }]) => ({ value, label }));

/** Team-seasons of the current season, plus any older ones the user is still assigned to. */
function useTeamSeasonOptions(item) {
  const current = useList('/team-seasons').data ?? [];
  const assigned = (item?.assignments ?? []).map((a) => a.teamSeason).filter((ts) => !current.some((c) => c.id === ts.id));
  return optionsOf([...current, ...assigned], teamSeasonLabel);
}

export function UserForm({ item, ...props }) {
  const teamSeasons = useTeamSeasonOptions(item);
  return (
    <ResourceForm
      item={item}
      {...props}
      defaultValues={{
        title: item?.title ?? '',
        name: item?.name ?? '',
        email: item?.email ?? '',
        role: item?.role ?? 'coach',
        active: item?.active ?? true,
        photoUrl: item?.photoUrl ?? null,
        temporaryPassword: '',
        assignments: (item?.assignments ?? []).map((a) => ({ teamSeason: a.teamSeason.id, role: a.role })),
      }}
      toBody={({ temporaryPassword, active, title, ...values }) => ({ ...values, title: title || null, ...(item ? { active } : { temporaryPassword }) })}
    >
      {(form) => (
        <>
          <Controller name="photoUrl" control={form.control} render={({ field }) => <PhotoField name={form.watch('name') || '?'} value={field.value} onChange={field.onChange} />} />
          <div className={formStyles.pair}>
            <TextInput label="Title" placeholder="Mr., Ms., Coach…" {...bind(form, 'title')} />
            <TextInput label="Name" {...bind(form, 'name', { required: 'Enter their name' })} />
          </div>
          <TextInput label="Email" type="email" autoComplete="off" {...bind(form, 'email', { required: 'Enter their school email' })} />
          <Select label="Access" options={ROLES} {...bind(form, 'role')} />
          {item ? <Checkbox label="Active" hint="Disabled accounts can't sign in" {...form.register('active')} /> : <TemporaryPasswordInput form={form} />}
          <ListEditor form={form} name="assignments" label="Teams they coach" itemLabel="team" max={20} newItem={{ teamSeason: '', role: 'head' }}>
            {(path) => (
              <>
                <Select label="Team" placeholder="Choose a team" options={teamSeasons} {...bind(form, `${path}.teamSeason`, { required: 'Choose a team' })} />
                <Select label="Role" options={COACH_ROLES} {...bind(form, `${path}.role`)} />
              </>
            )}
          </ListEditor>
        </>
      )}
    </ResourceForm>
  );
}
