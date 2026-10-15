import { Controller, useWatch } from 'react-hook-form';
import { PhotoField } from '../../../components/PhotoField/PhotoField.jsx';
import { Select } from '../../../components/Select/Select.jsx';
import { TextInput } from '../../../components/TextInput/TextInput.jsx';
import { appearedPlayers } from '../../../lib/resultForm.js';
import { GalleryField } from './GalleryField.jsx';
import styles from './ResultPage.module.css';

/** 6 · Top performers (the first gets the ★), the report quote, hero photo and gallery. */
export function ReportSection({ form, sport, people }) {
  const values = useWatch({ control: form.control });
  const options = appearedPlayers(values, sport).map((id) => ({ value: id, label: people.get(id)?.label ?? id }));
  return (
    <>
      <div className={styles.performers}>
        {[0, 1, 2].map((i) => (
          <Select key={i} label={i === 0 ? 'Player of the match ★' : `Top performer ${i + 1}`} placeholder="—" options={options} {...form.register(`topPerformers.${i}`)} />
        ))}
      </div>
      <TextInput label="Report quote" multiline rows={3} placeholder="A resolute display…" {...form.register('report.text')} />
      <TextInput
        label="Quote by"
        placeholder="Head Coach"
        error={form.formState.errors.report?.attribution?.message}
        {...form.register('report.attribution', { validate: (value, all) => !all.report.text.trim() || Boolean(value.trim()) || 'Say who said it' })}
      />
      <Controller
        name="heroPhotoUrl"
        control={form.control}
        render={({ field }) => <PhotoField label="Hero photo (behind the scoreboard)" name="Hero" shape="square" value={field.value} onChange={field.onChange} />}
      />
      <GalleryField form={form} />
    </>
  );
}
