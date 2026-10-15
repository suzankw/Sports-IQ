import { useForm } from 'react-hook-form';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router';
import { Avatar } from '../../components/Avatar/Avatar.jsx';
import { Button } from '../../components/Button/Button.jsx';
import { TextInput } from '../../components/TextInput/TextInput.jsx';
import { useLogin, useMe } from '../../hooks/auth.js';
import { useHomeSchool } from '../../hooks/schools.js';
import styles from './LoginPage.module.css';

/** Only same-site paths, so a crafted link can't send staff elsewhere after signing in. */
const safeNext = (next) => (next?.startsWith('/') && !next.startsWith('//') ? next : '/dashboard');

export function LoginPage() {
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));
  const me = useMe();
  const school = useHomeSchool();
  const login = useLogin();
  const navigate = useNavigate();
  const { register, handleSubmit, setError, formState } = useForm();

  if (me.data) return <Navigate to={next} replace />;

  const onSubmit = async (credentials) => {
    try {
      await login.mutateAsync(credentials);
      navigate(next, { replace: true });
    } catch (error) {
      setError('root.server', { message: error.message });
    }
  };

  return (
    <main className={styles.page}>
      <title>Staff sign in · Sports IQ</title>
      <form className={styles.card} onSubmit={handleSubmit(onSubmit)} noValidate>
        <Avatar src={school.data?.crestUrl} name={school.data?.name ?? "St. Andrew's Turi"} size="xl" shape="square" tone="neutral" className={styles.crest} />
        <h1 className={styles.title}>Staff sign in</h1>
        <p className={styles.lead}>For coaches and the sports office.</p>
        {formState.errors.root?.server && (
          <p role="alert" className={styles.error}>
            {formState.errors.root.server.message}
          </p>
        )}
        <TextInput label="Email" type="email" autoComplete="username" error={formState.errors.email?.message} {...register('email', { required: 'Enter your email' })} />
        <TextInput label="Password" type="password" autoComplete="current-password" error={formState.errors.password?.message} {...register('password', { required: 'Enter your password' })} />
        <Button type="submit" variant="navy" disabled={formState.isSubmitting} className={styles.submit}>
          {formState.isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>
        <Link to="/" className={styles.back}>
          Back to the public site
        </Link>
      </form>
    </main>
  );
}
