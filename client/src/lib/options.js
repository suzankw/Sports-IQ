/** API list → <Select> options (by id, labelled by name unless told otherwise). */
export const optionsOf = (items = [], labelOf = (item) => item.name) => items.map((item) => ({ value: item.id, label: labelOf(item) }));
