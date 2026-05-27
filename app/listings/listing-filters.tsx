"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useRef } from "react";
import { MapPin } from "lucide-react";

interface Props {
  maxRentCeiling: number;
  locations: { city: string; state: string }[];
}

export function ListingFilters({ locations }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locationInputRef = useRef<HTMLInputElement>(null);

  const beds = searchParams.get("beds") || "";
  const maxRent = searchParams.get("maxRent") || "";
  const sort = searchParams.get("sort") || "newest";
  const location = searchParams.get("location") || "";

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const hasFilters = beds || maxRent || sort !== "newest" || location;

  return (
    <div className="space-y-3 mb-8">
      {/* Location search */}
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5 max-w-sm">
        <MapPin size={14} className="text-gray-400 shrink-0" />
        <input
          ref={locationInputRef}
          type="text"
          placeholder="City, state, or zip…"
          defaultValue={location}
          onBlur={(e) => update("location", e.target.value.trim())}
          onKeyDown={(e) => {
            if (e.key === "Enter") update("location", (e.target as HTMLInputElement).value.trim());
          }}
          className="flex-1 text-sm focus:outline-none text-gray-800 placeholder:text-gray-400 min-w-0"
        />
        {location && (
          <button
            onClick={() => {
              if (locationInputRef.current) locationInputRef.current.value = "";
              update("location", "");
            }}
            className="text-gray-300 hover:text-gray-500 text-xs ml-1"
          >
            ✕
          </button>
        )}
      </div>

      {/* Distinct city chips (if few enough) */}
      {locations.length > 0 && locations.length <= 8 && !location && (
        <div className="flex flex-wrap gap-1.5">
          {locations.map((loc) => (
            <button
              key={`${loc.city}-${loc.state}`}
              onClick={() => {
                const val = `${loc.city}, ${loc.state}`;
                if (locationInputRef.current) locationInputRef.current.value = val;
                update("location", val);
              }}
              className="text-xs px-2.5 py-1 bg-white border border-gray-200 rounded-full text-gray-600 hover:border-primary/40 hover:text-primary transition-colors"
            >
              {loc.city}, {loc.state}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {/* Beds */}
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl px-1 py-1">
          {["", "1", "2", "3"].map((b) => (
            <button
              key={b}
              onClick={() => update("beds", b)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${beds === b ? "bg-primary text-white font-medium" : "text-gray-500 hover:text-gray-800"}`}
            >
              {b === "" ? "Any beds" : b === "3" ? "3+ bd" : `${b} bd`}
            </button>
          ))}
        </div>

        {/* Max rent */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
          <span className="text-xs text-gray-500 shrink-0">Max rent</span>
          <input
            type="number"
            min={0}
            step={100}
            placeholder="Any"
            defaultValue={maxRent}
            onBlur={(e) => update("maxRent", e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") update("maxRent", (e.target as HTMLInputElement).value); }}
            className="w-24 text-sm focus:outline-none text-gray-800 placeholder:text-gray-400"
          />
          <span className="text-xs text-gray-400">/mo</span>
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => update("sort", e.target.value)}
          className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="newest">Newest first</option>
          <option value="rent_asc">Rent: low to high</option>
          <option value="rent_desc">Rent: high to low</option>
          <option value="beds_desc">Most bedrooms</option>
        </select>

        {hasFilters && (
          <button
            onClick={() => {
              if (locationInputRef.current) locationInputRef.current.value = "";
              router.push(pathname);
            }}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
