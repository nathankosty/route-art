import { useEffect, useRef } from "react";
import L from "leaflet";
import type { LatLng } from "../lib/routing";

interface Props {
  center: { lat: number; lng: number } | null;
  routeGeometry: LatLng[];
  waypoints: LatLng[];
}

export default function RouteMap({ center, routeGeometry, waypoints }: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const waypointLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView([40.7128, -74.006], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update center
  useEffect(() => {
    if (!mapRef.current || !center) return;
    mapRef.current.setView([center.lat, center.lng], 14, { animate: true });
  }, [center]);

  // Update route display
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear previous route
    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }
    if (waypointLayerRef.current) {
      map.removeLayer(waypointLayerRef.current);
      waypointLayerRef.current = null;
    }

    if (routeGeometry.length === 0) return;

    // Draw the route
    const polyline = L.polyline(
      routeGeometry.map(p => [p.lat, p.lng] as L.LatLngTuple),
      {
        color: "#6366f1",
        weight: 4,
        opacity: 0.9,
        lineJoin: "round",
      }
    ).addTo(map);
    routeLayerRef.current = polyline;

    // Draw waypoint markers (small dots)
    const waypointGroup = L.layerGroup().addTo(map);
    if (waypoints.length > 0) {
      // Start marker
      L.circleMarker([waypoints[0].lat, waypoints[0].lng], {
        radius: 7,
        color: "#22c55e",
        fillColor: "#22c55e",
        fillOpacity: 1,
        weight: 2,
      })
        .bindTooltip("Start", { permanent: false })
        .addTo(waypointGroup);

      // End marker
      const last = waypoints[waypoints.length - 1];
      L.circleMarker([last.lat, last.lng], {
        radius: 7,
        color: "#ef4444",
        fillColor: "#ef4444",
        fillOpacity: 1,
        weight: 2,
      })
        .bindTooltip("End", { permanent: false })
        .addTo(waypointGroup);
    }
    waypointLayerRef.current = waypointGroup;

    // Fit map to route bounds
    map.fitBounds(polyline.getBounds().pad(0.1));
  }, [routeGeometry, waypoints]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-xl overflow-hidden border border-gray-700"
    />
  );
}
