/** "Mr. John Smith" */
export const staffName = (user) => [user.title, user.name].filter(Boolean).join(' ');

export const STAFF_ROLES = {
  head: { label: 'Head Coach', icon: 'strategy' },
  assistant: { label: 'Assistant Coach', icon: 'sports' },
};

export const fullName = (player) => `${player.firstName} ${player.lastName}`;

export const PLAYER_GENDERS = [
  { value: 'female', label: 'Girl' },
  { value: 'male', label: 'Boy' },
];

/** Position key → name, from the sport's definitions ("FW" → "Forward"). */
export const positionNames = (sport) => Object.fromEntries((sport?.positions ?? []).map((p) => [p.key, p.name]));
