import { Link } from 'react-router';
import { useMe } from '../../hooks/auth.js';
import { AvatarMenu } from '../AvatarMenu/AvatarMenu.jsx';
import { Icon } from '../Icon/Icon.jsx';
import styles from './AccountCorner.module.css';

/** Public top-right: the account menu when signed in, otherwise "Staff sign in". */
export function AccountCorner() {
  const me = useMe();
  if (me.isPending) return null;
  if (me.data) return <AvatarMenu me={me.data} />;
  return (
    <Link to="/login" className={styles.signIn}>
      <Icon name="login" size="sm" />
      <span className={styles.label}>Staff sign in</span>
    </Link>
  );
}
