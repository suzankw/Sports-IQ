import { useShare } from '../../hooks/useShare.js';
import { Button } from '../Button/Button.jsx';
import styles from './ShareButton.module.css';

export function ShareButton({ title, children = 'Share report' }) {
  const { share, status } = useShare();
  return (
    <span className={styles.wrap}>
      <Button icon="share" onClick={() => share(title)}>
        {children}
      </Button>
      <span role="status" className={styles.status}>
        {status}
      </span>
    </span>
  );
}
