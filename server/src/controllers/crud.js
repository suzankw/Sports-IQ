import { sendData, sendList, sendNoContent } from './respond.js';

/** HTTP ↔ service for resources built with crudService. */
export const crudController = (service) => ({
  list: async (req, res) => sendList(res, req.query, await service.list(req.query)),
  create: async (req, res) => sendData(res, await service.create(req.actor, req.body), 201),
  update: async (req, res) => sendData(res, await service.update(req.actor, req.params.id, req.body)),
  remove: async (req, res) => {
    await service.remove(req.actor, req.params.id);
    sendNoContent(res);
  },
});
