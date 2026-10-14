import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { PublicShell } from './components/PublicShell/PublicShell.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';
import { RouteError } from './pages/RouteError.jsx';
import { HomeRedirect } from './pages/public/HomeRedirect.jsx';
import { LeagueTablePage } from './pages/public/LeagueTablePage/LeagueTablePage.jsx';
import { MatchPage } from './pages/public/MatchPage/MatchPage.jsx';
import { OverviewPage } from './pages/public/OverviewPage/OverviewPage.jsx';
import { RosterPage } from './pages/public/RosterPage/RosterPage.jsx';
import { SchedulePage } from './pages/public/SchedulePage/SchedulePage.jsx';
import { SeasonStatsPage } from './pages/public/SeasonStatsPage/SeasonStatsPage.jsx';

// Route map: docs/01-architecture.md §5.1–5.2.
const router = createBrowserRouter([
  {
    element: <PublicShell />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <HomeRedirect /> },
      {
        path: ':sport',
        children: [
          { index: true, element: <OverviewPage /> },
          { path: 'schedule', element: <SchedulePage /> },
          { path: 'schedule/:matchId', element: <MatchPage /> },
          { path: 'players', element: <RosterPage /> },
          { path: 'stats', element: <SeasonStatsPage /> },
          { path: 'league-table', element: <LeagueTablePage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
