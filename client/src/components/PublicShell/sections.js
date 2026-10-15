/** The public top-bar sections for a sport (docs/01-architecture.md §5.1). */
export const sectionsFor = (sport) => [
  { to: `/${sport}`, label: 'Overview', end: true },
  { to: `/${sport}/schedule`, label: 'Schedule' },
  { to: `/${sport}/players`, label: 'Players' },
  { to: `/${sport}/stats`, label: 'Stats' },
  { to: `/${sport}/league-table`, label: 'League Table' },
  { to: `/hall-of-fame?sport=${sport}`, label: 'Hall of Fame' },
];
