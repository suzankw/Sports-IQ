import { Button } from '../components/Button/Button.jsx';
import { PageHeader } from '../components/PageHeader/PageHeader.jsx';

export function NotFoundPage() {
  return (
    <>
      <title>Page not found · Sports IQ</title>
      <PageHeader title="Page not found" subtitle="That page doesn't exist, or it has moved." />
      <Button to="/" variant="navy">
        Back to the home page
      </Button>
    </>
  );
}
