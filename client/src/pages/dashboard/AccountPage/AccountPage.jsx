import { Controller, useForm } from 'react-hook-form';
import { Button } from '../../../components/Button/Button.jsx';
import { Card, CardHeader } from '../../../components/Card/Card.jsx';
import { PageHeader } from '../../../components/PageHeader/PageHeader.jsx';
import { PhotoField } from '../../../components/PhotoField/PhotoField.jsx';
import { TextInput } from '../../../components/TextInput/TextInput.jsx';
import { useToast } from '../../../components/Toast/Toast.jsx';
import { useChangePassword, useMe, useUpdateMe } from '../../../hooks/auth.js';
import { applyServerErrors } from '../../../lib/forms.js';
import styles from './AccountPage.module.css';

function ProfileForm({ user }) {
  const update = useUpdateMe();
  const toast = useToast();
  const { register, control, handleSubmit, setError, formState } = useForm({ defaultValues: { title: user.title ?? '', name: user.name, photoUrl: user.photoUrl } });
  const onSubmit = async (values) => {
    try {
      await update.mutateAsync({ ...values, title: values.title || null });
      toast('Profile saved');
    } catch (error) {
      applyServerErrors(error, setError);
    }
  };
  return (
    <Card>
      <CardHeader title="Profile" />
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <Controller name="photoUrl" control={control} render={({ field }) => <PhotoField name={user.name} value={field.value} onChange={field.onChange} />} />
        <TextInput label="Title" placeholder="Mr., Ms., Coach…" error={formState.errors.title?.message} {...register('title')} />
        <TextInput label="Name" error={formState.errors.name?.message} {...register('name', { required: 'Enter your name' })} />
        <Button type="submit" variant="navy" disabled={formState.isSubmitting} className={styles.submit}>
          Save profile
        </Button>
      </form>
    </Card>
  );
}

function PasswordForm() {
  const change = useChangePassword();
  const toast = useToast();
  const { register, handleSubmit, setError, reset, getValues, formState } = useForm();
  const onSubmit = async ({ currentPassword, newPassword }) => {
    try {
      await change.mutateAsync({ currentPassword, newPassword });
      reset();
      toast('Password changed');
    } catch (error) {
      applyServerErrors(error, setError);
    }
  };
  const { errors } = formState;
  return (
    <Card>
      <CardHeader title="Password" />
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        {errors.root?.server && <p role="alert" className={styles.error}>{errors.root.server.message}</p>}
        <TextInput label="Current password" type="password" autoComplete="current-password" error={errors.currentPassword?.message} {...register('currentPassword', { required: 'Enter your current password' })} />
        <TextInput label="New password" type="password" autoComplete="new-password" hint="At least 10 characters" error={errors.newPassword?.message} {...register('newPassword', { required: 'Choose a new password', minLength: { value: 10, message: 'Use at least 10 characters' } })} />
        <TextInput label="Confirm new password" type="password" autoComplete="new-password" error={errors.confirm?.message} {...register('confirm', { validate: (v) => v === getValues('newPassword') || "The passwords don't match" })} />
        <Button type="submit" variant="navy" disabled={formState.isSubmitting} className={styles.submit}>
          Change password
        </Button>
      </form>
    </Card>
  );
}

export function AccountPage() {
  const { data: me } = useMe();
  const forced = me.user.mustChangePassword;
  return (
    <>
      <title>My account · Sports IQ</title>
      <PageHeader title="My account" subtitle={me.user.email} />
      {forced && (
        <p role="alert" className={styles.banner}>
          You&apos;re using a temporary password. Choose a new one to continue.
        </p>
      )}
      <div className={styles.grid}>
        {!forced && <ProfileForm user={me.user} />}
        <PasswordForm />
      </div>
    </>
  );
}
