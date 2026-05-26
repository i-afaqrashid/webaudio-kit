import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const api = readFileSync("docs/api.md", "utf8");
const browserAudio = readFileSync("docs/browser-audio.md", "utf8");
const troubleshooting = readFileSync("docs/troubleshooting.md", "utf8");
const siteApi = readFileSync("apps/site/app/docs/api/page.tsx", "utf8");
const docsPage = readFileSync("apps/site/app/docs/page.tsx", "utf8");

test("Markdown docs explain AudioProvider state transitions", () => {
  assert.match(api, /## `AudioProvider` State Machine/);
  assert.match(
    api,
    /`idle` is a webaudio-kit state, not a native browser\s+`AudioContextState`/,
  );
  assert.match(api, /initial render/i);
  assert.match(api, /first user gesture/i);
  assert.match(api, /`suspended`/);
  assert.match(api, /`running`/);
  assert.match(api, /`closed`/);
  assert.match(api, /audio unavailable/i);
  assert.match(api, /function AudioStateBadge/);
});

test("Browser and troubleshooting docs link to the state model", () => {
  assert.match(browserAudio, /AudioProvider state/);
  assert.match(
    browserAudio,
    /\[AudioProvider state machine\]\(\.\/api\.md#audioprovider-state-machine\)/,
  );
  assert.match(troubleshooting, /Audio state stays `idle`/);
  assert.match(
    troubleshooting,
    /\[AudioProvider state machine\]\(\.\/api\.md#audioprovider-state-machine\)/,
  );
});

test("Website API docs expose custom idle state guidance", () => {
  assert.match(siteApi, /AudioProvider state machine/);
  assert.match(siteApi, /not a native\s+browser AudioContextState/);
  assert.match(siteApi, /AudioStateBadge/);
  assert.match(docsPage, /href="\/docs\/api#audio-provider-state-machine"/);
});
