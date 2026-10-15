import { PhotoCard } from '../../../components/PhotoCard/PhotoCard.jsx';
import { fullName, STAFF_ROLES, staffName } from '../../../lib/people.js';
import styles from './RosterPage.module.css';

/** Coaches, then the captain on a double-width card. */
export function RosterHero({ teamSeason, positions }) {
  const captain = teamSeason.members.find((m) => m.player.id === teamSeason.captain?.id);
  const coaches = [...teamSeason.staff].reverse();
  return (
    <section className={styles.hero} aria-label="Coaches and captain">
      {coaches.map(({ user, role }) => (
        <PhotoCard key={user.id} size="lg" photoUrl={user.photoUrl} name={staffName(user)} initialsOf={user.name} eyebrow={STAFF_ROLES[role].label} eyebrowIcon={STAFF_ROLES[role].icon} />
      ))}
      {captain && (
        <PhotoCard
          size="lg"
          className={styles.captain}
          photoUrl={captain.player.photoUrl}
          name={fullName(captain.player)}
          eyebrow="Team Captain"
          eyebrowIcon="workspace_premium"
          detail={`${positions[captain.position] ?? captain.position} • #${captain.number}`}
          badge={captain.number}
        />
      )}
    </section>
  );
}
