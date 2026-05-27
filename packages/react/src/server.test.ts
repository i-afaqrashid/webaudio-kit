import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  clampFrequency,
  DEFAULT_CONCERT_A,
  DEFAULT_GAIN,
  frequencyToNoteName,
  gainToDb,
  midiToFrequency,
} from "./server";

describe("@webaudio-kit/react/server", () => {
  test("re-exports the math helpers and constants from core", () => {
    expect(typeof clampFrequency).toBe("function");
    expect(typeof frequencyToNoteName).toBe("function");
    expect(typeof gainToDb).toBe("function");
    expect(typeof midiToFrequency).toBe("function");
    expect(DEFAULT_GAIN).toBeCloseTo(0.2);
    expect(DEFAULT_CONCERT_A).toBe(440);
  });

  test("frequencyToNoteName works without touching any client-only code", () => {
    expect(frequencyToNoteName(440)).toBe("A4");
    expect(midiToFrequency(69)).toBeCloseTo(440);
  });

  test("server entry source has no top-level 'use client' directive", () => {
    const source = readFileSync(
      resolve(process.cwd(), "packages/react/src/server.ts"),
      "utf8",
    );
    const firstNonCommentLine = source.split("\n").find((line) => {
      const trimmed = line.trim();
      return trimmed.length > 0 && !trimmed.startsWith("//");
    });
    expect(firstNonCommentLine).not.toBe('"use client";');
    expect(firstNonCommentLine).not.toBe("'use client';");
  });
});
