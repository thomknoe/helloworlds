export class Grammar {
  constructor() {
    if (this.constructor === Grammar) {
      throw new Error("Grammar is an abstract class and cannot be instantiated directly");
    }
  }
  generate(config) {
    throw new Error("generate must be implemented by subclass");
  }
  applyRules(axiom, rules, iterations) {
    let result = axiom;
    for (let i = 0; i < iterations; i++) {
      result = this.replace(result, rules);
    }
    return result;
  }
  replace(str, rules) {
    return str
      .split("")
      .map((char) => rules[char] || char)
      .join("");
  }
}
