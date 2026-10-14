import { useRef } from 'react';
import { cx } from '../../lib/cx.js';
import { Icon } from '../Icon/Icon.jsx';
import styles from './Tabs.module.css';

export const tabId = (id) => `tab-${id}`;
export const panelId = (id) => `panel-${id}`;

const KEY_STEPS = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };

function targetIndex(key, index, count) {
  if (key === 'Home') return 0;
  if (key === 'End') return count - 1;
  const step = KEY_STEPS[key];
  return step ? (index + step + count) % count : null;
}

/** ARIA tabs with arrow-key navigation. variant: bar (navy) · segmented (light, filled active) · underline. */
export function Tabs({ items, value, onChange, label, variant = 'bar' }) {
  const refs = useRef([]);

  const onKeyDown = (event, index) => {
    const target = targetIndex(event.key, index, items.length);
    if (target === null) return;
    event.preventDefault();
    refs.current[target].focus();
    onChange(items[target].id);
  };

  return (
    <div role="tablist" aria-label={label} className={cx(styles.list, styles[variant])} data-print="hide">
      {items.map((item, index) => {
        const selected = item.id === value;
        return (
          <button
            key={item.id}
            ref={(el) => (refs.current[index] = el)}
            type="button"
            role="tab"
            id={tabId(item.id)}
            aria-selected={selected}
            aria-controls={panelId(item.id)}
            tabIndex={selected ? 0 : -1}
            className={styles.tab}
            onClick={() => onChange(item.id)}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            {item.icon && <Icon name={item.icon} size="sm" />}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export function TabPanel({ id, className, children }) {
  return (
    <div role="tabpanel" id={panelId(id)} aria-labelledby={tabId(id)} className={className}>
      {children}
    </div>
  );
}
