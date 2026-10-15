import { useState } from 'react';
import { Button } from '../Button/Button.jsx';
import { Card } from '../Card/Card.jsx';
import { DataTable } from '../DataTable/DataTable.jsx';
import { ConfirmDialog } from '../Dialog/ConfirmDialog.jsx';
import { Dialog } from '../Dialog/Dialog.jsx';
import { PageHeader } from '../PageHeader/PageHeader.jsx';
import { QueryState } from '../QueryState/QueryState.jsx';
import { useToast } from '../Toast/Toast.jsx';
import styles from './ResourceScreen.module.css';

/**
 * A dashboard list screen (docs/04 "ResourceScreen"): header with Add, filters, table with Edit / Delete,
 * the add/edit `Form` in a dialog ({ item, resource, onSaved, onCancel }; item null = new) and a confirmed delete.
 * With `editTo(row)` Edit links to a page instead (sports have their own editor).
 */
export function ResourceScreen({ title, subtitle, noun, nameOf, filters, query, columns, resource, Form, formProps, canDelete = () => true, editTo, children }) {
  const [editing, setEditing] = useState(null); // null = closed, {} = new, a row = editing it
  const [deleting, setDeleting] = useState(null);
  const toast = useToast();
  const close = () => setEditing(null);
  const isNew = editing && !editing.id;

  const remove = async () => {
    try {
      await resource.remove.mutateAsync(deleting.id);
      toast(`Deleted ${nameOf(deleting)}`);
    } catch (error) {
      toast(error.message, 'error');
    }
    setDeleting(null);
  };
  const actions = {
    key: 'actions',
    header: <span className="visually-hidden">Actions</span>,
    align: 'end',
    render: (row) => (
      <div className={styles.rowActions}>
        <Button variant="ghost" size="sm" icon="edit" title="Edit" aria-label={`Edit ${nameOf(row)}`} {...(editTo ? { to: editTo(row) } : { onClick: () => setEditing(row) })} />
        {canDelete(row) && <Button variant="ghost" size="sm" icon="delete" title="Delete" aria-label={`Delete ${nameOf(row)}`} onClick={() => setDeleting(row)} />}
      </div>
    ),
  };

  return (
    <>
      <title>{`${title} · Sports IQ`}</title>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          <Button variant="navy" icon="add" onClick={() => setEditing({})}>
            Add {noun}
          </Button>
        }
      />
      {filters && <div className={styles.filters}>{filters}</div>}
      <Card className={styles.table}>
        <QueryState query={query}>{(rows) => <DataTable columns={[...columns, actions]} rows={rows} rowKey={(row) => row.id} caption={title} empty={`No ${noun}s yet.`} />}</QueryState>
      </Card>
      {children}
      <Dialog open={Boolean(editing)} onClose={close} title={editing?.id ? `Edit ${nameOf(editing)}` : `Add ${noun}`}>
        <Form
          item={isNew ? null : editing}
          resource={resource}
          onCancel={close}
          onSaved={(saved) => {
            toast(`Saved ${nameOf(saved)}`);
            close();
          }}
          {...formProps}
        />
      </Dialog>
      <ConfirmDialog
        open={Boolean(deleting)}
        title={`Delete ${noun}?`}
        message={deleting && `${nameOf(deleting)} will be removed. This can't be undone.`}
        busy={resource.remove.isPending}
        onConfirm={remove}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
