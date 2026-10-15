import { Leaderboard } from '../../../components/Leaderboard/Leaderboard.jsx';
import styles from './SeasonStatsPage.module.css';

/** Top-10 tables for one leaderboard group (Scoring = attack, Discipline = discipline). */
export function LeaderboardsTab({ stats, sport, group }) {
  const abbrOf = Object.fromEntries(sport.playerStats.map((d) => [d.key, d.abbr]));
  const sportBoards = Object.fromEntries(sport.leaderboards.map((b) => [b.key, b]));
  const boards = stats.leaderboards.filter((b) => b.group === group);
  if (boards.length === 0) return <p className={styles.empty}>No leaderboards are defined for this sport.</p>;
  return (
    <div className={styles.tables}>
      {boards.map((board) => {
        const parts = sportBoards[board.key]?.stats ?? [];
        return <Leaderboard key={board.key} board={board} valueHeader={parts.length === 1 ? abbrOf[parts[0]] : 'Total'} />;
      })}
    </div>
  );
}
