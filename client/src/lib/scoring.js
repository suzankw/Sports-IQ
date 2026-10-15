/** A sport's scoring words: goals in football and netball, points in basketball. */
export const scoreUnit = (sport) =>
  sport?.scoringStat === 'points'
    ? { for: 'PF', against: 'PA', word: 'Points', difference: 'Points difference' }
    : { for: 'GF', against: 'GA', word: 'Goals', difference: 'Goal difference' };
