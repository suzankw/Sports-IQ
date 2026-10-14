import { Card } from '../../../components/Card/Card.jsx';
import { Icon } from '../../../components/Icon/Icon.jsx';
import styles from './MatchPage.module.css';

const MESSAGES = {
  upcoming: 'Lineups and statistics appear here after the match.',
  live: 'The match is under way. The full report appears after the final whistle.',
  completed: 'The full report will appear here once the coach publishes it.',
};

/** Shown instead of the tabs when there's no published result yet. */
export function MatchNotice({ status }) {
  return (
    <Card className={styles.notice}>
      <Icon name="info" />
      <p>{MESSAGES[status]}</p>
    </Card>
  );
}
