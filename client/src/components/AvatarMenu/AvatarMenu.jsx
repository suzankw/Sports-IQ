import { useEffect, useId, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useLogout } from '../../hooks/auth.js';
import { staffName } from '../../lib/people.js';
import { Avatar } from '../Avatar/Avatar.jsx';
import { Badge } from '../Badge/Badge.jsx';
import { Icon } from '../Icon/Icon.jsx';
import styles from './AvatarMenu.module.css';

/** Top-right account menu (Google-style): who's signed in, account, dashboard/public site, sign out. */
export function AvatarMenu({ me, inDashboard }) {
  const [open, setOpen] = useState(false);
  const wrapper = useRef(null);
  const menuId = useId();
  const logout = useLogout();
  const navigate = useNavigate();
  const { user } = me;

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (event) => !wrapper.current.contains(event.target) && setOpen(false);
    const onKey = (event) => event.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const signOut = async () => {
    await logout.mutateAsync();
    navigate('/');
  };
  const close = () => setOpen(false);

  return (
    <div ref={wrapper} className={styles.wrapper}>
      <button type="button" className={styles.trigger} aria-expanded={open} aria-controls={menuId} aria-label={`Account menu for ${user.name}`} onClick={() => setOpen(!open)}>
        <Avatar src={user.photoUrl} name={user.name} size="sm" />
      </button>
      {open && (
        <div id={menuId} className={styles.menu}>
          <div className={styles.who}>
            <Avatar src={user.photoUrl} name={user.name} size="lg" />
            <p className={styles.name}>{staffName(user)}</p>
            <p className={styles.email}>{user.email}</p>
            <Badge tone={user.role === 'admin' ? 'gold' : 'navy'}>{user.role === 'admin' ? 'Admin' : 'Coach'}</Badge>
          </div>
          <ul className={styles.links}>
            <li>
              <Link to="/dashboard/account" onClick={close}>
                <Icon name="manage_accounts" /> Manage your account
              </Link>
            </li>
            <li>
              <Link to={inDashboard ? '/' : '/dashboard'} onClick={close}>
                <Icon name={inDashboard ? 'open_in_new' : 'dashboard'} /> {inDashboard ? 'View public site' : 'Dashboard'}
              </Link>
            </li>
            <li>
              <button type="button" onClick={signOut} disabled={logout.isPending}>
                <Icon name="logout" /> Sign out
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
