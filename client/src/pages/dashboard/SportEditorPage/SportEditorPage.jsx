import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router';
import { Button } from '../../../components/Button/Button.jsx';
import { PageHeader } from '../../../components/PageHeader/PageHeader.jsx';
import { QueryState } from '../../../components/QueryState/QueryState.jsx';
import { TabPanel, Tabs } from '../../../components/Tabs/Tabs.jsx';
import { useToast } from '../../../components/Toast/Toast.jsx';
import { useSport, useUpdateSport } from '../../../hooks/sports.js';
import { useUrlState } from '../../../hooks/useUrlState.js';
import { applyServerErrors } from '../../../lib/forms.js';
import { fromSportForm, toSportForm } from '../../../lib/sportForm.js';
import { ContentTab } from './ContentTab.jsx';
import { DefinitionTab } from './DefinitionTab.jsx';
import styles from './SportEditorPage.module.css';

function SportEditor({ sport, reload }) {
  const [url, setUrl] = useUrlState({ tab: 'definition' });
  const form = useForm({ defaultValues: toSportForm(sport) });
  const save = useUpdateSport(sport.slug);
  const toast = useToast();
  const [conflict, setConflict] = useState(false);
  const { errors, isSubmitting } = form.formState;
  const flag = (has) => (has ? ' •' : '');
  const tabs = [
    { id: 'definition', label: `Definition${flag(Object.keys(errors).some((k) => k !== 'content' && k !== 'root'))}` },
    { id: 'content', label: `Page content${flag(errors.content)}` },
  ];

  const submit = async (values) => {
    try {
      await save.mutateAsync({ version: sport.version, ...fromSportForm(values) });
      toast(`Saved ${sport.name}`);
    } catch (error) {
      setConflict(error.status === 409);
      applyServerErrors(error, form.setError);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(submit)} noValidate>
      <title>{`${sport.name} · Sports · Sports IQ`}</title>
      <PageHeader
        eyebrow="Sports"
        title={sport.name}
        subtitle="Changes show on the public pages as soon as you save."
        actions={
          <Button variant="outline" icon="open_in_new" href={`/${sport.slug}`} target="_blank" rel="noreferrer">
            Preview
          </Button>
        }
      />
      <Tabs label="Sport editor" variant="underline" items={tabs} value={url.tab} onChange={(tab) => setUrl({ tab })} />
      <TabPanel id="definition" hidden={url.tab !== 'definition'} className={styles.panel}>
        <DefinitionTab form={form} />
      </TabPanel>
      <TabPanel id="content" hidden={url.tab !== 'content'} className={styles.panel}>
        <ContentTab form={form} />
      </TabPanel>
      <div className={styles.saveBar}>
        {errors.root?.server && (
          <p role="alert" className={styles.error}>
            {errors.root.server.message}
            {conflict && (
              <Button variant="outline" size="sm" onClick={reload}>
                Reload
              </Button>
            )}
          </p>
        )}
        <Button type="submit" variant="navy" icon="save" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save sport'}
        </Button>
      </div>
    </form>
  );
}

/** D3 + D4: one form for a sport's definition and its page content; the form restarts after each save. */
export function SportEditorPage() {
  const { sport: slug } = useParams();
  const sport = useSport(slug);
  return <QueryState query={sport}>{(data) => <SportEditor key={data.version} sport={data} reload={() => sport.refetch()} />}</QueryState>;
}
