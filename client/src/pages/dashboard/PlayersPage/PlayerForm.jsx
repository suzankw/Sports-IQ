import { Controller } from 'react-hook-form';
import { PhotoField } from '../../../components/PhotoField/PhotoField.jsx';
import { ResourceForm } from '../../../components/ResourceForm/ResourceForm.jsx';
import formStyles from '../../../components/ResourceForm/ResourceForm.module.css';
import { Select } from '../../../components/Select/Select.jsx';
import { TextInput } from '../../../components/TextInput/TextInput.jsx';
import { bind } from '../../../lib/forms.js';
import { PLAYER_GENDERS } from '../../../lib/people.js';

/** Name, gender and photo — also the roster editor's "New player" form (with `compact`, no photo). */
export function PlayerForm({ item, compact, ...props }) {
  return (
    <ResourceForm
      item={item}
      {...props}
      defaultValues={{ firstName: item?.firstName ?? '', lastName: item?.lastName ?? '', gender: item?.gender ?? '', photoUrl: item?.photoUrl ?? null }}
    >
      {(form) => (
        <>
          {!compact && (
            <Controller
              name="photoUrl"
              control={form.control}
              render={({ field }) => <PhotoField name={`${form.watch('firstName')} ${form.watch('lastName')}`.trim() || '?'} value={field.value} onChange={field.onChange} />}
            />
          )}
          <div className={formStyles.pair}>
            <TextInput label="First name" autoComplete="off" {...bind(form, 'firstName', { required: 'Enter the first name' })} />
            <TextInput label="Last name" autoComplete="off" {...bind(form, 'lastName', { required: 'Enter the last name' })} />
          </div>
          <Select label="Gender" placeholder="Choose" options={PLAYER_GENDERS} {...bind(form, 'gender', { required: 'Choose' })} />
        </>
      )}
    </ResourceForm>
  );
}
