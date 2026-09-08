import { useState, useCallback } from "react";
import CitySearch from "./components/CitySearch";
import ShapePicker from "./components/ShapePicker";
import RouteMap from "./components/RouteMap";
import { type Shape } from "./lib/shapes";
import { wordToPoints } from "./lib/letters";
import {
  shapeToGeoPoints,
  getOSRMRoute,
  type RouteResult,
} from "./lib/routing";
import { downloadGPX } from "./lib/gpx";

type Mode = "shape" | "word";

const SIZE_PRESETS = [
  { label: "S", km: 1.5, desc: "~1 mi across" },
  { label: "M", km: 3.0, desc: "~2 mi across" },
  { label: "L", km: 5.0, desc: "~3 mi across" },
  { label: "XL", km: 8.0, desc: "~5 mi across" },
];

export default function App() {
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState("");
  const [mode, setMode] = useState<Mode>("shape");
  const [selectedShape, setSelectedShape] = useState<Shape | null>(null);
  const [word, setWord] = useState("");
  const [sizeIndex, setSizeIndex] = useState(1); // default M
  const [pace, setPace] = useState<"walk" | "run">("run");

  const [route, setRoute] = useState<RouteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sizeKm = SIZE_PRESETS[sizeIndex].km;

  const canGenerate =
    center &&
    ((mode === "shape" && selectedShape) ||
      (mode === "word" && word.trim().length > 0));

  const generateRoute = useCallback(async () => {
    if (!center) return;

    const points =
      mode === "shape" && selectedShape
        ? selectedShape.points
        : wordToPoints(word.trim());

    if (points.length < 2) {
      setError("Shape needs at least 2 points");
      return;
    }

    setLoading(true);
    setError("");
    setRoute(null);

    try {
      const geoPoints = shapeToGeoPoints(points, center, sizeKm);
      const result = await getOSRMRoute(geoPoints);
      setRoute(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Route generation failed");
    } finally {
      setLoading(false);
    }
  }, [center, mode, selectedShape, word, sizeKm]);

  const paceMinPerKm = pace === "run" ? 5.5 : 10;
  const estimatedTime = route
    ? Math.round(route.distanceKm * paceMinPerKm)
    : null;

  const routeName =
    mode === "shape" && selectedShape
      ? `RouteArt - ${selectedShape.name}`
      : `RouteArt - ${word.toUpperCase()}`;

  function formatTime(minutes: number): string {
    if (minutes >= 60) {
      return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  }

  return (
    <div className="bg-gray-950 text-white flex flex-col lg:flex-row lg:h-screen">
      {/* Sidebar */}
      <div className="w-full lg:w-96 p-4 lg:p-6 flex flex-col gap-4 lg:h-screen lg:overflow-y-auto shrink-0 border-b lg:border-b-0 lg:border-r border-gray-800">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="text-3xl">🏃</div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              RouteArt
            </h1>
            <p className="text-xs text-gray-400">Draw art with your runs</p>
          </div>
        </div>

        {/* City Search */}
        <CitySearch
          onSelect={(lat, lng, name) => {
            setCenter({ lat, lng });
            setLocationName(name.split(",").slice(0, 2).join(","));
          }}
        />

        {center && (
          <div className="text-xs text-green-400">
            📍 {locationName}
          </div>
        )}

        {/* Mode Toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Mode</label>
          <div className="flex gap-2">
            {(["shape", "word"] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  mode === m
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                {m === "shape" ? "🎨 Shape" : "✏️ Word"}
              </button>
            ))}
          </div>
        </div>

        {/* Shape Picker or Word Input */}
        {mode === "shape" ? (
          <ShapePicker
            selected={selectedShape}
            onSelect={setSelectedShape}
            mode={mode}
          />
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Type a Word
            </label>
            <input
              type="text"
              value={word}
              onChange={e => setWord(e.target.value.slice(0, 8))}
              placeholder="e.g. HELLO"
              maxLength={8}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase tracking-widest text-lg"
            />
            <p className="text-xs text-gray-500 mt-1">Max 8 characters. Letters, numbers, spaces.</p>
          </div>
        )}

        {/* Shape Size Control */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Shape Size
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {SIZE_PRESETS.map((preset, i) => (
              <button
                key={preset.label}
                onClick={() => setSizeIndex(i)}
                className={`py-2 rounded-lg text-center transition-all ${
                  sizeIndex === i
                    ? "bg-indigo-600 text-white ring-1 ring-indigo-400"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                <div className="text-sm font-bold">{preset.label}</div>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1.5">
            {SIZE_PRESETS[sizeIndex].desc} across, distance depends on shape complexity
          </p>
        </div>

        {/* Pace Selector */}
        <div className="flex gap-2">
          {(["run", "walk"] as const).map(p => (
            <button
              key={p}
              onClick={() => setPace(p)}
              className={`flex-1 py-1.5 rounded-lg text-sm transition-all ${
                pace === p
                  ? "bg-gray-700 text-white"
                  : "bg-gray-800 text-gray-500 hover:bg-gray-750"
              }`}
            >
              {p === "run" ? "🏃 Run" : "🚶 Walk"}
            </button>
          ))}
        </div>

        {/* Generate Button */}
        <button
          onClick={generateRoute}
          disabled={!canGenerate || loading}
          className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${
            canGenerate && !loading
              ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
              : "bg-gray-800 text-gray-500 cursor-not-allowed"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generating Route...
            </span>
          ) : (
            "Generate Route"
          )}
        </button>

        {/* Error */}
        {error && (
          <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Route Info */}
        {route && (
          <div className="bg-gray-800/50 rounded-xl p-4 space-y-3">
            <h3 className="font-semibold text-gray-200">Route Details</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-gray-500">Distance</div>
                <div className="font-medium">
                  {route.distanceKm.toFixed(1)} km
                  <span className="text-gray-500 ml-1">
                    ({(route.distanceKm / 1.60934).toFixed(1)} mi)
                  </span>
                </div>
              </div>
              <div>
                <div className="text-gray-500">Est. Time</div>
                <div className="font-medium">
                  {estimatedTime !== null && formatTime(estimatedTime)}
                  <span className="text-gray-500 ml-1">({pace})</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => downloadGPX(route.routeGeometry, routeName)}
                className="flex-1 py-2 bg-green-600 hover:bg-green-500 text-white text-sm rounded-lg font-medium transition-all"
              >
                📥 Download GPX
              </button>
              <button
                onClick={generateRoute}
                className="py-2 px-3 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-all"
                title="Regenerate route"
              >
                🔄
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Works with Strava, Garmin Connect, Komoot, Apple Watch & more
            </p>
          </div>
        )}

        {/* Tips */}
        {!route && !loading && (
          <div className="mt-auto text-xs text-gray-600 space-y-1">
            <p>💡 Dense city grids (NYC, Chicago) work best for shape fidelity.</p>
            <p>💡 Larger sizes give more room for the shape to breathe on the streets.</p>
          </div>
        )}
      </div>

      {/* Map */}
      <div className="flex-1 min-h-[50vh] lg:min-h-0">
        <RouteMap
          center={center}
          routeGeometry={route?.routeGeometry ?? []}
          waypoints={route?.waypoints ?? []}
        />
      </div>
    </div>
  );
}
