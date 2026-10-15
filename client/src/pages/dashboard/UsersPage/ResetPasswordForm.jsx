import { useForm } from 'react-hook-form';
import { Button } from '../../../components/Button/Button.jsx';
import formStyles from '../../../components/ResourceForm/ResourceForm.module.css';
import { useResetPassword } from '../../../hooks/users.js';
import { applyServerErrors } from '../../../lib/forms.js';
import { TemporaryPasswordInput } from './TemporaryPasswordInput.jsx';

/** D9 "Reset password": signs the user out everywhere; they must choose a new password at next sign-in. */
export function ResetPasswordForm({ user, onDone, onCancel }) {
  const form = useForm({ defaultValues: { temporaryPassword: '' } });
  const reset = useResetPassword();
  const submit = async ({ temporaryPassword }) => {
    try {
      await reset.mutateAsync({ id: user.id, temporaryPassword });
      onDone();
    } catch (error) {
      applyServerErrors(error, form.setError);
    }
  };
  return (
    <form className={formStyles.form} onSubmit={form.handleSubmit(submit)} noValidate>
      <p>{user.name} will be signed out on every device and asked to choose a new password when they next sign in.</p>
      <TemporaryPasswordInput form={form} />
      <div className={formStyles.actions}>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="navy" disabled={form.formState.isSubmitting}>
          Set temporary password
        </Button>
      </div>
    </form>
  );
}
