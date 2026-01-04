import * as THREE from "three";

/**
 * Parametric Curves
 * Bezier curves, splines for roads, paths, organic shapes
 */
export class ParametricCurve {
  constructor(config = {}) {
    this.curveType = config.curveType || "bezier"; // "bezier", "spline", "line"
    this.controlPoints = config.controlPoints || this.createDefaultControlPoints();
    this.segments = config.segments || 50;
  }

  createDefaultControlPoints() {
    return [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(5, 0, 5),
      new THREE.Vector3(10, 0, 0),
      new THREE.Vector3(15, 0, 5),
    ];
  }

  // Generate curve points
  generatePoints() {
    const points = [];

    switch (this.curveType) {
      case "bezier":
        return this.generateBezierPoints();
      case "spline":
        return this.generateSplinePoints();
      case "line":
        return this.generateLinePoints();
      default:
        return this.generateBezierPoints();
    }
  }

  // Cubic Bezier curve
  generateBezierPoints() {
    const points = [];
    if (this.controlPoints.length < 4) {
      // Use first point repeated if not enough points
      const p0 = this.controlPoints[0] || new THREE.Vector3(0, 0, 0);
      const p1 = this.controlPoints[1] || p0.clone();
      const p2 = this.controlPoints[2] || p0.clone();
      const p3 = this.controlPoints[3] || p0.clone();

      for (let i = 0; i <= this.segments; i++) {
        const t = i / this.segments;
        const point = this.bezierPoint(p0, p1, p2, p3, t);
        points.push(point);
      }
    } else {
      // Multiple Bezier segments
      for (let i = 0; i < this.controlPoints.length - 3; i += 3) {
        const p0 = this.controlPoints[i];
        const p1 = this.controlPoints[i + 1];
        const p2 = this.controlPoints[i + 2];
        const p3 = this.controlPoints[i + 3];

        for (let j = 0; j <= this.segments; j++) {
          const t = j / this.segments;
          const point = this.bezierPoint(p0, p1, p2, p3, t);
          if (i === 0 || j > 0) { // Avoid duplicate points
            points.push(point);
          }
        }
      }
    }

    return points;
  }

  bezierPoint(p0, p1, p2, p3, t) {
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;
    const uuu = uu * u;
    const ttt = tt * t;

    const point = new THREE.Vector3();
    point.x = uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x;
    point.y = uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y;
    point.z = uuu * p0.z + 3 * uu * t * p1.z + 3 * u * tt * p2.z + ttt * p3.z;

    return point;
  }

  // Catmull-Rom spline
  generateSplinePoints() {
    const points = [];
    if (this.controlPoints.length < 4) {
      return this.generateLinePoints();
    }

    for (let i = 0; i < this.controlPoints.length - 1; i++) {
      const p0 = i > 0 ? this.controlPoints[i - 1] : this.controlPoints[i];
      const p1 = this.controlPoints[i];
      const p2 = this.controlPoints[i + 1];
      const p3 = i < this.controlPoints.length - 2 ? this.controlPoints[i + 2] : this.controlPoints[i + 1];

      for (let j = 0; j <= this.segments; j++) {
        const t = j / this.segments;
        const point = this.catmullRomPoint(p0, p1, p2, p3, t);
        if (i === 0 || j > 0) {
          points.push(point);
        }
      }
    }

    return points;
  }

  catmullRomPoint(p0, p1, p2, p3, t) {
    const t2 = t * t;
    const t3 = t2 * t;

    const point = new THREE.Vector3();
    point.x = 0.5 * (
      (2 * p1.x) +
      (-p0.x + p2.x) * t +
      (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
      (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3
    );
    point.y = 0.5 * (
      (2 * p1.y) +
      (-p0.y + p2.y) * t +
      (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
      (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3
    );
    point.z = 0.5 * (
      (2 * p1.z) +
      (-p0.z + p2.z) * t +
      (2 * p0.z - 5 * p1.z + 4 * p2.z - p3.z) * t2 +
      (-p0.z + 3 * p1.z - 3 * p2.z + p3.z) * t3
    );

    return point;
  }

  // Simple line
  generateLinePoints() {
    return [...this.controlPoints];
  }

  // Get curve length (approximate)
  getLength() {
    const points = this.generatePoints();
    let length = 0;
    for (let i = 1; i < points.length; i++) {
      length += points[i].distanceTo(points[i - 1]);
    }
    return length;
  }

  // Sample point at normalized position (0-1)
  sampleAt(t) {
    const points = this.generatePoints();
    const index = Math.floor(t * (points.length - 1));
    return points[Math.min(index, points.length - 1)];
  }
}

export default ParametricCurve;

