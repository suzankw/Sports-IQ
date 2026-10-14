import { Link } from 'react-router';
import { cx } from '../../lib/cx.js';
import { Icon } from '../Icon/Icon.jsx';
import styles from './Button.module.css';

/**
 * variant: primary (Turi red) · navy · outline · ghost · gold · light (outline on navy).
 * Renders a router <Link> with `to`, an <a> with `href`, otherwise a <button>.
 */
export function Button({ variant = 'primary', size = 'md', icon, iconEnd, to, href, className, children, ...rest }) {
  const classes = cx(styles.button, styles[variant], styles[size], !children && styles.iconOnly, className);
  const content = (
    <>
      {icon && <Icon name={icon} size="sm" />}
      {children}
      {iconEnd && <Icon name={iconEnd} size="sm" />}
    </>
  );
  if (to) return <Link to={to} className={classes} {...rest}>{content}</Link>;
  if (href) return <a href={href} className={classes} {...rest}>{content}</a>;
  return <button type="button" className={classes} {...rest}>{content}</button>;
}
