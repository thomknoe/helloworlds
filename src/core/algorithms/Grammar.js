/**
 * Abstract base class for grammar-based generation systems
 * Provides common interface for L-systems, shape grammars, building grammars, etc.
 */
export class Grammar {
  constructor() {
    if (this.constructor === Grammar) {
      throw new Error("Grammar is an abstract class and cannot be instantiated directly");
    }
  }

  /**
   * Generate the grammar output
   * Must be implemented by subclasses
   * @param {Object} config - Grammar configuration
   * @returns {*} Generated output
   */
  generate(config) {
    throw new Error("generate must be implemented by subclass");
  }

  /**
   * Apply rules iteratively
   * @param {string} axiom - Starting string
   * @param {Object} rules - Replacement rules
   * @param {number} iterations - Number of iterations
   * @returns {string} Resulting string
   */
  applyRules(axiom, rules, iterations) {
    let result = axiom;
    for (let i = 0; i < iterations; i++) {
      result = this.replace(result, rules);
    }
    return result;
  }

  /**
   * Replace characters in string according to rules
   * @param {string} str - Input string
   * @param {Object} rules - Replacement rules mapping
   * @returns {string} String with replacements applied
   */
  replace(str, rules) {
    return str
      .split("")
      .map((char) => rules[char] || char)
      .join("");
  }
}

