// Reference data: the sport definitions (docs/02-database.md §2.1). Seeded in every environment, also used by tests.

const stat = (key, label, abbr, { type = 'count', source = 'manual', aggregation = 'sum', icon = null, ratio = null } = {}) => ({
  key, label, abbr, icon, type, source, aggregation, ratio,
});
const ratio = (key, label, abbr, numerator, denominator) =>
  stat(key, label, abbr, { type: 'ratio', ratio: { numerator, denominator } });
const percent = (key, label, abbr, icon) => stat(key, label, abbr, { type: 'percent', aggregation: 'avg', icon });
const board = (key, label, icon, group, stats) => ({ key, label, icon, group, stats });
const slot = (key, position, x, y) => ({ key, position, x, y });
const back4 = [slot('GK', 'GK', 50, 8), slot('LB', 'DF', 18, 26), slot('LCB', 'DF', 39, 21), slot('RCB', 'DF', 61, 21), slot('RB', 'DF', 82, 26)];

const pathways = (foundations, intermediate, elite) => [
  { title: 'Foundations', text: foundations, url: null },
  { title: 'Intermediate', text: intermediate, url: null },
  { title: 'Elite Performance', text: elite, url: null },
];

const altitudeHero = (title, surface) => ({
  eyebrow: 'High Altitude Advantage',
  title,
  text: `At 8,200ft above sea level, our training grounds give Turi athletes a natural edge. Training at altitude builds cardiovascular endurance and explosive agility — exactly what elite ${surface} performance demands.`,
  imageUrl: null,
});

export const football = {
  slug: 'football', name: 'Football', icon: 'sports_soccer', order: 1, status: 'active',
  periods: { count: 2, minutes: 45 }, scoreDetail: 'events', scoringStat: 'goals',
  standingsPoints: { win: 3, draw: 1, loss: 0 },
  positions: [
    { key: 'GK', name: 'Goalkeeper', headlineStats: ['saves', 'goalsConceded'] },
    { key: 'DF', name: 'Defender', headlineStats: ['tackles', 'clearances'] },
    { key: 'MF', name: 'Midfielder', headlineStats: ['assists', 'shots'] },
    { key: 'FW', name: 'Forward', headlineStats: ['goals', 'shots'] },
  ],
  formations: [
    { key: '4-3-3', name: '4-3-3 Attacking', slots: [...back4, slot('DM', 'MF', 50, 44), slot('LCM', 'MF', 30, 55), slot('RCM', 'MF', 70, 55), slot('LW', 'FW', 22, 75), slot('ST', 'FW', 50, 82), slot('RW', 'FW', 78, 75)] },
    { key: '4-4-2', name: '4-4-2 Classic', slots: [...back4, slot('LM', 'MF', 16, 52), slot('LCM', 'MF', 39, 48), slot('RCM', 'MF', 61, 48), slot('RM', 'MF', 84, 52), slot('LST', 'FW', 38, 79), slot('RST', 'FW', 62, 79)] },
    { key: '4-2-3-1', name: '4-2-3-1', slots: [...back4, slot('LDM', 'MF', 38, 42), slot('RDM', 'MF', 62, 42), slot('LAM', 'MF', 22, 63), slot('CAM', 'MF', 50, 62), slot('RAM', 'MF', 78, 63), slot('ST', 'FW', 50, 83)] },
  ],
  teamStats: [
    percent('possession', 'Possession', 'Poss', 'sports_soccer'),
    stat('shots', 'Total Shots', 'Sh', { icon: 'sports_soccer' }),
    stat('shotsOnTarget', 'Shots on Target', 'SOT', { icon: 'adjust' }),
    stat('corners', 'Corners', 'Cor', { icon: 'flag_circle' }),
    stat('fouls', 'Fouls', 'Fls', { icon: 'sports' }),
    stat('yellowCards', 'Yellow Cards', 'YC', { icon: 'style', source: 'events' }),
    stat('redCards', 'Red Cards', 'RC', { icon: 'style', source: 'events' }),
    stat('offsides', 'Offsides', 'Off', { icon: 'flag' }),
    stat('saves', 'Saves', 'Sv', { icon: 'front_hand' }),
  ],
  playerStats: [
    stat('minutes', 'Minutes', 'Min', { type: 'minutes' }),
    stat('goals', 'Goals', 'G', { source: 'events' }),
    stat('assists', 'Assists', 'A', { source: 'events' }),
    stat('shots', 'Shots', 'Sh'),
    stat('shotsOnTarget', 'Shots on Target', 'SOT'),
    stat('tackles', 'Tackles', 'Tkl'),
    stat('clearances', 'Clearances', 'Clr'),
    stat('saves', 'Saves', 'Sv'),
    stat('goalsConceded', 'Goals Conceded', 'GC'),
    stat('yellowCards', 'Yellow Cards', 'YC', { source: 'events' }),
    stat('redCards', 'Red Cards', 'RC', { source: 'events' }),
  ],
  leaderboards: [
    board('scorers', 'Top Scorers', 'sports_soccer', 'attack', ['goals']),
    board('playmakers', 'Playmakers (Assists)', 'handshake', 'attack', ['assists']),
    board('defense', 'Defensive Pillars', 'shield', 'defense', ['tackles', 'clearances', 'saves']),
    board('yellowCards', 'Yellow Cards', 'warning', 'discipline', ['yellowCards']),
    board('redCards', 'Red Cards', 'dangerous', 'discipline', ['redCards']),
  ],
  kpis: { cleanSheets: true, teamStat: 'possession' },
  content: {
    hero: altitudeHero('Football IQ', 'pitch'),
    history: {
      text: "Modern football grew out of traditional folk games in 19th-century Britain. The Football Association wrote the first standard rules in 1863, and the game became the world's most popular sport.",
      imageUrl: null,
    },
    facts: [
      { icon: 'groups', label: 'Players', text: '11 players per side on the pitch' },
      { icon: 'rule', label: 'Rules', text: 'The offside rule prevents goal-hanging; throw-ins restart play from the touchline.' },
      { icon: 'sports_soccer', label: 'Scoring', text: 'A goal is scored when the whole ball crosses the goal line.' },
      { icon: 'directions_run', label: 'Positions', text: 'Goalkeeper, defenders, midfielders and forwards.' },
      { icon: 'timer', label: 'Duration', text: '90 minutes of playing time' },
      { icon: 'grid_view', label: 'Structure', text: 'Two halves of 45 minutes each' },
    ],
    approach: {
      strategic: 'We teach football as a game of decisions. Players learn to read space, press as a unit and execute set pieces with precision, mirroring the academic rigour of the classroom.',
      character: 'The pitch is where leadership is tested. Ninety minutes demands constant communication, trust in teammates and the resilience to respond to setbacks.',
    },
    benefits: [
      { icon: 'groups', title: 'Teamwork', text: 'Teaches patience, especially when a teammate decides to dribble past the entire opposition instead of passing.' },
      { icon: 'bolt', title: 'Endurance', text: 'Develops cardiovascular fitness through the ancient art of chasing a ball someone else kicked away.' },
      { icon: 'fitness_center', title: 'Resilience', text: 'Every striker learns that the goal is somehow smaller than it looked in training.' },
      { icon: 'architecture', title: 'Memory', text: 'Coaches only need to explain the same formation 27 times before everyone understands it.' },
      { icon: 'campaign', title: 'Humility', text: 'Even the best players occasionally miss an open goal.' },
      { icon: 'psychology', title: 'Mental Toughness', text: 'Referees rarely seem to see the fouls committed against your team.' },
    ],
    videos: [],
    pathways: pathways(
      'Core ball control, basic passing and the fundamental defensive stance.',
      'Tactical formations, off-the-ball movement and counter-attacking.',
      'High-intensity match analysis, set-piece mastery and performance tracking.',
    ),
  },
};

export const basketball = {
  slug: 'basketball', name: 'Basketball', icon: 'sports_basketball', order: 2, status: 'active',
  periods: { count: 4, minutes: 10 }, scoreDetail: 'periods', scoringStat: 'points',
  standingsPoints: { win: 2, draw: 0, loss: 1 },
  positions: [
    { key: 'PG', name: 'Point Guard', headlineStats: ['points', 'assists'] },
    { key: 'SG', name: 'Shooting Guard', headlineStats: ['points', 'threePointersMade'] },
    { key: 'SF', name: 'Small Forward', headlineStats: ['points', 'rebounds'] },
    { key: 'PF', name: 'Power Forward', headlineStats: ['rebounds', 'points'] },
    { key: 'C', name: 'Center', headlineStats: ['rebounds', 'blocks'] },
  ],
  formations: [
    { key: 'starting-five', name: 'Starting Five', slots: [slot('PG', 'PG', 50, 20), slot('SG', 'SG', 80, 38), slot('SF', 'SF', 20, 38), slot('PF', 'PF', 32, 70), slot('C', 'C', 64, 76)] },
  ],
  teamStats: [
    stat('rebounds', 'Rebounds', 'Reb', { icon: 'sports_basketball' }),
    stat('turnovers', 'Turnovers', 'TO', { icon: 'swap_horiz' }),
    stat('fouls', 'Fouls', 'Fls', { icon: 'sports' }),
    stat('steals', 'Steals', 'Stl', { icon: 'front_hand' }),
    stat('threePointers', '3-Pointers', '3PT', { icon: 'sports_score' }),
    stat('layups', 'Layups', 'Lay', { icon: 'sports_basketball' }),
    percent('freeThrowPct', 'Free Throw %', 'FT%', 'adjust'),
    stat('assists', 'Assists', 'Ast', { icon: 'handshake' }),
  ],
  playerStats: [
    stat('minutes', 'Minutes', 'Min', { type: 'minutes' }),
    stat('points', 'Points', 'PTS'),
    stat('rebounds', 'Rebounds', 'REB'),
    stat('assists', 'Assists', 'AST'),
    stat('steals', 'Steals', 'STL'),
    stat('blocks', 'Blocks', 'BLK'),
    stat('turnovers', 'Turnovers', 'TO'),
    stat('fouls', 'Fouls', 'PF'),
    stat('threePointersMade', '3-Pointers Made', '3PM'),
    stat('freeThrowsMade', 'Free Throws Made', 'FTM'),
    stat('freeThrowsAttempted', 'Free Throws Attempted', 'FTA'),
    ratio('freeThrowPct', 'Free Throw %', 'FT%', 'freeThrowsMade', 'freeThrowsAttempted'),
  ],
  leaderboards: [
    board('scorers', 'Top Scorers', 'sports_basketball', 'attack', ['points']),
    board('playmakers', 'Playmakers (Assists)', 'handshake', 'attack', ['assists']),
    board('defense', 'Defensive Pillars', 'shield', 'defense', ['rebounds', 'steals', 'blocks']),
    board('fouls', 'Fouls', 'gavel', 'discipline', ['fouls']),
  ],
  kpis: { cleanSheets: false, teamStat: 'rebounds' },
  content: {
    hero: altitudeHero('Basketball IQ', 'court'),
    history: { text: 'Invented in 1891 by Dr. James Naismith as a safer indoor activity for the harsh winters of Springfield, Massachusetts.', imageUrl: null },
    facts: [
      { icon: 'groups', label: 'Players', text: '5 players per side on the court' },
      { icon: 'rule', label: 'Rules', text: 'A 24-second shot clock keeps the game moving.' },
      { icon: 'scoreboard', label: 'Scoring', text: '1 point for a free throw, 2 for a field goal and 3 from beyond the arc.' },
      { icon: 'accessibility_new', label: 'Positions', text: 'Guards, forwards and centers.' },
      { icon: 'timer', label: 'Game Duration', text: '40 minutes of playing time' },
      { icon: 'grid_view', label: 'Match Structure', text: 'Four quarters of 10 minutes each' },
      { icon: 'coffee', label: 'Breaks', text: 'Short breaks between quarters and a longer half-time interval' },
    ],
    approach: {
      strategic: 'We teach basketball as a physical chess match. Players learn to read defences, anticipate movement and run set plays with clinical precision.',
      character: 'The court is a crucible for leadership. The pace of the game demands instant communication, trust in teammates and the composure to overcome adversity.',
    },
    benefits: [
      { icon: 'groups', title: 'Teamwork', text: 'Five people arguing with one referee is more effective than one person arguing alone.' },
      { icon: 'bolt', title: 'Decision-Making', text: 'Develops quick decisions such as "shoot, pass, or panic?"' },
      { icon: 'fitness_center', title: 'Endurance', text: 'Survive both full-court presses and long school assemblies.' },
      { icon: 'architecture', title: 'Physics', text: 'Appreciate physics when your shot hits every part of the rim except the net.' },
      { icon: 'campaign', title: 'Leadership', text: 'Somebody has to organise the fast break after everyone else forgets the play.' },
      { icon: 'checkroom', title: 'Fashion', text: 'Every player eventually believes their trainers add +10 skill points.' },
    ],
    videos: [],
    pathways: pathways(
      'Core dribbling mechanics, passing drills and defensive stance.',
      'Pick-and-roll execution, off-ball movement and transition offence.',
      'Complex defensive schemes, late-game management and performance analytics.',
    ),
  },
};

export const netball = {
  slug: 'netball', name: 'Netball', icon: 'sports_volleyball', order: 3, status: 'active',
  periods: { count: 4, minutes: 15 }, scoreDetail: 'periods', scoringStat: 'goals',
  standingsPoints: { win: 2, draw: 1, loss: 0 },
  positions: [
    { key: 'GS', name: 'Goal Shooter', headlineStats: ['goals', 'attempts'] },
    { key: 'GA', name: 'Goal Attack', headlineStats: ['goals', 'attempts'] },
    { key: 'WA', name: 'Wing Attack', headlineStats: ['deflections', 'intercepts'] },
    { key: 'C', name: 'Centre', headlineStats: ['intercepts', 'deflections'] },
    { key: 'WD', name: 'Wing Defence', headlineStats: ['intercepts', 'deflections'] },
    { key: 'GD', name: 'Goal Defence', headlineStats: ['intercepts', 'rebounds'] },
    { key: 'GK', name: 'Goal Keeper', headlineStats: ['rebounds', 'intercepts'] },
  ],
  formations: [
    { key: 'starting-seven', name: 'Starting Seven', slots: [slot('GK', 'GK', 50, 8), slot('GD', 'GD', 30, 24), slot('WD', 'WD', 70, 30), slot('C', 'C', 50, 50), slot('WA', 'WA', 30, 70), slot('GA', 'GA', 70, 76), slot('GS', 'GS', 50, 92)] },
  ],
  teamStats: [
    percent('shootingPct', 'Shooting %', 'Sh%', 'adjust'),
    percent('centrePassConversion', 'Centre Pass Conversion', 'CPC', 'sports_volleyball'),
    stat('rebounds', 'Rebounds', 'Reb', { icon: 'sports_volleyball' }),
    stat('turnoversWon', 'Turnovers Won', 'TW', { icon: 'swap_horiz' }),
    stat('shots', 'Total Shots', 'Sh', { icon: 'sports_score' }),
    stat('contactPenalties', 'Contact Penalties', 'CP', { icon: 'front_hand' }),
    stat('obstructionPenalties', 'Obstruction Penalties', 'OP', { icon: 'flag' }),
  ],
  playerStats: [
    stat('goals', 'Goals', 'G'),
    stat('attempts', 'Attempts', 'Att'),
    ratio('shootingPct', 'Shooting %', 'Sh%', 'goals', 'attempts'),
    stat('intercepts', 'Intercepts', 'Int'),
    stat('deflections', 'Deflections', 'Def'),
    stat('rebounds', 'Rebounds', 'Reb'),
    stat('turnovers', 'Turnovers', 'TO'),
    stat('penalties', 'Penalties', 'Pen'),
  ],
  leaderboards: [
    board('scorers', 'Top Scorers', 'sports_volleyball', 'attack', ['goals']),
    board('defense', 'Defensive Pillars', 'shield', 'defense', ['intercepts', 'deflections', 'rebounds']),
    board('penalties', 'Penalties', 'gavel', 'discipline', ['penalties']),
  ],
  kpis: { cleanSheets: false, teamStat: 'shootingPct' },
  content: {
    hero: altitudeHero('Netball IQ', 'court'),
    history: { text: 'Netball grew out of early basketball in the 1890s and was adapted in England, where Martina Bergman-Österberg introduced it to her physical training college in 1893.', imageUrl: null },
    facts: [
      { icon: 'groups', label: 'Players', text: '7 players per side' },
      { icon: 'rule', label: 'Rules', text: 'No running with the ball; players stay in their zones and have 3 seconds to pass or shoot.' },
      { icon: 'scoreboard', label: 'Scoring', text: 'Only the Goal Shooter and Goal Attack score, from inside the goal circle.' },
      { icon: 'accessibility_new', label: 'Positions', text: 'GS, GA, WA, C, WD, GD, GK' },
      { icon: 'timer', label: 'Game Duration', text: '60 minutes of playing time' },
      { icon: 'grid_view', label: 'Match Structure', text: 'Four quarters of 15 minutes each' },
      { icon: 'coffee', label: 'Breaks', text: '4 minutes between quarters and a 12-minute half-time' },
    ],
    approach: {
      strategic: 'Netball rewards precision. Players learn to create space in tight zones, time their leads and move the ball from centre pass to goal in seconds.',
      character: 'With every player limited to their own zones, trust is everything. The game builds communication, discipline and leadership on every pass.',
    },
    benefits: [
      { icon: 'groups', title: 'Teamwork', text: 'Nobody can do it alone — you literally are not allowed into most of the court.' },
      { icon: 'bolt', title: 'Agility', text: 'Develops the footwork to stop dead mid-sprint, because stepping is a crime.' },
      { icon: 'fitness_center', title: 'Endurance', text: 'Four quarters of sprinting, dodging and jumping with your arms in the air.' },
      { icon: 'psychology', title: 'Patience', text: 'Three seconds to pass feels like a lifetime when the defender is in your face.' },
      { icon: 'campaign', title: 'Communication', text: 'Shouting your position bib letters becomes a second language.' },
      { icon: 'architecture', title: 'Spatial Awareness', text: 'You will never again step on a line without feeling guilty.' },
    ],
    videos: [],
    pathways: pathways(
      'Footwork, catching under pressure and the basic passing range.',
      'Centre-pass set plays, zone defence and attacking leads.',
      'Match analysis, shooting under fatigue and performance tracking.',
    ),
  },
};

const comingSoon = (slug, name, icon, order) => ({ slug, name, icon, order, status: 'comingSoon' });

export const sports = [
  football,
  basketball,
  netball,
  comingSoon('rugby', 'Rugby', 'sports_rugby', 4),
  comingSoon('hockey', 'Hockey', 'sports_hockey', 5),
  comingSoon('cricket', 'Cricket', 'sports_cricket', 6),
];
