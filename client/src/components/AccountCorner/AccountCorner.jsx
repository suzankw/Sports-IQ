import { Link } from 'react-router';
import { useMe } from '../../hooks/auth.js';
import { Avatar } from '../Avatar/Avatar.jsx';
import styles from './AccountCorner.module.css';

/** Top-right: the signed-in user's avatar (to the dashboard) or "Staff sign in". */
export function AccountCorner() {
  const me = useMe();
  if (me.isPending) return null;
  if (!me.data) {
    return (
      <Link to="/login" className={styles.signIn}>
        Staff sign in
      </Link>
    );
  }
  const { user } = me.data;
  return (
    <Link to="/dashboard" className={styles.avatar} aria-label={`${user.name} — open the dashboard`}>
      <Avatar src={user.photoUrl} name={user.name} size="sm" />
    </Link>
  );
}
