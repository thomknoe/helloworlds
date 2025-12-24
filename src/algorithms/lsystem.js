export class LSystem {
  constructor(axiom, rules, iterations = 3) {
    this.axiom = axiom;
    this.rules = rules;
    this.iterations = iterations;
    this.currentString = axiom;
  }

  iterate() {
    this.currentString = this.axiom;

    for (let i = 0; i < this.iterations; i++) {
      let newString = "";
      for (let char of this.currentString) {
        if (this.rules[char]) {
          newString += this.rules[char];
        } else {
          newString += char;
        }
      }
      this.currentString = newString;
    }

    return this.currentString;
  }

  getString() {
    return this.currentString;
  }
}

export function parseLSystemString(lstring, angle, stepSize) {
  const commands = [];
  const stack = [];

  let currentAngle = 0;
  let x = 0;
  let y = 0;
  let z = 0;

  for (let i = 0; i < lstring.length; i++) {
    const char = lstring[i];

    switch (char) {
      case 'F':
      case 'G':
        const newX = x + Math.sin(currentAngle) * stepSize;
        const newY = y + Math.cos(currentAngle) * stepSize;
        const newZ = z;

        commands.push({
          type: 'line',
          from: { x, y, z },
          to: { x: newX, y: newY, z: newZ },
        });

        x = newX;
        y = newY;
        z = newZ;
        break;

      case '+':
        currentAngle += angle;
        break;

      case '-':
        currentAngle -= angle;
        break;

      case '&':

        break;

      case '^':

        break;

      case '\\':

        break;

      case '/':

        break;

      case '|':
        currentAngle += Math.PI;
        break;

      case '[':
        stack.push({
          x, y, z,
          angle: currentAngle,
        });
        break;

      case ']':
        if (stack.length > 0) {
          const state = stack.pop();
          x = state.x;
          y = state.y;
          z = state.z;
          currentAngle = state.angle;
        }
        break;

      default:

        break;
    }
  }

  return commands;
}

export const defaultPlantRules = {
  'F': 'F[+F]F[-F]F',
};

export const defaultAxiom = 'F';

export const complexPlantRules = {
  'F': 'FF+[+F-F-F]-[-F+F+F]',
};

export const treeRules = {
  'F': 'FF[++F][-F]F',
};
