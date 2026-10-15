import { createFixture, deleteFixture, updateFixture } from '../services/fixtures.js';
import { saveResult } from '../services/matchResultEntry.js';
import { getMatch, listMatches } from '../services/matches.js';
import { sendData, sendList, sendNoContent } from './respond.js';

export const get = async (req, res) => sendData(res, await getMatch(req.actor, req.params.id));
export const list = async (req, res) => sendList(res, req.query, await listMatches(req.actor, req.query));
export const create = async (req, res) => sendData(res, await createFixture(req.actor, req.body), 201);
export const update = async (req, res) => sendData(res, await updateFixture(req.actor, req.params.id, req.body));
export const result = async (req, res) => sendData(res, await saveResult(req.actor, req.params.id, req.body));
export async function remove(req, res) {
  await deleteFixture(req.actor, req.params.id);
  sendNoContent(res);
}
