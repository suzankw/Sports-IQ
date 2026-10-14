import { getMatch } from '../services/matches.js';
import { sendData } from './respond.js';

export const get = async (req, res) => sendData(res, await getMatch(req.actor, req.params.id));
