import { useSports } from '../../hooks/sports.js';
import { Select } from '../Select/Select.jsx';

/** "All sports" + each sport, by slug — the filter on dashboard lists. */
export function SportFilter({ value, onChange }) {
  const sports = useSports();
  const options = [{ value: '', label: 'All sports' }, ...(sports.data ?? []).map((s) => ({ value: s.slug, label: s.name }))];
  return <Select label="Sport" value={value} options={options} onChange={(event) => onChange(event.target.value)} />;
}
