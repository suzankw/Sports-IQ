/** Mounts the standard collection + item routes for a crudController. */
export function mountCrud(router, path, controller) {
  router.get(path, controller.list);
  router.post(path, controller.create);
  router.patch(`${path}/:id`, controller.update);
  router.delete(`${path}/:id`, controller.remove);
}
