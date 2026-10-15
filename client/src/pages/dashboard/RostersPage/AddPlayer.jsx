import { useState } from 'react';
import { Button } from '../../../components/Button/Button.jsx';
import { Dialog } from '../../../components/Dialog/Dialog.jsx';
import { TextInput } from '../../../components/TextInput/TextInput.jsx';
import { useList, useResource } from '../../../hooks/resources.js';
import { fullName } from '../../../lib/people.js';
import { PlayerForm } from '../PlayersPage/PlayerForm.jsx';
import styles from './RostersPage.module.css';

/** Search existing players to add to the squad, or create a new one. Rendered outside the squad form. */
export function AddPlayer({ exclude, onAdd }) {
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const term = search.trim();
  const results = useList('/players', { search: term }, { enabled: term.length >= 2 });
  const players = useResource('/players');
  const found = term.length >= 2 ? (results.data ?? []).filter((p) => !exclude.includes(p.id)).slice(0, 8) : [];
  const add = (player) => {
    onAdd(player);
    setSearch('');
  };

  return (
    <div className={styles.add}>
      <div className={styles.addRow}>
        <TextInput label="Add a player" icon="search" placeholder="Search by first or last name" autoComplete="off" value={search} onChange={(e) => setSearch(e.target.value)} className={styles.search} />
        <Button variant="outline" icon="group_add" onClick={() => setCreating(true)}>
          New player
        </Button>
      </div>
      {term.length >= 2 && (
        <ul className={styles.results} aria-live="polite">
          {found.map((p) => (
            <li key={p.id} className={styles.result}>
              {fullName(p)}
              <Button variant="ghost" size="sm" icon="add" aria-label={`Add ${fullName(p)}`} onClick={() => add(p)}>
                Add
              </Button>
            </li>
          ))}
          {found.length === 0 && results.isFetched && <li className={styles.result}>No one else matches “{term}”.</li>}
        </ul>
      )}
      <Dialog open={creating} onClose={() => setCreating(false)} title="New player">
        <PlayerForm
          compact
          item={null}
          resource={players}
          onCancel={() => setCreating(false)}
          onSaved={(player) => {
            add(player);
            setCreating(false);
          }}
        />
      </Dialog>
    </div>
  );
}
