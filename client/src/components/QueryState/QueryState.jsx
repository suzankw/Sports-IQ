import { Button } from '../Button/Button.jsx';
import { Icon } from '../Icon/Icon.jsx';
import styles from './QueryState.module.css';

/** Loading, error and empty states for any TanStack query; renders `children(data)` otherwise. */
export function QueryState({ query, children, isEmpty = () => false, emptyText = 'Nothing here yet.' }) {
  if (query.isPending) {
    return (
      <p role="status" className={styles.message}>
        Loading…
      </p>
    );
  }
  if (query.isError) {
    const notFound = query.error.status === 404;
    return (
      <div role="alert" className={styles.message}>
        <Icon name={notFound ? 'info' : 'error'} />
        <p>{notFound ? "We couldn't find that." : "Something went wrong and the data didn't load."}</p>
        {!notFound && (
          <Button variant="outline" size="sm" onClick={() => query.refetch()}>
            Try again
          </Button>
        )}
      </div>
    );
  }
  if (isEmpty(query.data)) return <p className={styles.message}>{emptyText}</p>;
  return children(query.data);
}
