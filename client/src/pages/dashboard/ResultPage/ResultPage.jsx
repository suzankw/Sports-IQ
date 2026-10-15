import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router';
import { QueryState } from '../../../components/QueryState/QueryState.jsx';
import { useToast } from '../../../components/Toast/Toast.jsx';
import { useMatch, useSaveResult } from '../../../hooks/matches.js';
import { useTeamSeason } from '../../../hooks/teamSeasons.js';
import { fromResultForm, peopleOf, periodName, toResultForm } from '../../../lib/resultForm.js';
import { describeProblems } from '../../../lib/resultProblems.js';
import { EventsSection } from './EventsSection.jsx';
import { LineupSection } from './LineupSection.jsx';
import { PeriodsSection } from './PeriodsSection.jsx';
import { PlayerStatsSection } from './PlayerStatsSection.jsx';
import { ReportSection } from './ReportSection.jsx';
import { ResultHeader } from './ResultHeader.jsx';
import { ResultSaveBar } from './ResultSaveBar.jsx';
import { ScoreSection } from './ScoreSection.jsx';
import { Section } from './Section.jsx';
import { TeamStatsSection } from './TeamStatsSection.jsx';
import styles from './ResultPage.module.css';

function ResultEditor({ match, squad, reload }) {
  const form = useForm({ defaultValues: toResultForm(match) });
  const save = useSaveResult(match.id);
  const toast = useToast();
  const [problems, setProblems] = useState([]);
  const people = useMemo(() => peopleOf(squad, match), [squad, match]);
  const { sport } = match;
  const names = { turiName: 'Turi', opponentName: match.opponent.shortName };
  const flagged = new Set(problems.map((p) => p.section));
  const section = (id) => ({ flagged: flagged.has(id) });

  const submit = (published) =>
    form.handleSubmit(async (values) => {
      const body = fromResultForm(values, match, { published, positionOf: (id) => people.get(id)?.position });
      try {
        await save.mutateAsync(body);
        toast(published ? 'Result published' : 'Saved as a draft');
      } catch (error) {
        setProblems(describeProblems(error, body, (id) => people.get(id)?.shortName ?? 'A player'));
      }
    });

  return (
    <div className={styles.page}>
      <title>{`Result · ${match.team.name} v ${match.opponent.shortName} · Sports IQ`}</title>
      <ResultHeader match={match} />
      <div className={styles.sections}>
        <Section number={1} title="Score" defaultOpen {...section('score')}>
          <ScoreSection form={form} match={match} turiName={names.turiName} />
        </Section>
        <Section number={2} title="Lineup" {...section('lineup')}>
          <LineupSection form={form} sport={sport} people={people} />
        </Section>
        {sport.scoreDetail === 'events' ? (
          <Section number={3} title="Goals, cards & subs" {...section('detail')}>
            <EventsSection form={form} people={people} {...names} />
          </Section>
        ) : (
          <Section number={3} title={`${periodName(sport.periods?.count)} scores`} {...section('detail')}>
            <PeriodsSection form={form} count={sport.periods?.count ?? 4} {...names} />
          </Section>
        )}
        <Section number={4} title="Team stats" {...section('teamStats')}>
          <TeamStatsSection form={form} sport={sport} {...names} />
        </Section>
        <Section number={5} title="Player stats" wide {...section('playerStats')}>
          <PlayerStatsSection form={form} sport={sport} people={people} />
        </Section>
        <Section number={6} title="Report & photos" wide {...section('report')}>
          <ReportSection form={form} sport={sport} people={people} />
        </Section>
      </div>
      <ResultSaveBar
        problems={problems}
        conflict={save.error?.status === 409}
        reload={reload}
        published={match.published}
        busy={form.formState.isSubmitting}
        onSave={submit}
      />
    </div>
  );
}

/** D14 Match result entry (phone-first). Restarts from the saved match after each save (new version). */
export function ResultPage() {
  const { id } = useParams();
  const match = useMatch(id);
  const squad = useTeamSeason(match.data?.teamSeason);
  return (
    <QueryState query={match.isSuccess ? squad : match}>
      {() => <ResultEditor key={match.data.version} match={match.data} squad={squad.data} reload={() => match.refetch()} />}
    </QueryState>
  );
}
