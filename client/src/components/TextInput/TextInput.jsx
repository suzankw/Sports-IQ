import { cx } from '../../lib/cx.js';
import { FormField } from '../FormField/FormField.jsx';
import { Icon } from '../Icon/Icon.jsx';
import styles from './TextInput.module.css';

/** Labelled text input (or textarea with `multiline`), optionally with a leading icon. */
export function TextInput({ label, hideLabel, hint, error, icon, multiline, className, ...rest }) {
  const Control = multiline ? 'textarea' : 'input';
  return (
    <FormField label={label} hideLabel={hideLabel} hint={hint} error={error} className={className}>
      {(field) => (
        <div className={styles.control}>
          {icon && <Icon name={icon} size="sm" className={styles.icon} />}
          <Control {...field} className={cx(styles.input, icon && styles.withIcon, multiline && styles.multiline)} {...rest} />
        </div>
      )}
    </FormField>
  );
}

export const NumberInput = (props) => <TextInput type="number" inputMode="numeric" min={0} {...props} />;

/** Date and time in East Africa Time; convert with lib/dates fromEatInput / toEatInput. */
export const DateTimeInput = (props) => <TextInput type="datetime-local" hint="East Africa Time" {...props} />;
