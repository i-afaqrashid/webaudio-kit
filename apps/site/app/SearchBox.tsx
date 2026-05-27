"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

type SearchEntry = {
  title: string;
  url: string;
  excerpt: string;
  body: string;
};

const MAX_RESULTS = 6;

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1);
}

function scoreEntry(entry: SearchEntry, tokens: string[]): number {
  if (tokens.length === 0) {
    return 0;
  }
  const title = entry.title.toLowerCase();
  const body = entry.body.toLowerCase();
  let score = 0;
  let matched = 0;
  for (const token of tokens) {
    const inTitle = title.includes(token);
    const inBody = body.includes(token);
    if (inTitle) {
      score += 8;
      matched += 1;
    } else if (inBody) {
      score += 2;
      matched += 1;
    }
  }
  return matched === tokens.length ? score : 0;
}

export function SearchBox() {
  const [entries, setEntries] = useState<SearchEntry[] | null>(null);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputId = useId();

  useEffect(() => {
    let cancelled = false;
    fetch("/docs-search-index.json")
      .then((response) => (response.ok ? response.json() : []))
      .then((data: SearchEntry[]) => {
        if (!cancelled) {
          setEntries(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setEntries([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    function handleClickAway(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickAway);
    return () => document.removeEventListener("mousedown", handleClickAway);
  }, [isOpen]);

  const results = useMemo(() => {
    if (!entries || query.trim().length < 2) {
      return [];
    }
    const tokens = tokenize(query);
    return entries
      .map((entry) => ({ entry, score: scoreEntry(entry, tokens) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_RESULTS)
      .map(({ entry }) => entry);
  }, [entries, query]);

  return (
    <div
      className="docsSearch"
      ref={containerRef}
      role="search"
      aria-label="Search documentation"
    >
      <label className="docsSearchLabel" htmlFor={inputId}>
        Search docs
      </label>
      <input
        id={inputId}
        type="search"
        autoComplete="off"
        placeholder="Search docs"
        value={query}
        onChange={(event) => {
          setQuery(event.currentTarget.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        className="docsSearchInput"
      />
      {isOpen && query.trim().length >= 2 ? (
        <ul className="docsSearchResults" role="listbox">
          {results.length === 0 ? (
            <li className="docsSearchEmpty" role="presentation">
              No matches.
            </li>
          ) : (
            results.map((entry) => (
              <li key={entry.url} role="option" aria-selected="false">
                <a
                  href={entry.url}
                  onClick={() => {
                    setIsOpen(false);
                    setQuery("");
                  }}
                >
                  <strong>{entry.title}</strong>
                  <span>{entry.excerpt}</span>
                </a>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
