/**
 * Maps an API validation error onto form fields: details with paths like /body/name or
 * /body/home/score become field errors; anything else becomes the form's summary message.
 */
export function applyServerErrors(error, setError) {
  const unplaced = [];
  for (const detail of error?.details ?? []) {
    const field = detail.path?.startsWith('/body/') ? detail.path.slice('/body/'.length).replaceAll('/', '.') : null;
    if (field) setError(field, { type: 'server', message: detail.message });
    else unplaced.push(detail.message);
  }
  setError('root.server', { type: 'server', message: [error?.message, ...unplaced].filter(Boolean).join(' — ') || 'Something went wrong' });
}
