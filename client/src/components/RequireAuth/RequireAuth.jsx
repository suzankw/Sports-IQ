import { Navigate, useLocation } from 'react-router';
import { useMe } from '../../hooks/auth.js';
import { Button } from '../Button/Button.jsx';
import { PageHeader } from '../PageHeader/PageHeader.jsx';
import { QueryState } from '../QueryState/QueryState.jsx';

/** Dashboard gate: visitors go to sign in; a temporary password must be changed first. */
export function RequireAuth({ children }) {
  const me = useMe();
  const location = useLocation();
  return (
    <QueryState query={me}>
      {(data) => {
        if (!data) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
        if (data.user.mustChangePassword && location.pathname !== '/dashboard/account') return <Navigate to="/dashboard/account" replace />;
        return children;
      }}
    </QueryState>
  );
}

/** Screens a coach may not use show a message instead (the server refuses their writes anyway). */
export function RequireScreen({ screen, children }) {
  const me = useMe();
  if (me.data.permissions.screens.includes(screen)) return children;
  return (
    <>
      <PageHeader title="You don't have access to this page" subtitle="Ask the Director of Sport if you need it." />
      <Button to="/dashboard" variant="navy">
        Back to the dashboard
      </Button>
    </>
  );
}
