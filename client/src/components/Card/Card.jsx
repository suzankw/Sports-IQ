import { cx } from '../../lib/cx.js';
import { Icon } from '../Icon/Icon.jsx';
import styles from './Card.module.css';

/** White container with a 1px outline. `accent` adds the 4px top border (navy or gold). */
export function Card({ accent, as: Tag = 'section', className, children, ...rest }) {
  return (
    <Tag className={cx(styles.card, accent && styles[accent], className)} {...rest}>
      {children}
    </Tag>
  );
}

export function CardHeader({ title, icon, actions, as: Heading = 'h2', tone }) {
  return (
    <header className={cx(styles.header, tone && styles[tone])}>
      <Heading className={styles.title}>
        {icon && <Icon name={icon} className={styles.icon} />}
        {title}
      </Heading>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  );
}
