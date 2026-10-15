import { Button } from '../../../components/Button/Button.jsx';
import { SaveBar } from '../../../components/SaveBar/SaveBar.jsx';
import styles from './ResultPage.module.css';

/** Sticky footer: the server's problems as sentences, Reload after a conflict, then Save draft / Publish. */
export function ResultSaveBar({ problems, conflict, reload, published, busy, onSave }) {
  return (
    <SaveBar
      error={
        problems.length > 0 && (
          <>
            <ul className={styles.problems}>
              {problems.map((p, i) => (
                <li key={i}>{p.text}</li>
              ))}
            </ul>
            {conflict && (
              <Button variant="outline" size="sm" onClick={reload}>
                Reload
              </Button>
            )}
          </>
        )
      }
    >
      <Button variant="outline" disabled={busy} onClick={onSave(false)}>
        {published ? 'Unpublish' : 'Save draft'}
      </Button>
      <Button variant="navy" icon="publish" disabled={busy} onClick={onSave(true)}>
        {published ? 'Save' : 'Publish'}
      </Button>
    </SaveBar>
  );
}
