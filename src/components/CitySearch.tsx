import { useState, useRef } from "react";
import { geocode } from "../lib/routing";

interface Props {
  onSelect: (lat: number, lng: number, name: string) => void;
}

export default function CitySearch({ onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ lat: number; lng: number; displayName: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleInput(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length < 3) {
      setResults([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await geocode(value);
        setResults(res);
        setOpen(res.length > 0);
      } catch {
        setResults([]);
      }
      setLoading(false);
    }, 400);
  }

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-300 mb-1">Starting Location</label>
      <input
        type="text"
        value={query}
        onChange={e => handleInput(e.target.value)}
        placeholder="Search city or address..."
        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      {loading && (
        <div className="absolute right-3 top-9 text-gray-400 text-sm">...</div>
      )}
      {open && results.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl max-h-60 overflow-auto">
          {results.map((r, i) => (
            <li
              key={i}
              className="px-3 py-2 hover:bg-gray-700 cursor-pointer text-sm text-gray-200 border-b border-gray-700 last:border-0"
              onClick={() => {
                onSelect(r.lat, r.lng, r.displayName);
                setQuery(r.displayName.split(",").slice(0, 2).join(","));
                setOpen(false);
              }}
            >
              {r.displayName}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
