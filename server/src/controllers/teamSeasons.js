import { getSeasonStats } from '../services/seasonStats.js';
import { createTeamSeason, deleteTeamSeason, getTeamSeason, listTeamSeasons, updateTeamSeason } from '../services/teamSeasons.js';
import { sendData, sendList, sendNoContent } from './respond.js';

export const list = async (req, res) => sendList(res, req.query, await listTeamSeasons(req.actor, req.query));
export const get = async (req, res) => sendData(res, await getTeamSeason(req.params.id));
export const stats = async (req, res) => sendData(res, await getSeasonStats(req.params.id));
export const create = async (req, res) => sendData(res, await createTeamSeason(req.actor, req.body), 201);
export const update = async (req, res) => sendData(res, await updateTeamSeason(req.actor, req.params.id, req.body));
export async function remove(req, res) {
  await deleteTeamSeason(req.actor, req.params.id);
  sendNoContent(res);
}
