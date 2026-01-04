/**
 * Manages entities in the world
 * Handles creation, updates, and disposal of entities
 */
export class EntityManager {
  constructor() {
    this.entities = new Map();
  }

  /**
   * Add an entity
   * @param {string} id - Unique identifier
   * @param {Object} entity - Entity object
   */
  add(id, entity) {
    this.entities.set(id, entity);
  }

  /**
   * Get an entity by ID
   * @param {string} id - Entity identifier
   * @returns {Object|null} Entity or null if not found
   */
  get(id) {
    return this.entities.get(id) || null;
  }

  /**
   * Remove an entity
   * @param {string} id - Entity identifier
   */
  remove(id) {
    const entity = this.entities.get(id);
    if (entity) {
      if (entity.dispose) {
        entity.dispose();
      }
      this.entities.delete(id);
    }
  }

  /**
   * Update all entities
   * @param {number} deltaTime - Time since last update
   */
  update(deltaTime) {
    for (const entity of this.entities.values()) {
      if (entity.update) {
        entity.update(deltaTime);
      }
    }
  }

  /**
   * Clear all entities
   */
  clear() {
    for (const entity of this.entities.values()) {
      if (entity.dispose) {
        entity.dispose();
      }
    }
    this.entities.clear();
  }

  /**
   * Get all entities
   * @returns {Array} Array of all entities
   */
  getAll() {
    return Array.from(this.entities.values());
  }

  /**
   * Get count of entities
   * @returns {number} Number of entities
   */
  count() {
    return this.entities.size;
  }
}

