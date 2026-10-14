import { useSearchParams } from 'react-router';

/**
 * Shareable view state (team, season, tab, filters) kept in the query string.
 * Values equal to their default are left out of the URL.
 */
export function useUrlState(defaults) {
  const [params, setParams] = useSearchParams();
  const state = Object.fromEntries(Object.keys(defaults).map((key) => [key, params.get(key) ?? defaults[key]]));

  const update = (changes) =>
    setParams((current) => {
      const next = new URLSearchParams(current);
      for (const [key, value] of Object.entries(changes)) {
        if (value === undefined || value === null || value === '' || value === defaults[key]) next.delete(key);
        else next.set(key, value);
      }
      return next;
    });

  return [state, update];
}
