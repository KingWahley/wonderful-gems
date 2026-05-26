"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, Loader2 } from "lucide-react";

// Standard ISO code to Unicode Flag Emoji converter
export const getFlagEmoji = (countryCode) => {
  if (!countryCode) return "";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

let locationsPromise = null;
const fetchLocationsGlobal = () => {
  if (!locationsPromise) {
    locationsPromise = fetch("/api/locations")
      .then(res => res.json())
      .catch(err => {
        console.error("Autocomplete fetch error", err);
        return [];
      });
  }
  return locationsPromise;
};

export default function LocationAutocomplete({
  value = "",
  onChange,
  type = "country", // "country" | "city"
  countryContext = "", // For city filtering, e.g. "Nigeria"
  placeholder = "",
  className = "",
  id = ""
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState([]);
  
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Load locations once globally
  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchLocationsGlobal().then(data => {
      if (active) {
        setLocations(data || []);
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, []);

  // Filter recommendations based on input and context
  useEffect(() => {
    if (!value || !isOpen) {
      setSuggestions([]);
      return;
    }

    const query = value.toLowerCase().trim();

    if (type === "country") {
      // Fuzzy and partial match countries
      const filtered = locations.filter(item => {
        const name = item.country.toLowerCase();
        return name.includes(query);
      });
      // Limit to top 8 suggestions
      setSuggestions(filtered.slice(0, 8));
    } else if (type === "city") {
      // Find the matched country context first
      let searchCities = [];
      if (countryContext) {
        const countryObj = locations.find(
          c => c.country.toLowerCase() === countryContext.toLowerCase()
        );
        searchCities = countryObj ? countryObj.cities : [];
      } else {
        // Flatten all cities across all countries
        searchCities = locations.flatMap(c => c.cities);
      }

      // Unique and filter
      const uniqueCities = Array.from(new Set(searchCities));
      const filtered = uniqueCities
        .filter(city => city.toLowerCase().includes(query))
        .map(city => {
          // Find which country this city belongs to
          const countryObj = locations.find(c => c.cities.includes(city));
          return {
            city,
            country: countryObj ? countryObj.country : "",
            iso2: countryObj ? countryObj.iso2 : ""
          };
        });

      setSuggestions(filtered.slice(0, 8));
    }
  }, [value, isOpen, type, countryContext, locations]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle Keyboard Navigation
  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex(prev => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        handleSelect(suggestions[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleSelect = (item) => {
    if (type === "country") {
      onChange(item.country, item.iso2); // Return selected country name & ISO2
    } else {
      onChange(item.city, item.iso2); // Return selected city name & ISO2
    }
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        id={id}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
          setHighlightedIndex(-1);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />
      
      {loading && isOpen && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <Loader2 className="animate-spin text-brand-muted" size={14} />
        </div>
      )}

      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 mt-1 w-full bg-white border border-brand-border rounded-xl shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-100 max-h-60 overflow-y-auto scrollbar-luxury font-sans text-xs">
          {suggestions.map((item, idx) => {
            const isHighlighted = idx === highlightedIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setHighlightedIndex(idx)}
                className={`w-full text-left px-4 py-2.5 transition-colors flex items-center justify-between cursor-pointer ${
                  isHighlighted ? "bg-brand-bg text-brand-ink" : "text-brand-ink"
                }`}
              >
                {type === "country" ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm shrink-0">{getFlagEmoji(item.iso2)}</span>
                    <span className="font-medium text-brand-ink">{item.country}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <MapPin size={12} className="text-brand-muted animate-pulse" />
                    <div>
                      <span className="font-semibold text-brand-ink">{item.city}</span>
                      {item.country && (
                        <span className="text-[10px] text-brand-muted ml-1">
                          ({getFlagEmoji(item.iso2)} {item.country})
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
