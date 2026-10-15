import { Controller } from 'react-hook-form';
import { Avatar } from '../../../components/Avatar/Avatar.jsx';
import { Badge } from '../../../components/Badge/Badge.jsx';
import { PhotoField } from '../../../components/PhotoField/PhotoField.jsx';
import { ResourceForm } from '../../../components/ResourceForm/ResourceForm.jsx';
import { ResourceScreen } from '../../../components/ResourceScreen/ResourceScreen.jsx';
import { TextInput } from '../../../components/TextInput/TextInput.jsx';
import { useList, useResource } from '../../../hooks/resources.js';
import styles from './SchoolsPage.module.css';

const columns = [
  {
    key: 'name',
    header: 'School',
    isRowHeader: true,
    render: (s) => (
      <span className={styles.school}>
        <Avatar src={s.crestUrl} name={s.shortName} size="sm" shape="square" />
        {s.name}
        {s.isHome && <Badge tone="navy">Home</Badge>}
      </span>
    ),
  },
  { key: 'shortName', header: 'Short name' },
];

function SchoolForm({ item, ...props }) {
  return (
    <ResourceForm item={item} {...props} defaultValues={{ name: item?.name ?? '', shortName: item?.shortName ?? '', crestUrl: item?.crestUrl ?? null }}>
      {({ register, control, watch, formState: { errors } }) => (
        <>
          <Controller
            name="crestUrl"
            control={control}
            render={({ field }) => <PhotoField label="Crest" name={watch('shortName') || '?'} shape="square" value={field.value} onChange={field.onChange} />}
          />
          <TextInput label="Name" placeholder="Peponi School" error={errors.name?.message} {...register('name', { required: 'Enter the name' })} />
          <TextInput label="Short name" hint="Shown on fixtures and in tables" error={errors.shortName?.message} {...register('shortName', { required: 'Enter a short name' })} />
        </>
      )}
    </ResourceForm>
  );
}

/** D8 Schools: Turi and the opponents. */
export function SchoolsPage() {
  return (
    <ResourceScreen
      title="Schools"
      subtitle="St. Andrew's Turi and the schools it plays."
      noun="school"
      nameOf={(s) => s.name}
      query={useList('/schools')}
      resource={useResource('/schools')}
      columns={columns}
      Form={SchoolForm}
      canDelete={(s) => !s.isHome}
    />
  );
}
