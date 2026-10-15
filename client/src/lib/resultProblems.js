// D14: the server's validation details point into the request body (e.g. /body/lineup/3/slot).
// The form isn't shaped like the body, so each problem is turned into a sentence and the section it belongs to.

const SECTIONS = {
  status: 'score',
  score: 'score',
  formation: 'lineup',
  lineup: 'lineup',
  events: 'detail',
  periodScores: 'detail',
  teamStats: 'teamStats',
  playerStats: 'playerStats',
  topPerformers: 'report',
  report: 'report',
  heroPhotoUrl: 'report',
  galleryUrls: 'report',
};

function subject(field, index, rest, body, nameOf) {
  const item = body[field]?.[index];
  if (field === 'lineup') return nameOf(item?.player);
  if (field === 'playerStats') return [nameOf(item?.player), rest[0] === 'stats' && rest[1]].filter(Boolean).join(' · ');
  if (field === 'topPerformers') return nameOf(item);
  if (field === 'events' && item) return `${item.minute}' ${item.type}`;
  if (field === 'teamStats') return `${index === 'turi' ? 'Turi' : 'Opponent'} ${rest[0] ?? ''}`.trim();
  return null;
}

/** ApiError → [{ section, text }]. Non-validation errors (409, 403…) come back as one sentence. */
export function describeProblems(error, body, nameOf) {
  if (!error.details?.length) return [{ section: null, text: error.message }];
  return error.details.map(({ path, message }) => {
    const [field, index, ...rest] = (path ?? '').replace('/body/', '').split('/');
    const who = subject(field, index, rest, body, nameOf);
    return { section: SECTIONS[field] ?? null, text: who ? `${who}: ${message}` : message };
  });
}
