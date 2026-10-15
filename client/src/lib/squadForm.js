// D12 Roster editor: TeamSeason ⇄ form values. Members carry `info` (name, photo) for display only.

export function toSquadForm(teamSeason, sport) {
  const depth = new Map(teamSeason.depthChart.map((row) => [row.position, row.players]));
  return {
    members: [...teamSeason.members]
      .sort((a, b) => a.number - b.number)
      .map((m) => ({ player: m.player.id, number: m.number, position: m.position, info: m.player })),
    captain: teamSeason.captain?.id ?? '',
    // One row per position, in the sport's order (useFieldArray needs objects, hence { player }).
    depthChart: sport.positions.map((p) => ({ position: p.key, players: (depth.get(p.key) ?? []).map((pl) => ({ player: pl.id })) })),
  };
}

/** Players removed from the squad also leave the captaincy and the depth chart. */
export function fromSquadForm({ members, captain, depthChart }, version) {
  const ids = new Set(members.map((m) => m.player));
  return {
    version,
    members: members.map(({ player, number, position }) => ({ player, number, position })),
    captain: ids.has(captain) ? captain : null,
    depthChart: depthChart
      .map((row) => ({ position: row.position, players: row.players.map((p) => p.player).filter((id) => ids.has(id)) }))
      .filter((row) => row.players.length),
  };
}

/** The lowest shirt number not taken yet. */
export function nextNumber(members) {
  const taken = new Set(members.map((m) => m.number));
  let number = 1;
  while (taken.has(number)) number += 1;
  return number;
}
