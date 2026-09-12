// Each shape is a list of [x, y] KEY VERTICES in normalized 0..1 space.
// IMPORTANT: Only include corner points and curve control points.
// Do NOT interpolate along straight lines. OSRM handles path-finding between points.
// For curves, sample at wide intervals (~30-45 degrees).
// y=0 is top/north, y=1 is bottom/south.

export interface Shape {
  name: string;
  points: [number, number][];
  category: "basic" | "animal" | "seasonal" | "symbol";
}

// Sample a curve at wide intervals for smooth but minimal point count
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

// Heart: parametric with ~16 key points (not 40)
function heartShape(): [number, number][] {
  const pts: [number, number][] = [];
  const n = 16;
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * Math.PI * 2;
    const x = 16 * Math.sin(t) ** 3;
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    pts.push([(x / 36) + 0.5, 0.5 - (y / 36)]);
  }
  return pts;
}

// Star: exactly 11 points (5 outer + 5 inner + close)
function starShape(): [number, number][] {
  const pts: [number, number][] = [];
  const outerR = 0.45;
  const innerR = 0.18;
  for (let i = 0; i <= 10; i++) {
    const angle = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    pts.push([0.5 + r * Math.cos(angle), 0.5 + r * Math.sin(angle)]);
  }
  return pts;
}

// Diamond: 5 points
function diamondShape(): [number, number][] {
  return [[0.5, 0.05], [0.9, 0.5], [0.5, 0.95], [0.1, 0.5], [0.5, 0.05]];
}

// Arrow: 8 corner points
function arrowShape(): [number, number][] {
  return [
    [0.05, 0.45], [0.6, 0.45], [0.6, 0.2],
    [0.95, 0.5],
    [0.6, 0.8], [0.6, 0.55],
    [0.05, 0.55], [0.05, 0.45],
  ];
}

// Lightning: 7 corner points
function lightningShape(): [number, number][] {
  return [
    [0.55, 0.05], [0.3, 0.45], [0.5, 0.45],
    [0.35, 0.95],
    [0.7, 0.45], [0.5, 0.45], [0.55, 0.05],
  ];
}

// Smiley: outer circle (8pts) + eyes (3pts each) + smile arc (5pts)
function smileyShape(): [number, number][] {
  const outer = arc(0.5, 0.5, 0.42, 0.42, 0, 360, 10);
  // Left eye: just 3 points for a small circle
  const leftEye: [number, number][] = [
    [0.35, 0.33], [0.32, 0.4], [0.38, 0.4], [0.35, 0.33],
  ];
  // Right eye
  const rightEye: [number, number][] = [
    [0.65, 0.33], [0.62, 0.4], [0.68, 0.4], [0.65, 0.33],
  ];
  // Smile: arc from left to right
  const smile = arc(0.5, 0.58, 0.2, 0.14, 0, 180, 5);
  // Connect everything: outer circle, jump to left eye, jump to right eye, jump to smile
  return [...outer, ...leftEye, ...rightEye, ...smile];
}

// House: 10 corner points
function houseShape(): [number, number][] {
  return [
    [0.2, 0.9], [0.8, 0.9], [0.8, 0.45],
    [0.5, 0.1],
    [0.2, 0.45], [0.2, 0.9],
    // Door
    [0.4, 0.9], [0.4, 0.65], [0.6, 0.65], [0.6, 0.9],
  ];
}

// Music note: head circle (6pts) + stem + flag
function musicNoteShape(): [number, number][] {
  const head = arc(0.35, 0.78, 0.12, 0.1, 0, 360, 6);
  return [
    ...head,
    // Stem
    [0.47, 0.78], [0.47, 0.15],
    // Flag
    [0.7, 0.25], [0.65, 0.4], [0.47, 0.35],
  ];
}

// Christmas tree: corner vertices only
function treeShape(): [number, number][] {
  return [
    [0.45, 0.95], [0.55, 0.95], [0.55, 0.78],
    [0.8, 0.78], [0.5, 0.55],
    [0.75, 0.55], [0.5, 0.32],
    [0.68, 0.32], [0.5, 0.08],
    [0.32, 0.32], [0.5, 0.32],
    [0.25, 0.55], [0.5, 0.55],
    [0.2, 0.78], [0.45, 0.78], [0.45, 0.95],
  ];
}

// Cat silhouette: corner vertices
function catShape(): [number, number][] {
  return [
    [0.2, 0.9], [0.2, 0.5],
    [0.25, 0.15], [0.35, 0.35],
    [0.5, 0.3],
    [0.65, 0.35], [0.75, 0.15],
    [0.8, 0.5], [0.8, 0.9],
    [0.85, 0.85], [0.95, 0.6], [0.9, 0.45],
    [0.8, 0.9], [0.2, 0.9],
  ];
}

// Fish: elliptical body (8pts) + tail
function fishShape(): [number, number][] {
  const body = arc(0.38, 0.5, 0.28, 0.2, 0, 360, 8);
  return [
    ...body,
    [0.66, 0.5], [0.85, 0.2], [0.95, 0.5], [0.85, 0.8], [0.66, 0.5],
  ];
}

// Pumpkin: body circle (10pts) + stem
function pumpkinShape(): [number, number][] {
  const body = arc(0.5, 0.55, 0.38, 0.33, 0, 360, 10);
  return [
    ...body,
    [0.5, 0.22], [0.48, 0.12], [0.55, 0.08], [0.55, 0.18], [0.5, 0.22],
  ];
}

export const shapes: Shape[] = [
  { name: "Heart", points: heartShape(), category: "basic" },
  { name: "Star", points: starShape(), category: "basic" },
  { name: "Diamond", points: diamondShape(), category: "basic" },
  { name: "Arrow", points: arrowShape(), category: "basic" },
  { name: "Lightning", points: lightningShape(), category: "basic" },
  { name: "Smiley", points: smileyShape(), category: "symbol" },
  { name: "House", points: houseShape(), category: "symbol" },
  { name: "Music Note", points: musicNoteShape(), category: "symbol" },
  { name: "Cat", points: catShape(), category: "animal" },
  { name: "Fish", points: fishShape(), category: "animal" },
  { name: "Tree", points: treeShape(), category: "seasonal" },
  { name: "Pumpkin", points: pumpkinShape(), category: "seasonal" },
];
