import { Select } from '../Select/Select.jsx';
import { Tabs } from '../Tabs/Tabs.jsx';
import styles from './TeamSeasonFilters.module.css';

/** Season select + team tabs, driven by useTeamSelection(). */
export function TeamSeasonFilters({ selection }) {
  const { seasons, season, teamSeasons, selected, select } = selection;
  return (
    <div className={styles.filters}>
      <Select
        label="Season"
        hideLabel
        value={season?.slug ?? ''}
        options={seasons.map((s) => ({ value: s.slug, label: `${s.label} Season` }))}
        onChange={(slug) => select({ season: seasons.find((s) => s.slug === slug)?.isCurrent ? '' : slug, team: '' })}
      />
      {teamSeasons.length > 1 && (
        <Tabs
          variant="segmented"
          label="Team"
          items={teamSeasons.map((ts) => ({ id: ts.team.slug, label: ts.team.name }))}
          value={selected?.team.slug}
          onChange={(team) => select({ team: team === teamSeasons[0].team.slug ? '' : team })}
        />
      )}
    </div>
  );
}
