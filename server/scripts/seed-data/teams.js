// The demo's teams, opponents and competitions (docs/02-database.md §8).

/** Strength drives realistic scores; `league` schools make up each 6-team league with Turi. */
export const OPPONENTS = [
  { key: 'peponi', name: 'Peponi School', shortName: 'Peponi', strength: 1.4, league: true },
  { key: 'brookhouse', name: 'Brookhouse School', shortName: 'Brookhouse', strength: 1.1, league: true },
  { key: 'braeburn', name: 'Braeburn School', shortName: 'Braeburn', strength: 0.9, league: true },
  { key: 'rva', name: 'Rift Valley Academy', shortName: 'RVA', strength: 0.7, league: true },
  { key: 'hillcrest', name: 'Hillcrest International School', shortName: 'Hillcrest', strength: 0.5, league: true },
  { key: 'kenton', name: 'Kenton College', shortName: 'Kenton', strength: 0.8 },
  { key: 'bge', name: 'Braeburn Garden Estate', shortName: 'Braeburn GE', strength: 0.6 },
];

export const CUPS = {
  friendly: { name: 'Friendlies', shortName: 'Friendly', type: 'friendly' },
  cup: { name: 'IAPS Cup', shortName: 'IAPS', type: 'cup' },
  regional: { name: 'Rift Valley Regionals', shortName: 'Regionals', type: 'cup' },
};

export const VENUES = { football: 'Turi Main Pitch', basketball: 'Turi Sports Hall', netball: 'Turi Netball Courts' };

/** Squad positions in the order they're filled, so any squad size gets a sensible balance. */
export const POSITION_PLANS = {
  football: ['GK', 'DF', 'DF', 'DF', 'DF', 'MF', 'MF', 'MF', 'FW', 'FW', 'FW', 'GK', 'DF', 'DF', 'MF', 'MF', 'FW', 'FW'],
  basketball: ['PG', 'SG', 'SF', 'PF', 'C', 'PG', 'SG', 'SF', 'PF', 'C', 'SG', 'SF', 'PG', 'PF', 'C', 'SG', 'SF'],
  netball: ['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK', 'GS', 'GA', 'C', 'WD', 'GD'],
};

const league = (name, shortName = 'KAISSO') => ({ name, shortName, type: 'league' });

export const TEAMS = [
  { sport: 'football', slug: 'first-xi', name: 'First XI', ageGroup: 'Open', gender: 'boys', order: 1, size: 18, hour: 15, strength: 1.9, league: league('KISL Premier Division', 'KISL'), staff: [['footballHead', 'head'], ['footballAssistant', 'assistant']] },
  { sport: 'football', slug: 'second-xi', name: 'Second XI', ageGroup: 'Open', gender: 'boys', order: 2, size: 18, hour: 13, strength: 1.4, league: league('KAISSO Second XI League'), staff: [['footballHead', 'head']] },
  { sport: 'football', slug: 'u16', name: 'U16', ageGroup: 'U16', gender: 'mixed', order: 3, size: 18, hour: 11, strength: 1.5, league: league('KAISSO U16 League'), staff: [['footballAssistant', 'head']] },
  { sport: 'football', slug: 'u15-girls', name: 'U15 Girls', ageGroup: 'U15', gender: 'girls', order: 4, size: 16, hour: 10, strength: 1.3, league: league('KAISSO U15 Girls League'), staff: [['footballAssistant', 'head']] },
  { sport: 'basketball', slug: 'girls-first-v', name: 'Girls First V', ageGroup: 'Open', gender: 'girls', order: 1, size: 17, photos: 'basketball', hour: 14, strength: 1.3, league: league('KAISSO Girls Basketball League'), staff: [['basketballHead', 'head'], ['basketballAssistant', 'assistant']] },
  { sport: 'basketball', slug: 'boys-first-v', name: 'Boys First V', ageGroup: 'Open', gender: 'boys', order: 2, size: 12, hour: 16, strength: 1.0, league: league('KAISSO Boys Basketball League'), staff: [['basketballHead', 'head']] },
  { sport: 'netball', slug: 'first-vii', name: 'First VII', ageGroup: 'Open', gender: 'girls', order: 1, size: 12, photos: 'netball', hour: 12, strength: 1.3, league: league('KAISSO Netball League'), staff: [['netballHead', 'head']] },
  { sport: 'netball', slug: 'u15-vii', name: 'U15 VII', ageGroup: 'U15', gender: 'girls', order: 2, size: 10, hour: 10, strength: 1.0, league: league('KAISSO U15 Netball League'), staff: [['netballHead', 'head']] },
];
