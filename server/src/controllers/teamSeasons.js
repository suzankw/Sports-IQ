import { getTeamSeason, listTeamSeasons } from '../services/teamSeasons.js';
import { sendData, sendList } from './respond.js';

export const list = async (req, res) => sendList(res, req.query, await listTeamSeasons(req.actor, req.query));
export const get = async (req, res) => sendData(res, await getTeamSeason(req.params.id));
