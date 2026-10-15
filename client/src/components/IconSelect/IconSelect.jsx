import { Icon } from '../Icon/Icon.jsx';
import { ICON_NAMES } from '../Icon/iconNames.js';
import { Select } from '../Select/Select.jsx';
import styles from './IconSelect.module.css';

const OPTIONS = ICON_NAMES.map((name) => ({ value: name, label: name.replaceAll('_', ' ') }));

/** Only icons the app downloads can be chosen (see iconNames.js), with a preview of the `current` one. */
export function IconSelect({ current, className, ...rest }) {
  return (
    <div className={`${styles.row} ${className ?? ''}`}>
      <Select options={OPTIONS} placeholder="Choose an icon" className={styles.select} {...rest} />
      {current && <Icon name={current} className={styles.preview} />}
    </div>
  );
}
