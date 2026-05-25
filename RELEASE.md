# Release Checklist

## Requirements

- Node `>=22.13`
- pnpm `11.3.0`
- npm account with publish access to the `@webaudio-kit` scope
- GitHub environment `npm`
- npm trusted publishing configured for every published package

The package names are:

- `@webaudio-kit/core`
- `@webaudio-kit/react`
- `@webaudio-kit/cli`

The npm trusted publisher for each package must point to:

```txt
GitHub owner: i-afaqrashid
Repository: webaudio-kit
Workflow filename: publish.yml
Environment name: npm
Allowed action: npm publish
```

## Preflight

```sh
pnpm install --frozen-lockfile
pnpm release:check:full
pnpm release:verify-tag v1.5.1
pnpm release:notes v1.5.1
pnpm release:dry-run
```

Review:

- `CHANGELOG.md`
- `RELEASE_DRAFT.md`
- `README.md`
- `SECURITY.md`
- `SUPPORT.md`
- package READMEs in `packages/*/README.md`
- package changelog copies in `packages/*/CHANGELOG.md`
- package metadata in `packages/*/package.json`
- generated tarball contents under `.release-packages/`

`CHANGELOG.md` is the source of truth. Run `pnpm release:sync-changelogs` after
editing it so every npm package tarball carries the same version history.

## Tag Release

For version `1.5.1`:

```sh
git tag v1.5.1
git push origin v1.5.1
```

The GitHub release workflow is tag-gated. It checks that the tag matches the
package versions, verifies the workspace, audits dependencies, refuses to
republish versions already present on npm, then publishes the packed tarballs in
this order:

1. `@webaudio-kit/core`
2. `@webaudio-kit/react`
3. `@webaudio-kit/cli`

After npm publishing succeeds, the workflow generates release notes from the
matching `CHANGELOG.md` section, creates or updates the GitHub Release for the
tag, and uploads the package tarballs as release assets.

## Manual Publish Fallback

Use this only if GitHub Actions is unavailable and the npm owner account can
publish interactively with 2FA. Do not reintroduce token publishing for normal
releases.

```sh
pnpm release:check:full
pnpm release:verify-tag v1.5.1
pnpm release:notes v1.5.1 > .release-notes.md
pnpm release:dry-run
npm whoami
pnpm release:publish-tarballs .release-packages
gh release create v1.5.1 .release-packages/*.tgz \
  --title "webaudio-kit v1.5.1" \
  --notes-file .release-notes.md \
  --verify-tag
```

Do not publish if manual audio QA has not been completed.

## Release Notes

Public release history should appear in three places:

- `CHANGELOG.md` for source-controlled version history.
- GitHub Releases for tag pages, generated from `CHANGELOG.md`.
- npm package pages through package README release-history links.

Every package tarball also includes `CHANGELOG.md`, and `pnpm smoke:pack`
checks that the packed packages contain the current version notes.
