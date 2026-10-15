import { saveUpload } from '../services/uploads.js';
import { sendData } from './respond.js';

export const create = async (req, res) => sendData(res, await saveUpload(req.actor, req.files?.[0]), 201);
