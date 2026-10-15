/**
 * Maps an API validation error onto form fields: details with paths like /body/name or
 * /body/home/score become field errors (the first gets focus); anything else joins the form's summary message.
 */
export function applyServerErrors(error, setError) {
  const unplaced = [];
  let placed = 0;
  for (const detail of error?.details ?? []) {
    const field = detail.path?.startsWith('/body/') ? detail.path.slice('/body/'.length).replaceAll('/', '.') : null;
    if (field) setError(field, { type: 'server', message: detail.message }, { shouldFocus: (placed += 1) === 1 });
    else unplaced.push(detail.message);
  }
  const summary = error?.code === 'VALIDATION_ERROR' && placed ? 'Some details need fixing — see the highlighted fields.' : error?.message;
  setError('root.server', { type: 'server', message: [summary, ...unplaced].filter(Boolean).join(' ') || 'Something went wrong' });
}

const firstMessage = (node) => {
  if (!node || typeof node !== 'object') return undefined;
  if (typeof node.message === 'string') return node.message;
  for (const [key, child] of Object.entries(node)) {
    const message = key === 'ref' ? undefined : firstMessage(child);
    if (message) return message;
  }
  return undefined;
};

/** The error at a dotted path, or the first one beneath it (the server may flag `stats/1` of a comma list). */
export const errorAt = (errors, path) => firstMessage(path.split('.').reduce((node, key) => node?.[key], errors));

/** register() plus the field's error message — spread onto TextInput / Select. */
export const bind = (form, path, rules) => ({ ...form.register(path, rules), error: errorAt(form.formState.errors, path) });

/** "a, b" ⇄ ['a', 'b'] for short key lists edited as text. */
export const toCsv = (list = []) => list.join(', ');
export const fromCsv = (text = '') =>
  text
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
