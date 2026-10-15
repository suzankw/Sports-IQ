// Dashboard menu (docs/04-dashboard-wireframes.md). Items show only if /auth/me lists their screen.
const ITEMS = [
  { screen: 'home', to: '/dashboard', label: 'Home', icon: 'dashboard', end: true },
  { screen: 'fixtures', to: '/dashboard/fixtures', label: 'Fixtures & results', icon: 'event' },
  { screen: 'rosters', to: '/dashboard/rosters', label: 'Rosters', icon: 'groups' },
  { screen: 'players', to: '/dashboard/players', label: 'Players', icon: 'person' },
  { heading: 'Admin' },
  { screen: 'sports', to: '/dashboard/sports', label: 'Sports', icon: 'sports' },
  { screen: 'seasons', to: '/dashboard/seasons', label: 'Seasons', icon: 'calendar_month' },
  { screen: 'teams', to: '/dashboard/teams', label: 'Teams', icon: 'shield' },
  { screen: 'competitions', to: '/dashboard/competitions', label: 'Competitions', icon: 'emoji_events' },
  { screen: 'schools', to: '/dashboard/schools', label: 'Schools', icon: 'school' },
  { screen: 'users', to: '/dashboard/users', label: 'Users', icon: 'manage_accounts' },
  { screen: 'leagueResults', to: '/dashboard/league-results', label: 'Other league results', icon: 'table_chart' },
  { screen: 'hallOfFame', to: '/dashboard/hall-of-fame', label: 'Hall of Fame', icon: 'workspace_premium' },
];

/** The menu for these screens; a heading only appears if something follows it. */
export function menuFor(screens) {
  const allowed = ITEMS.filter((item) => item.heading || screens.includes(item.screen));
  return allowed.filter((item, i) => !item.heading || (allowed[i + 1] && !allowed[i + 1].heading));
}
