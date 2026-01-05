export class MarkovChain {
  constructor(config = {}) {
    this.states = config.states || ["A", "B", "C"];
    this.transitions = config.transitions || this.createDefaultTransitions();
    this.currentState = config.initialState || this.states[0];
    this.history = [this.currentState];
  }
  createDefaultTransitions() {
    const transitions = {};
    const prob = 1.0 / this.states.length;
    for (const state of this.states) {
      transitions[state] = {};
      for (const nextState of this.states) {
        transitions[state][nextState] = prob;
      }
    }
    return transitions;
  }
  setTransition(from, to, probability) {
    if (!this.transitions[from]) {
      this.transitions[from] = {};
    }
    this.transitions[from][to] = probability;
  }
  next() {
    const currentTransitions = this.transitions[this.currentState] || {};
    const rand = Math.random();
    let cumulative = 0;
    for (const state of this.states) {
      cumulative += currentTransitions[state] || 0;
      if (rand <= cumulative) {
        this.currentState = state;
        this.history.push(state);
        return state;
      }
    }
    this.currentState = this.states[0];
    this.history.push(this.currentState);
    return this.currentState;
  }
  generateSequence(length = 10) {
    const sequence = [];
    for (let i = 0; i < length; i++) {
      sequence.push(this.next());
    }
    return sequence;
  }
  reset(initialState = null) {
    this.currentState = initialState || this.states[0];
    this.history = [this.currentState];
  }
  getCurrentState() {
    return this.currentState;
  }
  getHistory() {
    return [...this.history];
  }
}
export default MarkovChain;
