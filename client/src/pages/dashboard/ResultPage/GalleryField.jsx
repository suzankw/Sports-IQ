import { useWatch } from 'react-hook-form';
import { Button } from '../../../components/Button/Button.jsx';
import { useUpload } from '../../../hooks/uploads.js';
import styles from './ResultPage.module.css';

const MAX = 6;

/** Up to 6 match photos (resized in the browser, then uploaded). */
export function GalleryField({ form }) {
  const urls = useWatch({ control: form.control, name: 'galleryUrls' });
  const upload = useUpload();
  const set = (next) => form.setValue('galleryUrls', next, { shouldDirty: true });
  const add = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) set([...urls, await upload.mutateAsync(file)]);
  };
  return (
    <fieldset className={styles.galleryField}>
      <legend className={styles.legend}>Gallery (up to {MAX})</legend>
      <ul className={styles.gallery}>
        {urls.map((url, i) => (
          <li key={url} className={styles.photo}>
            <img src={url} alt={`Gallery ${i + 1} of ${urls.length}`} />
            <Button variant="light" size="sm" icon="delete" aria-label={`Remove photo ${i + 1}`} className={styles.removePhoto} onClick={() => set(urls.filter((_, j) => j !== i))} />
          </li>
        ))}
      </ul>
      {urls.length < MAX && (
        <label className={styles.addPhoto}>
          <input type="file" accept="image/jpeg,image/png,image/webp" className="visually-hidden" onChange={add} />
          <span>{upload.isPending ? 'Uploading…' : 'Add a photo'}</span>
        </label>
      )}
      {upload.error && <p className={styles.error}>{upload.error.message}</p>}
    </fieldset>
  );
}
