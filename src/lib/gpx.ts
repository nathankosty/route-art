import type { LatLng } from "./routing";

export function generateGPX(points: LatLng[], name: string): string {
  const timestamp = new Date().toISOString();
  const trackpoints = points
    .map(p => `      <trkpt lat="${p.lat.toFixed(7)}" lon="${p.lng.toFixed(7)}"></trkpt>`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="RouteArt"
  xmlns="http://www.topografix.com/GPX/1/1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <name>${escapeXml(name)}</name>
    <time>${timestamp}</time>
  </metadata>
  <trk>
    <name>${escapeXml(name)}</name>
    <trkseg>
${trackpoints}
    </trkseg>
  </trk>
</gpx>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function downloadGPX(points: LatLng[], name: string) {
  const gpx = generateGPX(points, name);
  const blob = new Blob([gpx], { type: "application/gpx+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name.replace(/[^a-zA-Z0-9]/g, "_")}.gpx`;
  a.click();
  URL.revokeObjectURL(url);
}
