# Release Checklist

## Requirements

- Node `>=20.10`
- pnpm `10.33.4`
- npm account with publish access to the `@webaudio-kit` scope
- GitHub secret `NPM_TOKEN` if using the release workflow

The package names are:

- `@webaudio-kit/core`
- `@webaudio-kit/react`

Before the first publish, npm may return `404` for both package names. A real
publish still requires access to the npm `@webaudio-kit` scope.

## Preflight

```sh
pnpm install --frozen-lockfile
pnpm release:check:full
pnpm release:verify-tag v0.1.0
pnpm release:dry-run
```

Review:

- `CHANGELOG.md`
- `README.md`
- `SECURITY.md`
- `SUPPORT.md`
- package metadata in `packages/*/package.json`
- generated tarball contents under `.release-packages/`

## Tag Release

For version `0.1.0`:

```sh
git tag v0.1.0
git push origin v0.1.0
```

The GitHub release workflow is tag-gated. It checks that the tag matches the
package versions, verifies the workspace, audits dependencies, runs browser demo
QA, refuses to republish versions already present on npm, then publishes the
packed tarballs in this order:

1. `@webaudio-kit/core`
2. `@webaudio-kit/react`

## Manual Publish Fallback

Use this only if the GitHub workflow is not configured yet.

```sh
pnpm release:check:full
pnpm release:verify-tag v0.1.0
pnpm release:dry-run
npm whoami
pnpm release:publish-tarballs .release-packages
```

Do not publish if manual audio QA has not been completed.
