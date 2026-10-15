import { Navigate } from 'react-router';
import { QueryState } from '../../components/QueryState/QueryState.jsx';
import { useSports } from '../../hooks/sports.js';

/** "/" opens the first sport. */
export function HomeRedirect() {
  const sports = useSports();
  return <QueryState query={sports}>{(list) => <Navigate to={`/${list[0]?.slug ?? 'football'}`} replace />}</QueryState>;
}
