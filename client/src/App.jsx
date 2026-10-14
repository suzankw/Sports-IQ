import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { PublicShell } from './components/PublicShell/PublicShell.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';
import { HomeRedirect } from './pages/public/HomeRedirect.jsx';
import { MatchPage } from './pages/public/MatchPage/MatchPage.jsx';
import { OverviewPage } from './pages/public/OverviewPage/OverviewPage.jsx';

// Route map: docs/01-architecture.md §5.1–5.2.
const router = createBrowserRouter([
  {
    element: <PublicShell />,
    children: [
      { index: true, element: <HomeRedirect /> },
      {
        path: ':sport',
        children: [
          { index: true, element: <OverviewPage /> },
          { path: 'schedule/:matchId', element: <MatchPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
