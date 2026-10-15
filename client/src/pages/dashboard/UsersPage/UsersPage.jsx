import { useState } from 'react';
import { Avatar } from '../../../components/Avatar/Avatar.jsx';
import { Badge } from '../../../components/Badge/Badge.jsx';
import { Button } from '../../../components/Button/Button.jsx';
import { Dialog } from '../../../components/Dialog/Dialog.jsx';
import { ResourceScreen } from '../../../components/ResourceScreen/ResourceScreen.jsx';
import { useToast } from '../../../components/Toast/Toast.jsx';
import { useList, useResource } from '../../../hooks/resources.js';
import { staffName } from '../../../lib/people.js';
import { ResetPasswordForm } from './ResetPasswordForm.jsx';
import { UserForm } from './UserForm.jsx';
import styles from './UsersPage.module.css';

const columns = [
  {
    key: 'name',
    header: 'Name',
    isRowHeader: true,
    render: (u) => (
      <span className={styles.person}>
        <Avatar src={u.photoUrl} name={u.name} size="sm" />
        <span>
          {staffName(u)}
          <span className={styles.email}>{u.email}</span>
        </span>
      </span>
    ),
  },
  { key: 'role', header: 'Access', render: (u) => <Badge tone={u.role === 'admin' ? 'navy' : 'neutral'}>{u.role === 'admin' ? 'Admin' : 'Coach'}</Badge> },
  { key: 'status', header: 'Status', render: (u) => (u.active ? <Badge tone="positive">Active</Badge> : <Badge tone="red">Disabled</Badge>) },
  { key: 'teams', header: 'Teams', render: (u) => u.assignments.map((a) => `${a.teamSeason.team.name} (${a.teamSeason.sport.name})`).join(', ') || '—' },
];

/** D9 Users + D10 coach assignments. */
export function UsersPage() {
  const [resetting, setResetting] = useState(null);
  const toast = useToast();
  return (
    <ResourceScreen
      title="Users"
      subtitle="Staff who can sign in. Coaches only see and edit the teams they're assigned to."
      noun="user"
      nameOf={(u) => u.name}
      query={useList('/users')}
      resource={useResource('/users')}
      columns={columns}
      Form={UserForm}
      canDelete={() => false}
      rowActions={(u) => <Button variant="ghost" size="sm" icon="key" title="Reset password" aria-label={`Reset password for ${u.name}`} onClick={() => setResetting(u)} />}
    >
      <Dialog open={Boolean(resetting)} onClose={() => setResetting(null)} title={resetting ? `Reset password · ${resetting.name}` : ''}>
        {resetting && (
          <ResetPasswordForm
            user={resetting}
            onCancel={() => setResetting(null)}
            onDone={() => {
              toast(`Temporary password set for ${resetting.name}`);
              setResetting(null);
            }}
          />
        )}
      </Dialog>
    </ResourceScreen>
  );
}
