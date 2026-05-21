"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Search, X } from "lucide-react";

export interface TextFilterConfig {
  type: "text";
  key: string;
  placeholder: string;
  debounce?: number;
}

export interface SelectFilterConfig {
  type: "select";
  key: string;
  placeholder: string;
  options: { value: string; label: string }[];
}

export type FilterConfig = TextFilterConfig | SelectFilterConfig;

interface FilterBarProps {
  filters: FilterConfig[];
  onFilterChange: (params: Record<string, string>, hasFilters: boolean) => void;
  className?: string;
}

export function FilterBar({ filters, onFilterChange, className }: FilterBarProps) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(filters.map((f) => [f.key, ""]))
  );
  const [debouncedText, setDebouncedText] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      filters.filter((f) => f.type === "text").map((f) => [f.key, ""])
    )
  );

  const textFilters = useMemo(
    () => filters.filter((f): f is TextFilterConfig => f.type === "text"),
    [filters]
  );

  // Stable string key for text input values — used as debounce effect dep
  const textValuesKey = textFilters.map((f) => values[f.key] ?? "").join("\0");

  // Debounce text inputs; bail out if value didn't actually change
  useEffect(() => {
    const timers = textFilters.map((f) => {
      const delay = f.debounce ?? 400;
      return setTimeout(() => {
        const trimmed = values[f.key]?.trim() ?? "";
        setDebouncedText((prev) =>
          prev[f.key] === trimmed ? prev : { ...prev, [f.key]: trimmed }
        );
      }, delay);
    });
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textValuesKey]);

  // Stable string keys for the notification memo — only change when committed values change.
  // Text: uses debouncedText (not raw values) so typing doesn't trigger early.
  // Select: uses values directly.
  const debouncedTextKey = textFilters.map((f) => debouncedText[f.key] ?? "").join("\0");
  const selectValuesKey = filters
    .filter((f) => f.type === "select")
    .map((f) => values[f.key])
    .join("\0");

  // Recomputes only when a committed value changes — not on every keystroke
  const effective = useMemo(() => {
    const result: Record<string, string> = {};
    for (const f of filters) {
      result[f.key] = f.type === "text" ? (debouncedText[f.key] ?? "") : values[f.key];
    }
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedTextKey, selectValuesKey]);

  // Keep onFilterChange in a ref so it's never a useEffect dep.
  // This prevents re-runs when the parent passes a new function reference on re-render.
  const onFilterChangeRef = useRef(onFilterChange);
  useEffect(() => {
    onFilterChangeRef.current = onFilterChange;
  });

  // Notify parent only when effective values change; skip initial mount
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const params = Object.fromEntries(
      Object.entries(effective).filter(([, v]) => v !== "")
    );
    onFilterChangeRef.current(params, Object.keys(params).length > 0);
  }, [effective]);

  const clear = () => {
    const empty = Object.fromEntries(filters.map((f) => [f.key, ""]));
    setValues(empty);
    setDebouncedText(Object.fromEntries(textFilters.map((f) => [f.key, ""])));
  };

  const hasFilters = Object.values(values).some((v) => v !== "");

  return (
    <div className={`flex flex-wrap gap-2${className ? ` ${className}` : ""}`}>
      {filters.map((filter) => {
        if (filter.type === "text") {
          return (
            <div key={filter.key} className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder={filter.placeholder}
                value={values[filter.key]}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [filter.key]: e.target.value }))
                }
                className="pl-8 pr-3 py-1.5 text-xs border border-zinc-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#ce7d0a] w-44"
              />
            </div>
          );
        }

        return (
          <select
            key={filter.key}
            value={values[filter.key]}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, [filter.key]: e.target.value }))
            }
            className="px-3 py-1.5 text-xs border border-zinc-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#ce7d0a]"
          >
            <option value="">{filter.placeholder}</option>
            {filter.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      })}

      {hasFilters && (
        <button
          onClick={clear}
          className="flex items-center gap-1 px-3 py-1.5 text-xs text-zinc-600 border border-zinc-300 rounded-lg bg-white hover:bg-zinc-50 transition-colors"
        >
          <X className="w-3 h-3" />
          Limpar
        </button>
      )}
    </div>
  );
}
