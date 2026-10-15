import { FormField } from '../FormField/FormField.jsx';
import { Icon } from '../Icon/Icon.jsx';
import styles from './Select.module.css';

/** Native select with a label. options: [{ value, label }]. `onChange` gets the native event. */
export function Select({ label, hideLabel, hint, error, options, className, placeholder, ...rest }) {
  return (
    <FormField label={label} hideLabel={hideLabel} hint={hint} error={error} className={className}>
      {(field) => (
        <div className={styles.control}>
          <select {...field} className={styles.select} {...rest}>
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <Icon name="expand_more" className={styles.chevron} />
        </div>
      )}
    </FormField>
  );
}
