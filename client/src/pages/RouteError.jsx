import { useRouteError } from 'react-router';
import { Button } from '../components/Button/Button.jsx';
import { PageHeader } from '../components/PageHeader/PageHeader.jsx';
import styles from './RouteError.module.css';

/** Shown instead of a page that crashed, so visitors never see a stack trace. */
export function RouteError() {
  const error = useRouteError();
  console.error(error);
  return (
    <main className={styles.page}>
      <PageHeader title="Something went wrong" subtitle="This page couldn't be shown. Try again, or go back to the home page." />
      <div className={styles.actions}>
        <Button variant="navy" onClick={() => window.location.reload()}>
          Try again
        </Button>
        <Button variant="outline" href="/">
          Home page
        </Button>
      </div>
    </main>
  );
}
