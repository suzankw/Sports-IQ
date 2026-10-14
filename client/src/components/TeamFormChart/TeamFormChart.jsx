import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatDate } from '../../lib/dates.js';
import styles from './TeamFormChart.module.css';

const signed = (n) => (n > 0 ? `+${n}` : String(n));

/**
 * The team stat (e.g. possession, left axis) and goal/points difference (right axis) over the last matches.
 * Recharts draws it; a visually hidden table gives screen readers the same numbers.
 */
export function TeamFormChart({ form, statLabel, differenceLabel }) {
  const data = form.map((f, i) => ({ name: `M${i + 1}`, opponent: f.opponent.shortName, stat: f.teamStat, goalDifference: f.goalDifference }));
  return (
    <>
      <div className={styles.chart} aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--color-surface-container-high)" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} />
            {statLabel && <YAxis yAxisId="stat" tickLine={false} axisLine={false} width={40} domain={['auto', 'auto']} />}
            <YAxis yAxisId="gd" orientation="right" tickLine={false} axisLine={false} width={32} allowDecimals={false} />
            <Tooltip labelFormatter={(label, items) => `${label} · vs ${items[0]?.payload.opponent ?? ''}`} />
            {statLabel && (
              <Area yAxisId="stat" type="monotone" dataKey="stat" name={statLabel} stroke="var(--color-on-primary-fixed-variant)" strokeWidth={2} fill="var(--color-primary-fixed)" dot />
            )}
            <Line yAxisId="gd" type="monotone" dataKey="goalDifference" name={differenceLabel} stroke="var(--color-excellence-gold)" strokeWidth={2} strokeDasharray="5 4" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <table className="visually-hidden">
        <caption>Team form, oldest match first</caption>
        <thead>
          <tr>
            <th scope="col">Match</th>
            {statLabel && <th scope="col">{statLabel}</th>}
            <th scope="col">{differenceLabel}</th>
          </tr>
        </thead>
        <tbody>
          {form.map((f) => (
            <tr key={f.match}>
              <th scope="row">{`${formatDate(f.kickoffAt)} vs ${f.opponent.name}`}</th>
              {statLabel && <td>{f.teamStat ?? '—'}</td>}
              <td>{signed(f.goalDifference)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
