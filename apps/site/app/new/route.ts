import { NextResponse } from "next/server";
import { stackBlitzStarterUrl } from "../playground-links";

// Keep the literal starter URL visible for tests and quick source inspection:
// https://stackblitz.com/fork/github/i-afaqrashid/webaudio-kit/tree/main/examples/vite-react
export function GET() {
  return NextResponse.redirect(stackBlitzStarterUrl, 307);
}
