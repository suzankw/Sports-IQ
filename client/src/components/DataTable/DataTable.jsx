import { cx } from '../../lib/cx.js';
import styles from './DataTable.module.css';

/**
 * columns: [{ key, header, align: 'start'|'center'|'end', render(row, index), isRowHeader }]
 * headerTone: 'light' (league table, schedule) or 'navy' (stats tables). `dense` tightens padding for narrow spaces.
 */
export function DataTable({ columns, rows, rowKey, caption, headerTone = 'light', isHighlighted, dense, empty = 'Nothing to show yet.' }) {
  return (
    <div className={styles.scroll}>
      <table className={cx(styles.table, dense && styles.dense)}>
        <caption className="visually-hidden">{caption}</caption>
        <thead className={styles[headerTone]}>
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col" className={styles[c.align ?? 'start']}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className={styles.empty}>{empty}</td>
            </tr>
          )}
          {rows.map((row, i) => (
            <tr key={rowKey(row)} className={cx(isHighlighted?.(row) && styles.highlight)}>
              {columns.map((c) => {
                const Cell = c.isRowHeader ? 'th' : 'td';
                return (
                  <Cell key={c.key} scope={c.isRowHeader ? 'row' : undefined} className={styles[c.align ?? 'start']}>
                    {c.render ? c.render(row, i) : row[c.key]}
                  </Cell>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
