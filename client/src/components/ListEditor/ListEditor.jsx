import { useFieldArray } from 'react-hook-form';
import { Button } from '../Button/Button.jsx';
import styles from './ListEditor.module.css';

/**
 * Rows of inputs with add / move / remove for a list field (positions, stats, facts…).
 * `children(path, index)` renders one row's fields, e.g. bind(form, `${path}.label`).
 */
export function ListEditor({ form, name, label, hideLegend, itemLabel = 'item', hint, newItem, max, children }) {
  const { fields, append, remove, move } = useFieldArray({ control: form.control, name });
  const own = name.split('.').reduce((node, key) => node?.[key], form.formState.errors);
  const listError = own?.message ?? own?.root?.message;
  return (
    <fieldset className={styles.list}>
      <legend className={hideLegend ? 'visually-hidden' : styles.legend}>{label}</legend>
      {hint && <p className={styles.hint}>{hint}</p>}
      {listError && (
        <p role="alert" className={styles.error}>
          {listError}
        </p>
      )}
      <ol className={styles.rows}>
        {fields.map((field, index) => (
          <li key={field.id} className={styles.row}>
            <div className={styles.fields}>{children(`${name}.${index}`, index)}</div>
            <div className={styles.rowActions}>
              <Button variant="ghost" size="sm" icon="expand_less" aria-label={`Move ${itemLabel} ${index + 1} up`} disabled={index === 0} onClick={() => move(index, index - 1)} />
              <Button variant="ghost" size="sm" icon="expand_more" aria-label={`Move ${itemLabel} ${index + 1} down`} disabled={index === fields.length - 1} onClick={() => move(index, index + 1)} />
              <Button variant="ghost" size="sm" icon="delete" aria-label={`Remove ${itemLabel} ${index + 1}`} onClick={() => remove(index)} />
            </div>
          </li>
        ))}
      </ol>
      <Button variant="outline" size="sm" icon="add" disabled={max !== undefined && fields.length >= max} onClick={() => append(newItem)}>
        Add {itemLabel}
      </Button>
    </fieldset>
  );
}
