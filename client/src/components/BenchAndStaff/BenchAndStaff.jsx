import { Avatar } from '../Avatar/Avatar.jsx';
import { Card, CardHeader } from '../Card/Card.jsx';
import { Icon } from '../Icon/Icon.jsx';
import styles from './BenchAndStaff.module.css';

const ROLE_LABELS = { head: 'Head Coach', assistant: 'Assistant Coach' };
export const staffName = (user) => [user.title, user.name].filter(Boolean).join(' ');

/** substitutes: [{ player, number, onMinute }] · staff: [{ user, role }] */
export function BenchAndStaff({ substitutes, staff }) {
  return (
    <Card>
      <CardHeader title="Bench & Staff" />
      <div className={styles.body}>
        <h3 className={styles.heading}>Substitutes</h3>
        {substitutes.length === 0 && <p className={styles.none}>No substitutes named.</p>}
        <ul className={styles.list}>
          {substitutes.map(({ player, number, onMinute }) => (
            <li key={player.id} className={styles.row}>
              <Avatar src={player.photoUrl} name={`${player.firstName} ${player.lastName}`} size="sm" />
              <span className={styles.number}>{number}</span>
              <span className={styles.name}>{player.shortName}</span>
              {onMinute != null && (
                <span className={styles.minute}>
                  <Icon name="swap_horiz" size="sm" label="Came on" />
                  {onMinute}&apos;
                </span>
              )}
            </li>
          ))}
        </ul>
        <h3 className={styles.heading}>Coaching staff</h3>
        <ul className={styles.list}>
          {staff.map(({ user, role }) => (
            <li key={user.id} className={styles.row}>
              <Avatar src={user.photoUrl} name={user.name} size="sm" />
              <span>
                <span className={styles.name}>{staffName(user)}</span>
                <span className={styles.role}>{ROLE_LABELS[role]}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
