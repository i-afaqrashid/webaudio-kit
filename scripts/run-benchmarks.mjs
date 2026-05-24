#!/usr/bin/env node
import { spawn } from "node:child_process";

const filteredLines = new Set([
  "Benchmarking is an experimental feature.",
  "Breaking changes might not follow SemVer, please pin Vitest's version when using it.",
]);

const child = spawn("pnpm", ["exec", "vitest", "bench", "--run"], {
  env: process.env,
  stdio: ["inherit", "pipe", "pipe"],
});

let stdoutRemainder = "";
let stderrRemainder = "";

child.stdout.on("data", (chunk) => {
  stdoutRemainder = writeFilteredLines(
    process.stdout,
    stdoutRemainder + chunk.toString("utf8"),
  );
});

child.stderr.on("data", (chunk) => {
  stderrRemainder = writeFilteredLines(
    process.stderr,
    stderrRemainder + chunk.toString("utf8"),
  );
});

child.on("close", (code, signal) => {
  flushRemainder(process.stdout, stdoutRemainder);
  flushRemainder(process.stderr, stderrRemainder);

  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});

function writeFilteredLines(stream, text) {
  const lines = text.split(/\r?\n/);
  const remainder = lines.pop() ?? "";

  for (const line of lines) {
    if (!filteredLines.has(line.trim())) {
      stream.write(`${line}\n`);
    }
  }

  return remainder;
}

function flushRemainder(stream, text) {
  if (text && !filteredLines.has(text.trim())) {
    stream.write(text);
  }
}
