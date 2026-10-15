import { createUser, listUsers, resetPassword, updateUser } from '../services/users.js';
import { sendData, sendList, sendNoContent } from './respond.js';

export const list = async (req, res) => sendList(res, req.query, await listUsers(req.actor, req.query));
export const create = async (req, res) => sendData(res, await createUser(req.actor, req.body), 201);
export const update = async (req, res) => sendData(res, await updateUser(req.actor, req.params.id, req.body));
export async function passwordReset(req, res) {
  await resetPassword(req.actor, req.params.id, req.body);
  sendNoContent(res);
}
