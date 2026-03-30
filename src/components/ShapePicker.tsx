import { shapes, type Shape } from "../lib/shapes";

interface Props {
  selected: Shape | null;
  onSelect: (shape: Shape) => void;
  mode: "shape" | "word";
}

export default function ShapePicker({ selected, onSelect, mode }: Props) {
  if (mode !== "shape") return null;

  const categories = [
    { key: "basic", label: "Basic" },
    { key: "symbol", label: "Symbols" },
    { key: "animal", label: "Animals" },
    { key: "seasonal", label: "Seasonal" },
  ] as const;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">Choose a Shape</label>
      {categories.map(cat => {
        const items = shapes.filter(s => s.category === cat.key);
        if (items.length === 0) return null;
        return (
          <div key={cat.key} className="mb-3">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{cat.label}</div>
            <div className="grid grid-cols-4 gap-2">
              {items.map(shape => (
                <button
                  key={shape.name}
                  onClick={() => onSelect(shape)}
                  className={`flex flex-col items-center p-2 rounded-lg border transition-all ${
                    selected?.name === shape.name
                      ? "border-indigo-500 bg-indigo-500/20 ring-1 ring-indigo-500"
                      : "border-gray-700 bg-gray-800 hover:border-gray-500"
                  }`}
                >
                  <span className="text-2xl">{shape.icon}</span>
                  <span className="text-xs text-gray-300 mt-1">{shape.name}</span>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
