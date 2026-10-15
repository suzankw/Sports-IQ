import { useUpload } from '../../hooks/uploads.js';
import { Avatar } from '../Avatar/Avatar.jsx';
import { Button } from '../Button/Button.jsx';
import { FormField } from '../FormField/FormField.jsx';
import styles from './PhotoField.module.css';

/** Photo preview + upload + remove. value/onChange are the photo URL (use with a form Controller). */
export function PhotoField({ label = 'Photo', name, value, onChange, shape = 'circle' }) {
  const upload = useUpload();
  const choose = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) onChange(await upload.mutateAsync(file));
  };
  return (
    <FormField label={label} error={upload.error?.message}>
      {(field) => (
        <div className={styles.row}>
          <Avatar src={value} name={name} size="lg" shape={shape} />
          <label className={styles.upload}>
            <input {...field} type="file" accept="image/jpeg,image/png,image/webp" className="visually-hidden" onChange={choose} />
            <span>{upload.isPending ? 'Uploading…' : value ? 'Change photo' : 'Upload photo'}</span>
          </label>
          {value && (
            <Button variant="ghost" size="sm" onClick={() => onChange(null)}>
              Remove
            </Button>
          )}
        </div>
      )}
    </FormField>
  );
}
