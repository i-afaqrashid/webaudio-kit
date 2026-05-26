# Docs Fetch Access

This note records the deployed docs fetch check for developer tooling, crawlers,
and LLM-based coding agents.

Checked on 2026-05-26 against:

```txt
https://webaudio-kit.afaqrashid.com/docs
```

## User Agent Results

All tested user agents returned HTTP 200 for the hosted docs page.

| User agent                                                                 | Result   |
| -------------------------------------------------------------------------- | -------- |
| `curl/8.7.1`                                                               | HTTP 200 |
| `Wget/1.21.4`                                                              | HTTP 200 |
| `python-requests/2.32.3`                                                   | HTTP 200 |
| `Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)` | HTTP 200 |
| `ChatGPT-User/1.0`                                                         | HTTP 200 |
| `ClaudeBot/1.0`                                                            | HTTP 200 |

The deployed site also sends `access-control-allow-origin: *`, so basic fetch
clients can read the HTML response without a browser session.

## Fallbacks

The hosted site now exposes:

- `https://webaudio-kit.afaqrashid.com/llms.txt`
- `https://webaudio-kit.afaqrashid.com/robots.txt`

The canonical Markdown fallback remains the repository docs directory:

```txt
https://github.com/i-afaqrashid/webaudio-kit/tree/main/docs
```

Use Markdown docs when a tool cannot render the hosted Next.js pages, strips
client-side navigation, or needs stable source links for review.
