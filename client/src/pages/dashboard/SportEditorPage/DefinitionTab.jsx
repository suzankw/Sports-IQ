import { Card, CardHeader } from '../../../components/Card/Card.jsx';
import { Checkbox } from '../../../components/Checkbox/Checkbox.jsx';
import { IconSelect } from '../../../components/IconSelect/IconSelect.jsx';
import { Select } from '../../../components/Select/Select.jsx';
import { NumberInput, TextInput } from '../../../components/TextInput/TextInput.jsx';
import { bind } from '../../../lib/forms.js';
import { keyOptions } from '../../../lib/sportForm.js';
import {
  FormationsEditor,
  LeaderboardsEditor,
  PositionsEditor,
  StatsEditor,
} from './DefinitionLists.jsx';
import styles from './SportEditorPage.module.css';

const STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'comingSoon', label: 'Coming soon' },
];
const SCORE_DETAILS = [
  { value: 'events', label: 'Events (goals, cards, subs)' },
  { value: 'periods', label: 'Period scores (quarters)' },
];

function BasicsCard({ form }) {
  const [playerStats, teamStats, icon] = form.watch(['playerStats', 'teamStats', 'icon']);
  const number = (path) => bind(form, path, { valueAsNumber: true });
  return (
    <Card>
      <CardHeader title="Basics" icon="sports" />
      <div className={styles.body}>
        <div className={styles.grid}>
          <TextInput label="Name" {...bind(form, 'name', { required: 'Enter the name' })} />
          <IconSelect
            label="Icon"
            current={icon}
            {...bind(form, 'icon', { required: 'Choose an icon' })}
          />
          <NumberInput label="Order" hint="Position in the sport menu" {...number('order')} />
          <Select label="Status" options={STATUSES} {...bind(form, 'status')} />
          <NumberInput label="Periods" hint="2 halves, 4 quarters…" {...number('periods.count')} />
          <NumberInput label="Minutes per period" {...number('periods.minutes')} />
          <Select
            label="Score detail"
            placeholder="Not set"
            hint="What the result form asks for"
            options={SCORE_DETAILS}
            {...bind(form, 'scoreDetail')}
          />
          <Select
            label="Scoring stat"
            placeholder="Not set"
            hint="The player stat that adds up to the score"
            options={keyOptions(playerStats)}
            {...bind(form, 'scoringStat')}
          />
          <NumberInput label="Points for a win" {...number('standingsPoints.win')} />
          <NumberInput label="Points for a draw" {...number('standingsPoints.draw')} />
          <NumberInput label="Points for a loss" {...number('standingsPoints.loss')} />
          <Select
            label="Headline team stat"
            placeholder="None"
            hint="Season Stats overview card"
            options={keyOptions(teamStats)}
            {...bind(form, 'kpis.teamStat')}
          />
        </div>
        <Checkbox
          label="Show clean sheets"
          hint="Season Stats counts matches where the opponent didn't score"
          {...form.register('kpis.cleanSheets')}
        />
      </div>
    </Card>
  );
}

const Section = ({ children }) => (
  <Card>
    <div className={styles.body}>{children}</div>
  </Card>
);

/** D3 definition: basics, then the lists that shape result entry and the stats pages. */
export function DefinitionTab({ form }) {
  return (
    <>
      <BasicsCard form={form} />
      <Section>
        <PositionsEditor form={form} />
      </Section>
      <Section>
        <StatsEditor
          form={form}
          name="playerStats"
          label="Player stats"
          hint="Recorded for each player in a match. Goals, assists and cards come from match events."
        />
      </Section>
      <Section>
        <StatsEditor
          form={form}
          name="teamStats"
          label="Team stats"
          hint="Recorded for Turi and the opponent in each match."
        />
      </Section>
      <Section>
        <LeaderboardsEditor form={form} />
      </Section>
      <Section>
        <FormationsEditor form={form} />
      </Section>
    </>
  );
}
