// Core routing engine: converts shape KEY VERTICES to geo-coordinates,
// then routes segment-by-segment via OSRM for maximum shape fidelity.
//
// Design principles:
// 1. Shapes are defined as only their corner/vertex points (no interpolation)
// 2. Each consecutive pair of vertices gets its own OSRM routing call
// 3. This allows backtracking and retracing streets, essential for letters and complex shapes
// 4. Shapes are scaled large enough for OSRM to find sensible street paths

export interface LatLng {
  lat: number;
  lng: number;
}

export interface RouteResult {
  waypoints: LatLng[];
  routeGeometry: LatLng[]; // full polyline snapped to roads
  distanceKm: number;
  durationMinutes: number;
}

// Convert normalized [0..1] shape vertices to lat/lng coordinates
// centered on a location. `sizeKm` is the approximate extent of the shape's largest dimension.
export function shapeToGeoPoints(
  shapePoints: [number, number][],
  center: LatLng,
  sizeKm: number
): LatLng[] {
  if (shapePoints.length === 0) return [];

  const kmPerDegLat = 111.32;
  const kmPerDegLng = 111.32 * Math.cos((center.lat * Math.PI) / 180);

  // Find bounding box in normalized space
  const xs = shapePoints.map(p => p[0]);
  const ys = shapePoints.map(p => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const shapeSpan = Math.max(maxX - minX, maxY - minY);
  if (shapeSpan === 0) return [];

  const scale = sizeKm / shapeSpan;

  return shapePoints.map(([x, y]) => ({
    lat: center.lat - ((y - cy) * scale) / kmPerDegLat,
    lng: center.lng + ((x - cx) * scale) / kmPerDegLng,
  }));
}

// Decode OSRM polyline (polyline6 encoding)
function decodePolyline(encoded: string, precision = 6): LatLng[] {
  const factor = Math.pow(10, precision);
  const coords: LatLng[] = [];
  let lat = 0, lng = 0, index = 0;

  while (index < encoded.length) {
    let shift = 0, result = 0, byte: number;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0; result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    coords.push({ lat: lat / factor, lng: lng / factor });
  }
  return coords;
}

// Route a single segment (2 points) through OSRM walking profile
async function routeSegment(from: LatLng, to: LatLng): Promise<{
  geometry: LatLng[];
  distance: number;
  duration: number;
}> {
  const coords = `${from.lng},${from.lat};${to.lng},${to.lat}`;
  const url = `https://router.project-osrm.org/route/v1/foot/${coords}?overview=full&geometries=polyline6&steps=false`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`OSRM request failed: ${res.status}`);

  const data = await res.json();
  if (data.code !== "Ok") throw new Error(`OSRM error: ${data.code} - ${data.message || ""}`);

  const route = data.routes[0];
  return {
    geometry: decodePolyline(route.geometry, 6),
    distance: route.distance,
    duration: route.duration,
  };
}

// Skip duplicate/near-duplicate consecutive points that would create zero-length segments
function deduplicatePoints(points: LatLng[], thresholdDeg = 0.00005): LatLng[] {
  if (points.length === 0) return [];
  const result = [points[0]];
  for (let i = 1; i < points.length; i++) {
    const prev = result[result.length - 1];
    const curr = points[i];
    const dLat = Math.abs(curr.lat - prev.lat);
    const dLng = Math.abs(curr.lng - prev.lng);
    if (dLat > thresholdDeg || dLng > thresholdDeg) {
      result.push(curr);
    }
  }
  return result;
}

// Main routing function: routes each consecutive vertex pair independently.
// Since shapes now only contain key vertices (not dense intermediate points),
// each OSRM call connects two meaningful, well-spaced points.
export async function getOSRMRoute(waypoints: LatLng[]): Promise<RouteResult> {
  const cleaned = deduplicatePoints(waypoints);

  if (cleaned.length < 2) {
    throw new Error("Need at least 2 waypoints");
  }

  // Build list of segment pairs
  const segments: { from: LatLng; to: LatLng }[] = [];
  for (let i = 0; i < cleaned.length - 1; i++) {
    segments.push({ from: cleaned[i], to: cleaned[i + 1] });
  }

  const allGeometry: LatLng[] = [];
  let totalDistance = 0;
  let totalDuration = 0;

  // Route segments in parallel batches of 6 to respect OSRM rate limits
  const batchSize = 6;
  for (let i = 0; i < segments.length; i += batchSize) {
    const batch = segments.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(seg => routeSegment(seg.from, seg.to))
    );

    for (const result of results) {
      // Remove duplicate junction point between consecutive segments
      if (allGeometry.length > 0 && result.geometry.length > 0) {
        result.geometry.shift();
      }
      allGeometry.push(...result.geometry);
      totalDistance += result.distance;
      totalDuration += result.duration;
    }
  }

  return {
    waypoints: cleaned,
    routeGeometry: allGeometry,
    distanceKm: totalDistance / 1000,
    durationMinutes: totalDuration / 60,
  };
}

// Geocode a city/address using Nominatim
export async function geocode(query: string): Promise<{ lat: number; lng: number; displayName: string }[]> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;
  const res = await fetch(url, {
    headers: { "User-Agent": "RouteArt/1.0" },
  });
  if (!res.ok) throw new Error("Geocoding failed");
  const data = await res.json();
  return data.map((r: { lat: string; lon: string; display_name: string }) => ({
    lat: parseFloat(r.lat),
    lng: parseFloat(r.lon),
    displayName: r.display_name,
  }));
}
