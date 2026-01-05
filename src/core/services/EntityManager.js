export class EntityManager {
  constructor() {
    this.entities = new Map();
  }
  add(id, entity) {
    this.entities.set(id, entity);
  }
  get(id) {
    return this.entities.get(id) || null;
  }
  remove(id) {
    const entity = this.entities.get(id);
    if (entity) {
      if (entity.dispose) {
        entity.dispose();
      }
      this.entities.delete(id);
    }
  }
  update(deltaTime) {
    for (const entity of this.entities.values()) {
      if (entity.update) {
        entity.update(deltaTime);
      }
    }
  }
  clear() {
    for (const entity of this.entities.values()) {
      if (entity.dispose) {
        entity.dispose();
      }
    }
    this.entities.clear();
  }
  getAll() {
    return Array.from(this.entities.values());
  }
  count() {
    return this.entities.size;
  }
}
