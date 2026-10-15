import { Button } from '../../../components/Button/Button.jsx';
import { TextInput } from '../../../components/TextInput/TextInput.jsx';
import { bind } from '../../../lib/forms.js';
import { temporaryPassword } from '../../../lib/password.js';
import styles from './UsersPage.module.css';

/** Shown in clear so it can be passed on; the user must replace it at first sign-in. */
export function TemporaryPasswordInput({ form }) {
  return (
    <div className={styles.passwordRow}>
      <TextInput
        label="Temporary password"
        autoComplete="off"
        spellCheck={false}
        hint="Give it to them in person. They choose their own at first sign-in."
        className={styles.grow}
        {...bind(form, 'temporaryPassword', { required: 'Set a temporary password', minLength: { value: 10, message: 'Use at least 10 characters' } })}
      />
      <Button variant="outline" size="sm" icon="key" onClick={() => form.setValue('temporaryPassword', temporaryPassword(), { shouldValidate: true })}>
        Generate
      </Button>
    </div>
  );
}
