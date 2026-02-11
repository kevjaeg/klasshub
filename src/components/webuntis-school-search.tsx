"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, X, Search } from "lucide-react";

interface WebUntisSchool {
  server: string;
  loginName: string;
  displayName: string;
  address: string;
}

interface WebUntisSchoolSearchProps {
  onSelect: (config: { server: string; school: string }) => void;
  initialServer?: string;
  initialSchool?: string;
}

export function WebUntisSchoolSearch({
  onSelect,
  initialServer,
  initialSchool,
}: WebUntisSchoolSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<WebUntisSchool[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selected, setSelected] = useState<WebUntisSchool | null>(
    initialServer && initialSchool
      ? { server: initialServer, loginName: initialSchool, displayName: "", address: "" }
      : null
  );
  const [manualMode, setManualMode] = useState(false);
  const [manualServer, setManualServer] = useState(initialServer ?? "");
  const [manualSchool, setManualSchool] = useState(initialSchool ?? "");

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const search = useCallback(async (q: string) => {
    if (q.length < 3) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/webuntis-schools?q=${encodeURIComponent(q)}`
      );
      if (!res.ok) throw new Error();
      const data: WebUntisSchool[] = await res.json();
      setResults(data);
      setShowDropdown(true);
    } catch {
      setError("Suche fehlgeschlagen. Versuche es erneut.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleInputChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value), 300);
  }

  function handleSelect(school: WebUntisSchool) {
    setSelected(school);
    setShowDropdown(false);
    setQuery("");
    onSelect({ server: school.server, school: school.loginName });
  }

  function handleClear() {
    setSelected(null);
    setQuery("");
    setResults([]);
    onSelect({ server: "", school: "" });
  }

  function switchToManual() {
    setManualMode(true);
    setSelected(null);
    setShowDropdown(false);
    setQuery("");
    onSelect({ server: manualServer, school: manualSchool });
  }

  function switchToSearch() {
    setManualMode(false);
    onSelect({ server: "", school: "" });
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  if (manualMode) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="manual-server">Server *</Label>
          <Input
            id="manual-server"
            placeholder="z.B. neilo.webuntis.com"
            value={manualServer}
            onChange={(e) => {
              setManualServer(e.target.value);
              onSelect({ server: e.target.value, school: manualSchool });
            }}
            required
          />
          <p className="text-xs text-muted-foreground">
            Findest du in der URL wenn du WebUntis öffnest
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="manual-school">Schulkürzel *</Label>
          <Input
            id="manual-school"
            placeholder="z.B. gym-musterstadt"
            value={manualSchool}
            onChange={(e) => {
              setManualSchool(e.target.value);
              onSelect({ server: manualServer, school: e.target.value });
            }}
            required
          />
          <p className="text-xs text-muted-foreground">
            Der Kurzname deiner Schule in WebUntis
          </p>
        </div>
        <button
          type="button"
          onClick={switchToSearch}
          className="text-xs text-primary hover:underline"
        >
          Zurück zur Schulsuche
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3" ref={containerRef}>
      <Label>Schule suchen *</Label>

      {selected ? (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1 py-1.5 px-3 text-sm">
            {selected.displayName || selected.loginName}
            <button
              type="button"
              onClick={handleClear}
              className="ml-1 rounded-full hover:bg-muted"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Schulname eingeben, z.B. Gymnasium Berlin"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => results.length > 0 && setShowDropdown(true)}
            className="pl-9"
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}

          {showDropdown && (
            <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover shadow-md">
              {results.length === 0 ? (
                <div className="p-3 text-sm text-muted-foreground">
                  Keine Schulen gefunden.
                </div>
              ) : (
                results.map((school, i) => (
                  <button
                    key={`${school.server}-${school.loginName}-${i}`}
                    type="button"
                    onClick={() => handleSelect(school)}
                    className="w-full px-3 py-2 text-left hover:bg-accent transition-colors"
                  >
                    <div className="text-sm font-medium">
                      {school.displayName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {school.address}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}

      <button
        type="button"
        onClick={switchToManual}
        className="text-xs text-muted-foreground hover:text-foreground hover:underline"
      >
        Schule nicht gefunden? Manuell eingeben
      </button>
    </div>
  );
}
