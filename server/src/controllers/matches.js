import { getMatch, listMatches } from '../services/matches.js';
import { sendData, sendList } from './respond.js';

export const get = async (req, res) => sendData(res, await getMatch(req.actor, req.params.id));
export const list = async (req, res) => sendList(res, req.query, await listMatches(req.actor, req.query));
