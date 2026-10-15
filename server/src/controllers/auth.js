import { clearSessionCookie, setSessionCookie } from '../auth/session.js';
import * as auth from '../services/auth.js';
import { sendData, sendNoContent } from './respond.js';

export async function login(req, res) {
  const { user, me } = await auth.login(req.body.email, req.body.password);
  setSessionCookie(res, user);
  sendData(res, me);
}

export function logout(_req, res) {
  clearSessionCookie(res);
  sendNoContent(res);
}

export const me = async (req, res) => sendData(res, await auth.getMe(req.actor));
export const updateMe = async (req, res) => sendData(res, await auth.updateMe(req.actor, req.body));

export async function changePassword(req, res) {
  const { user, me } = await auth.changePassword(req.actor, req.body);
  setSessionCookie(res, user);
  sendData(res, me);
}
