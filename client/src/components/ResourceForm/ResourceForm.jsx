import { useForm } from 'react-hook-form';
import { applyServerErrors } from '../../lib/forms.js';
import { Button } from '../Button/Button.jsx';
import styles from './ResourceForm.module.css';

/**
 * The add/edit form inside a ResourceScreen dialog: creates or updates through `resource` and puts
 * server errors under their fields. `toBody(values, item)` shapes the request (e.g. drops fields that can't change).
 * `children(form)` renders the fields with react-hook-form's API.
 */
export function ResourceForm({ item, resource, defaultValues, toBody = (values) => values, onSaved, onCancel, children }) {
  const form = useForm({ defaultValues });
  const { errors, isSubmitting } = form.formState;
  const submit = async (values) => {
    try {
      const body = toBody(values, item);
      onSaved(item ? await resource.update.mutateAsync({ id: item.id, ...body }) : await resource.create.mutateAsync(body));
    } catch (error) {
      applyServerErrors(error, form.setError);
    }
  };
  return (
    <form className={styles.form} onSubmit={form.handleSubmit(submit)} noValidate>
      {errors.root?.server && (
        <p role="alert" className={styles.error}>
          {errors.root.server.message}
        </p>
      )}
      {children(form)}
      <div className={styles.actions}>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="navy" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </form>
  );
}
