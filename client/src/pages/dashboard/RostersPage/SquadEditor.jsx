import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { Button } from '../../../components/Button/Button.jsx';
import { Card, CardHeader } from '../../../components/Card/Card.jsx';
import { SaveBar } from '../../../components/SaveBar/SaveBar.jsx';
import { useToast } from '../../../components/Toast/Toast.jsx';
import { useSaveSquad } from '../../../hooks/teamSeasons.js';
import { applyServerErrors } from '../../../lib/forms.js';
import { fromSquadForm, nextNumber, toSquadForm } from '../../../lib/squadForm.js';
import { AddPlayer } from './AddPlayer.jsx';
import { DepthChartEditor } from './DepthChartEditor.jsx';
import { SquadTable } from './SquadTable.jsx';
import styles from './RostersPage.module.css';

/**
 * One team-season's squad, saved whole. No <form> element: the "new player" dialog has its own form,
 * and forms can't nest — Save calls handleSubmit directly.
 */
export function SquadEditor({ teamSeason, sport, reload }) {
  const form = useForm({ defaultValues: toSquadForm(teamSeason, sport) });
  const members = useFieldArray({ control: form.control, name: 'members' });
  const save = useSaveSquad(teamSeason.id);
  const toast = useToast();
  const { errors, isSubmitting } = form.formState;
  const positions = sport.positions.map((p) => ({ value: p.key, label: `${p.key} · ${p.name}` }));
  const current = useWatch({ control: form.control, name: 'members' });
  const showDepth = sport.scoreDetail === 'periods' || teamSeason.depthChart.length > 0;

  const submit = async (values) => {
    try {
      await save.mutateAsync(fromSquadForm(values, teamSeason.version));
      toast(`Saved the ${teamSeason.team.name} squad`);
    } catch (error) {
      applyServerErrors(error, form.setError);
    }
  };

  return (
    <div className={styles.editor}>
      <Card>
        <CardHeader title={`${teamSeason.team.name} squad · ${current.length} players`} icon="groups" />
        <SquadTable form={form} fields={members.fields} remove={members.remove} positions={positions} />
        <AddPlayer exclude={current.map((m) => m.player)} onAdd={(player) => members.append({ player: player.id, number: nextNumber(current), position: '', info: player })} />
      </Card>
      {showDepth && <DepthChartEditor form={form} sport={sport} />}
      <SaveBar
        error={
          errors.root?.server && (
            <>
              {errors.root.server.message}
              {save.error?.status === 409 && (
                <Button variant="outline" size="sm" onClick={reload}>
                  Reload
                </Button>
              )}
            </>
          )
        }
      >
        <Button variant="navy" icon="save" disabled={isSubmitting} onClick={form.handleSubmit(submit)}>
          {isSubmitting ? 'Saving…' : 'Save squad'}
        </Button>
      </SaveBar>
    </div>
  );
}
