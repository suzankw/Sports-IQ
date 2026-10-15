import { getStandings } from '../services/standings.js';
import { sendData } from './respond.js';

export const standings = async (req, res) => sendData(res, await getStandings(req.params.id, req.query.season));
