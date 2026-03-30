// Letter shapes for word mode.
// CRITICAL: Each letter is ONLY its corner/vertex points. No intermediate interpolation.
// OSRM finds the street path between consecutive points — we just give it the corners.
// Each letter is drawn as a single continuous stroke (pen may retrace lines).

export interface Letter {
  points: [number, number][];
  width: number;
}

// Arc helper for curved letters (O, C, etc.) — minimal points
function arc(
  cx: number, cy: number,
  rx: number, ry: number,
  startDeg: number, endDeg: number,
  steps: number
): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const a = ((startDeg + (i / steps) * (endDeg - startDeg)) * Math.PI) / 180;
    pts.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
  }
  return pts;
}

const letterDefs: Record<string, Letter> = {
  // Each letter: just the corners needed to draw it in one continuous stroke.
  // The stroke can backtrack (retrace) to connect disconnected parts.

  A: {
    points: [[0, 1], [0.4, 0], [0.8, 1], [0.6, 0.5], [0.2, 0.5]],
    width: 0.8,
  },
  B: {
    points: [
      [0, 1], [0, 0], [0.6, 0], [0.7, 0.1], [0.7, 0.4], [0.6, 0.5],
      [0, 0.5],
      [0.6, 0.5], [0.75, 0.6], [0.75, 0.9], [0.6, 1], [0, 1],
    ],
    width: 0.75,
  },
  C: {
    points: [
      [0.7, 0.15], [0.5, 0], [0.15, 0], [0, 0.2],
      [0, 0.8], [0.15, 1], [0.5, 1], [0.7, 0.85],
    ],
    width: 0.7,
  },
  D: {
    points: [
      [0, 1], [0, 0], [0.5, 0], [0.75, 0.2],
      [0.75, 0.8], [0.5, 1], [0, 1],
    ],
    width: 0.75,
  },
  E: {
    // Top bar right → top-left corner → down to mid → mid bar right → back to mid-left → down to bottom → bottom bar right
    points: [
      [0.7, 0], [0, 0], [0, 0.5], [0.5, 0.5], [0, 0.5], [0, 1], [0.7, 1],
    ],
    width: 0.7,
  },
  F: {
    points: [
      [0.7, 0], [0, 0], [0, 0.5], [0.5, 0.5], [0, 0.5], [0, 1],
    ],
    width: 0.7,
  },
  G: {
    points: [
      [0.7, 0.15], [0.5, 0], [0.15, 0], [0, 0.2],
      [0, 0.8], [0.15, 1], [0.6, 1], [0.7, 0.85],
      [0.7, 0.5], [0.4, 0.5],
    ],
    width: 0.7,
  },
  H: {
    points: [
      [0, 0], [0, 1], [0, 0.5], [0.7, 0.5], [0.7, 0], [0.7, 1],
    ],
    width: 0.7,
  },
  I: {
    points: [
      [0.1, 0], [0.5, 0], [0.3, 0], [0.3, 1], [0.1, 1], [0.5, 1],
    ],
    width: 0.5,
  },
  J: {
    points: [
      [0.2, 0], [0.7, 0], [0.5, 0], [0.5, 0.85],
      [0.35, 1], [0.1, 0.85],
    ],
    width: 0.7,
  },
  K: {
    points: [
      [0, 0], [0, 1], [0, 0.5], [0.65, 0],
      [0.2, 0.5], [0.7, 1],
    ],
    width: 0.7,
  },
  L: {
    points: [[0, 0], [0, 1], [0.65, 1]],
    width: 0.65,
  },
  M: {
    points: [[0, 1], [0, 0], [0.4, 0.5], [0.8, 0], [0.8, 1]],
    width: 0.8,
  },
  N: {
    points: [[0, 1], [0, 0], [0.7, 1], [0.7, 0]],
    width: 0.7,
  },
  O: {
    points: arc(0.4, 0.5, 0.35, 0.48, -90, 270, 8),
    width: 0.75,
  },
  P: {
    points: [
      [0, 1], [0, 0], [0.55, 0], [0.7, 0.12],
      [0.7, 0.38], [0.55, 0.5], [0, 0.5],
    ],
    width: 0.7,
  },
  Q: {
    points: [
      ...arc(0.4, 0.47, 0.35, 0.43, -90, 270, 8),
      [0.5, 0.7], [0.8, 1],
    ],
    width: 0.8,
  },
  R: {
    points: [
      [0, 1], [0, 0], [0.55, 0], [0.7, 0.12],
      [0.7, 0.38], [0.55, 0.5], [0, 0.5],
      [0.35, 0.5], [0.7, 1],
    ],
    width: 0.7,
  },
  S: {
    points: [
      [0.7, 0.1], [0.5, 0], [0.15, 0], [0, 0.12],
      [0, 0.38], [0.15, 0.5], [0.55, 0.5],
      [0.7, 0.62], [0.7, 0.88], [0.55, 1],
      [0.2, 1], [0, 0.88],
    ],
    width: 0.7,
  },
  T: {
    points: [[0, 0], [0.8, 0], [0.4, 0], [0.4, 1]],
    width: 0.8,
  },
  U: {
    points: [
      [0, 0], [0, 0.8], [0.15, 1],
      [0.55, 1], [0.7, 0.8], [0.7, 0],
    ],
    width: 0.7,
  },
  V: {
    points: [[0, 0], [0.4, 1], [0.8, 0]],
    width: 0.8,
  },
  W: {
    points: [[0, 0], [0.2, 1], [0.45, 0.4], [0.7, 1], [0.9, 0]],
    width: 0.9,
  },
  X: {
    points: [[0, 0], [0.7, 1], [0.35, 0.5], [0.7, 0], [0, 1]],
    width: 0.7,
  },
  Y: {
    points: [[0, 0], [0.35, 0.5], [0.7, 0], [0.35, 0.5], [0.35, 1]],
    width: 0.7,
  },
  Z: {
    points: [[0, 0], [0.7, 0], [0, 1], [0.7, 1]],
    width: 0.7,
  },
  "0": { points: arc(0.35, 0.5, 0.3, 0.48, -90, 270, 8), width: 0.65 },
  "1": { points: [[0.15, 0.2], [0.35, 0], [0.35, 1], [0.1, 1], [0.6, 1]], width: 0.5 },
  "2": {
    points: [
      [0, 0.15], [0.15, 0], [0.55, 0], [0.7, 0.15],
      [0.7, 0.35], [0, 1], [0.7, 1],
    ],
    width: 0.7,
  },
  "3": {
    points: [
      [0, 0.1], [0.2, 0], [0.55, 0], [0.7, 0.12],
      [0.7, 0.38], [0.55, 0.5],
      [0.7, 0.62], [0.7, 0.88], [0.55, 1],
      [0.2, 1], [0, 0.88],
    ],
    width: 0.7,
  },
  "4": { points: [[0.55, 1], [0.55, 0], [0, 0.65], [0.7, 0.65]], width: 0.7 },
  "5": {
    points: [
      [0.7, 0], [0, 0], [0, 0.45], [0.5, 0.45],
      [0.7, 0.58], [0.7, 0.88], [0.5, 1],
      [0.1, 1], [0, 0.88],
    ],
    width: 0.7,
  },
  "6": {
    points: [
      [0.6, 0.05], [0.35, 0], [0.1, 0.15],
      [0, 0.5], [0, 0.8], [0.15, 1],
      [0.5, 1], [0.65, 0.85], [0.65, 0.6],
      [0.5, 0.45], [0.15, 0.45], [0, 0.55],
    ],
    width: 0.65,
  },
  "7": { points: [[0, 0], [0.7, 0], [0.25, 1]], width: 0.7 },
  "8": {
    points: [
      ...arc(0.35, 0.25, 0.22, 0.22, -90, 270, 6),
      ...arc(0.35, 0.73, 0.25, 0.25, -90, 270, 6),
    ],
    width: 0.65,
  },
  "9": {
    points: [
      [0.65, 0.55], [0.5, 0.45], [0.15, 0.45],
      [0, 0.25], [0.1, 0.05], [0.4, 0],
      [0.6, 0.1], [0.65, 0.35], [0.65, 0.75],
      [0.5, 1], [0.15, 0.95],
    ],
    width: 0.65,
  },
  " ": { points: [], width: 0.3 },
};

export function getLetterPoints(char: string): Letter {
  return letterDefs[char.toUpperCase()] ?? letterDefs[" "];
}

// Convert a word into a single continuous set of normalized points.
// Letters are laid out horizontally and connected.
export function wordToPoints(word: string): [number, number][] {
  const chars = word.toUpperCase().split("");
  const letterSpacing = 0.15;

  let totalWidth = 0;
  for (const ch of chars) {
    const letter = getLetterPoints(ch);
    totalWidth += letter.width + letterSpacing;
  }
  totalWidth -= letterSpacing;
  if (totalWidth <= 0) return [];

  const allPoints: [number, number][] = [];
  let offsetX = 0;

  for (const ch of chars) {
    const letter = getLetterPoints(ch);
    for (const [x, y] of letter.points) {
      allPoints.push([(offsetX + x * letter.width) / totalWidth, y]);
    }
    offsetX += letter.width + letterSpacing;
  }

  return allPoints;
}
