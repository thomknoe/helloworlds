/**
 * Markov Chain generator
 * Generates sequences based on transition probabilities
 */
export class MarkovChain {
  constructor(config = {}) {
    this.states = config.states || ["A", "B", "C"];
    this.transitions = config.transitions || this.createDefaultTransitions();
    this.currentState = config.initialState || this.states[0];
    this.history = [this.currentState];
  }

  // Create default transition matrix (equal probabilities)
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

  // Set transition probability from state A to state B
  setTransition(from, to, probability) {
    if (!this.transitions[from]) {
      this.transitions[from] = {};
    }
    this.transitions[from][to] = probability;
  }

  // Get next state based on current state and transition probabilities
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

    // Fallback to first state
    this.currentState = this.states[0];
    this.history.push(this.currentState);
    return this.currentState;
  }

  // Generate a sequence of states
  generateSequence(length = 10) {
    const sequence = [];
    for (let i = 0; i < length; i++) {
      sequence.push(this.next());
    }
    return sequence;
  }

  // Reset to initial state
  reset(initialState = null) {
    this.currentState = initialState || this.states[0];
    this.history = [this.currentState];
  }

  // Get current state
  getCurrentState() {
    return this.currentState;
  }

  // Get history
  getHistory() {
    return [...this.history];
  }
}

export default MarkovChain;

