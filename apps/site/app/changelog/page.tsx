import type { Metadata } from "next";
import Link from "next/link";
import {
  getChangelogReleases,
  getGitHubReleaseUrl,
  getPackageLinks,
} from "./changelog-data";
import { PageShell } from "../components";

export const metadata: Metadata = {
  title: "Changelog",
  description:
    "Versioned release history for webaudio-kit packages, GitHub Releases, and npm package pages.",
};

export default function ChangelogPage() {
  const releases = getChangelogReleases();
  const latestRelease = releases[0];

  return (
    <PageShell active="changelog">
      <main className="docPage">
        <section className="docHero changelogHero">
          <div className="wrap">
            <span className="kicker">Release notes</span>
            <h1>Release history.</h1>
            <p>
              Every public package release is tracked from the root changelog,
              with direct links to GitHub Releases and npm package pages.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="wrap changelogLayout">
            <aside className="releaseAside" aria-label="Release shortcuts">
              {latestRelease ? (
                <div className="latestReleaseCard">
                  <span className="kicker">Latest</span>
                  <strong>{latestRelease.version}</strong>
                  <span>{formatDate(latestRelease.date)}</span>
                  <a
                    aria-label={`Latest GitHub release v${latestRelease.version}`}
                    href={getGitHubReleaseUrl(latestRelease.version)}
                    rel="noreferrer"
                    target="_blank"
                  >
                    GitHub release v{latestRelease.version}
                  </a>
                </div>
              ) : null}
              <nav className="releaseNav" aria-label="Changelog versions">
                {releases.map((release) => (
                  <a href={`#v${release.version}`} key={release.version}>
                    {release.version}
                  </a>
                ))}
              </nav>
            </aside>

            <div className="releaseList">
              {latestRelease ? (
                <section className="releaseIntro" aria-label="Current release">
                  <span className="kicker">Current stable release</span>
                  <h2>Latest package set: {latestRelease.version}</h2>
                  <p>
                    The current release publishes through{" "}
                    <strong>npm Trusted Publishing</strong>, creates GitHub
                    Release notes from this changelog, and includes package
                    tarballs on the release page.
                  </p>
                  <div className="releaseActionLinks">
                    <Link className="button buttonPrimary" href="/docs">
                      Read docs
                    </Link>
                    <a
                      aria-label={`Current GitHub release v${latestRelease.version}`}
                      className="button"
                      href={getGitHubReleaseUrl(latestRelease.version)}
                      rel="noreferrer"
                      target="_blank"
                    >
                      GitHub release v{latestRelease.version}
                    </a>
                  </div>
                </section>
              ) : null}

              {releases.map((release) => (
                <article
                  className="releaseCard"
                  id={`v${release.version}`}
                  key={release.version}
                >
                  <div className="releaseHeader">
                    <div>
                      <span className="kicker">{formatDate(release.date)}</span>
                      <h2>{release.version}</h2>
                    </div>
                    <a
                      href={getGitHubReleaseUrl(release.version)}
                      rel="noreferrer"
                      target="_blank"
                    >
                      GitHub release v{release.version}
                    </a>
                  </div>

                  <div className="releaseSections">
                    {release.sections.map((section) => (
                      <section key={section.title}>
                        <h3>{section.title}</h3>
                        <ul>
                          {section.items.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </section>
                    ))}
                  </div>

                  <div
                    className="releasePackageLinks"
                    aria-label={`npm package links for ${release.version}`}
                  >
                    {getPackageLinks(release.version).map((pkg) => (
                      <a
                        href={pkg.href}
                        key={pkg.name}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {pkg.name} {release.version}
                      </a>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00.000Z`));
}
