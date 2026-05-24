# Release Checklist

## Requirements

- Node `>=22.13`
- pnpm `11.3.0`
- npm account with publish access to the `@webaudio-kit` scope
- GitHub secret `NPM_TOKEN` with bypass 2FA enabled, or npm trusted publishing

The package names are:

- `@webaudio-kit/core`
- `@webaudio-kit/react`
- `@webaudio-kit/cli`

Before the first publish, npm may return `404` for both package names. A real
publish still requires access to the npm `@webaudio-kit` scope.

## Preflight

```sh
pnpm install --frozen-lockfile
pnpm release:check:full
pnpm release:verify-tag v1.5.1
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

## Manual Publish Fallback

Use this only if the GitHub workflow is not configured yet.

```sh
pnpm release:check:full
pnpm release:verify-tag v1.5.1
pnpm release:dry-run
npm whoami
pnpm release:publish-tarballs .release-packages
```

Do not publish if manual audio QA has not been completed.

## Trusted Publishing

If npm trusted publishing is configured, it should point to:

```txt
GitHub owner: i-afaqrashid
Repository: webaudio-kit
Workflow filename: publish.yml
Allowed action: npm publish
```

The publish workflow already includes `id-token: write`. If token publishing is
used instead, the token must be able to publish without an OTP prompt.
