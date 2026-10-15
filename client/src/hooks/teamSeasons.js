import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client.js';
import { useSeasons } from './seasons.js';
import { useUrlState } from './useUrlState.js';

export const useTeamSeasons = (params, { enabled = true } = {}) =>
  useQuery({
    queryKey: ['team-seasons', params],
    queryFn: async () => (await api.get('/team-seasons', { ...params, pageSize: 200 })).data,
    enabled,
  });

export const useTeamSeason = (id) =>
  useQuery({
    queryKey: ['team-seasons', id],
    queryFn: async () => (await api.get(`/team-seasons/${id}`)).data,
    enabled: Boolean(id),
  });

/**
 * The season and team picked in the URL (?season=&team=) for a sport, defaulting to the current
 * season and the first team. Shared by Roster, Season Stats and League Table.
 */
export function useTeamSelection(sport) {
  const [url, setUrl] = useUrlState({ season: '', team: '' });
  const seasons = useSeasons();
  const season = seasons.data?.find((s) => (url.season ? s.slug === url.season : s.isCurrent));
  const teamSeasons = useTeamSeasons({ sport, season: season?.slug }, { enabled: Boolean(season) });
  const list = teamSeasons.data ?? [];
  const selected = list.find((ts) => ts.team.slug === url.team) ?? list[0];
  return {
    seasons: seasons.data ?? [],
    season,
    teamSeasons: list,
    selected,
    query: season ? teamSeasons : seasons,
    select: setUrl,
  };
}

/** D12 Roster editor save (PUT the whole squad with `version`). */
export function useSaveSquad(id) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (body) => (await api.put(`/team-seasons/${id}/squad`, body)).data,
    onSuccess: (teamSeason) => {
      client.setQueryData(['team-seasons', id], teamSeason);
      return client.invalidateQueries();
    },
  });
}
