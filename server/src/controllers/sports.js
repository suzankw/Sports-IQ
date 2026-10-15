import { getOverview } from '../services/overview.js';
import { createSport, getSport, listSports, updateSport } from '../services/sports.js';
import { sendData, sendList } from './respond.js';

export const list = async (req, res) => sendList(res, req.query, await listSports(req.query));
export const get = async (req, res) => sendData(res, await getSport(req.params.sport));
export const create = async (req, res) => sendData(res, await createSport(req.actor, req.body), 201);
export const update = async (req, res) => sendData(res, await updateSport(req.actor, req.params.sport, req.body));
export const overview = async (req, res) => sendData(res, await getOverview(req.params.sport));
