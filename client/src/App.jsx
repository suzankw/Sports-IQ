import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { DashboardShell } from './components/DashboardShell/DashboardShell.jsx';
import { PublicShell } from './components/PublicShell/PublicShell.jsx';
import { RequireAuth, RequireScreen } from './components/RequireAuth/RequireAuth.jsx';
import { AccountPage } from './pages/dashboard/AccountPage/AccountPage.jsx';
import { CompetitionsPage } from './pages/dashboard/CompetitionsPage/CompetitionsPage.jsx';
import { FixturesPage } from './pages/dashboard/FixturesPage/FixturesPage.jsx';
import { HomePage } from './pages/dashboard/HomePage/HomePage.jsx';
import { InducteesPage } from './pages/dashboard/InducteesPage/InducteesPage.jsx';
import { LeagueResultsPage } from './pages/dashboard/LeagueResultsPage/LeagueResultsPage.jsx';
import { PlayersPage } from './pages/dashboard/PlayersPage/PlayersPage.jsx';
import { ResultPage } from './pages/dashboard/ResultPage/ResultPage.jsx';
import { RostersPage } from './pages/dashboard/RostersPage/RostersPage.jsx';
import { SchoolsPage } from './pages/dashboard/SchoolsPage/SchoolsPage.jsx';
import { SeasonsPage } from './pages/dashboard/SeasonsPage/SeasonsPage.jsx';
import { SportEditorPage } from './pages/dashboard/SportEditorPage/SportEditorPage.jsx';
import { SportsPage } from './pages/dashboard/SportsPage/SportsPage.jsx';
import { TeamsPage } from './pages/dashboard/TeamsPage/TeamsPage.jsx';
import { UsersPage } from './pages/dashboard/UsersPage/UsersPage.jsx';
import { LoginPage } from './pages/LoginPage/LoginPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';
import { HallOfFamePage } from './pages/public/HallOfFamePage/HallOfFamePage.jsx';
import { HomeRedirect } from './pages/public/HomeRedirect.jsx';
import { LeagueTablePage } from './pages/public/LeagueTablePage/LeagueTablePage.jsx';
import { MatchPage } from './pages/public/MatchPage/MatchPage.jsx';
import { OverviewPage } from './pages/public/OverviewPage/OverviewPage.jsx';
import { RosterPage } from './pages/public/RosterPage/RosterPage.jsx';
import { SchedulePage } from './pages/public/SchedulePage/SchedulePage.jsx';
import { SeasonStatsPage } from './pages/public/SeasonStatsPage/SeasonStatsPage.jsx';
import { RouteError } from './pages/RouteError.jsx';

// Route map: docs/01-architecture.md §5.1–5.2.
// A dashboard screen only renders for users whose /auth/me lists it (the server enforces writes anyway).
const screen = (path, name, page) => ({ path, element: <RequireScreen screen={name}>{page}</RequireScreen> });

const router = createBrowserRouter([
  { path: 'login', element: <LoginPage />, errorElement: <RouteError /> },
  {
    path: 'dashboard',
    element: (
      <RequireAuth>
        <DashboardShell />
      </RequireAuth>
    ),
    errorElement: <RouteError />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'account', element: <AccountPage /> },
      screen('fixtures', 'fixtures', <FixturesPage />),
      screen('fixtures/:id/result', 'fixtures', <ResultPage />),
      screen('rosters', 'rosters', <RostersPage />),
      screen('players', 'players', <PlayersPage />),
      screen('sports', 'sports', <SportsPage />),
      screen('sports/:sport', 'sports', <SportEditorPage />),
      screen('seasons', 'seasons', <SeasonsPage />),
      screen('teams', 'teams', <TeamsPage />),
      screen('competitions', 'competitions', <CompetitionsPage />),
      screen('schools', 'schools', <SchoolsPage />),
      screen('users', 'users', <UsersPage />),
      screen('league-results', 'leagueResults', <LeagueResultsPage />),
      screen('hall-of-fame', 'hallOfFame', <InducteesPage />),
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    element: <PublicShell />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <HomeRedirect /> },
      { path: 'hall-of-fame', element: <HallOfFamePage /> },
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
