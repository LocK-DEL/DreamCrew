import Link from "next/link";
import { profileCopy } from "@/content/profile-copy.mjs";
import type { LoadedPublicProfile } from "@/lib/profile/load-public-profile";
import type { Locale } from "@/types/content";

interface PublicProfileProps {
  locale: Locale;
  loaded: LoadedPublicProfile;
  completeness: number;
}

function mappedLabel(map: Record<string, string>, value: string | null, fallback = "") {
  return value ? map[value] ?? value : fallback;
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-black text-indigo-700 transition hover:-translate-y-0.5"
    >
      {children} ↗
    </a>
  );
}

export function PublicProfile({ locale, loaded, completeness }: PublicProfileProps) {
  const { profile, viewerIsOwner, ownerPreviewIsPrivate } = loaded;
  const copy = profileCopy[locale];
  const identityTypes = copy.identityTypes as Record<string, string>;
  const collaborationLabels = copy.collaborationLevels as Record<string, string>;
  const skillLevels = copy.skillLevels as Record<string, string>;
  const interestLabels = copy.interestLabels as Record<string, string>;
  const location = [profile.location.city, profile.location.countryCode].filter(Boolean).join(", ");
  const initials = profile.displayName.slice(0, 2).toUpperCase();
  const links = [
    [copy.portfolio, profile.links.portfolioUrl],
    [copy.github, profile.links.githubUrl],
    [copy.linkedin, profile.links.linkedinUrl],
  ].filter((item): item is [string, string] => Boolean(item[1]));

  return (
    <main className="px-5 pb-28 pt-12 lg:px-8 lg:pt-18">
      <div className="mx-auto max-w-6xl">
        {ownerPreviewIsPrivate ? (
          <div className="mb-6 flex flex-col justify-between gap-4 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-amber-950 sm:flex-row sm:items-center">
            <div>
              <p className="font-black">{copy.privatePreview}</p>
              <p className="mt-1 text-sm leading-6 text-amber-900/70">{copy.privatePreviewDescription}</p>
            </div>
            <Link href={`/${locale}/onboarding?step=3`} className="text-sm font-black underline underline-offset-4">
              {copy.editProfile}
            </Link>
          </div>
        ) : null}

        <section className="overflow-hidden rounded-[2.5rem] border border-[var(--border)] bg-white/78 shadow-[var(--shadow)]">
          <div className="h-36 bg-gradient-to-r from-indigo-700 via-violet-600 to-cyan-500 sm:h-44" />
          <div className="px-6 pb-8 sm:px-10 sm:pb-10">
            <div className="-mt-14 flex flex-col gap-6 sm:-mt-16 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
                <div
                  role="img"
                  aria-label={profile.displayName}
                  className="grid size-28 shrink-0 place-items-center rounded-[2rem] border-4 border-white bg-gradient-to-br from-indigo-100 to-violet-100 bg-cover bg-center text-3xl font-black text-indigo-800 shadow-xl sm:size-32"
                  style={profile.avatarUrl ? { backgroundImage: `url("${profile.avatarUrl}")` } : undefined}
                >
                  {profile.avatarUrl ? null : initials}
                </div>
                <div className="pb-1">
                  <p className="text-xs font-black uppercase tracking-[0.15em] text-indigo-600">{copy.capabilityProfile}</p>
                  <h1 className="mt-2 text-4xl font-black tracking-[-0.045em] sm:text-5xl">{profile.displayName}</h1>
                  <p className="mt-2 text-sm font-bold text-[var(--muted)]">@{profile.handle}</p>
                </div>
              </div>
              {viewerIsOwner ? (
                <Link
                  href={`/${locale}/onboarding?step=1`}
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--foreground)] px-6 text-sm font-black text-white"
                >
                  {copy.editProfile}
                </Link>
              ) : null}
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {profile.identityType ? (
                <span className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-800">
                  {mappedLabel(identityTypes, profile.identityType)}
                </span>
              ) : null}
              {profile.ageRange ? <span className="rounded-full bg-white px-4 py-2 text-sm font-bold shadow-sm">{profile.ageRange}</span> : null}
              <span className="rounded-full bg-white px-4 py-2 text-sm font-bold shadow-sm">{location || copy.locationUnknown}</span>
              {profile.location.timezone ? <span className="rounded-full bg-white px-4 py-2 text-sm font-bold shadow-sm">{profile.location.timezone}</span> : null}
            </div>

            <p className="mt-7 max-w-3xl text-lg leading-8 text-[var(--muted)]">{profile.bio || copy.bioFallback}</p>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.38fr]">
          <div className="space-y-6">
            <section className="rounded-[2rem] border border-[var(--border)] bg-white/76 p-6 sm:p-8">
              <h2 className="text-2xl font-black tracking-[-0.03em]">{copy.skills}</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {profile.skills.map((skill) => (
                  <article key={skill.slug} className="rounded-3xl border border-[var(--border)] bg-white p-5">
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-indigo-600">{skill.category}</p>
                    <h3 className="mt-2 text-lg font-black">{locale === "zh" ? skill.nameZh : skill.nameEn}</h3>
                    <p className="mt-2 text-sm font-semibold text-[var(--muted)]">{mappedLabel(skillLevels, skill.level, skill.level)}</p>
                    {skill.evidenceUrl ? (
                      <a href={skill.evidenceUrl} target="_blank" rel="noreferrer noopener" className="mt-5 inline-flex text-sm font-black text-indigo-700">
                        {copy.evidence} ↗
                      </a>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>

            <section className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-[2rem] border border-[var(--border)] bg-white/76 p-6 sm:p-8">
                <h2 className="text-xl font-black">{copy.interests}</h2>
                <div className="mt-5 flex flex-wrap gap-2">
                  {profile.interests.map((interest) => (
                    <span key={interest} className="rounded-full bg-violet-50 px-4 py-2 text-sm font-bold text-violet-800">
                      {mappedLabel(interestLabels, interest, interest)}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-[2rem] border border-[var(--border)] bg-white/76 p-6 sm:p-8">
                <h2 className="text-xl font-black">{copy.languages}</h2>
                <div className="mt-5 flex flex-wrap gap-2">
                  {profile.languages.map((language) => (
                    <span key={language} className="rounded-full bg-cyan-50 px-4 py-2 text-sm font-bold text-cyan-800">{language.toUpperCase()}</span>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-[2rem] bg-[#17152d] p-6 text-white sm:p-8">
              <h2 className="text-xl font-black">{copy.availability}</h2>
              <p className="mt-5 text-4xl font-black">{profile.weeklyHours ?? "—"}</p>
              <p className="mt-1 text-sm font-semibold text-white/55">{copy.hoursPerWeek}</p>
              <p className="mt-7 text-xs font-black uppercase tracking-[0.12em] text-violet-300">{copy.collaboration}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {profile.collaborationLevels.map((level) => (
                  <span key={level} className="rounded-full bg-white/10 px-3 py-2 text-xs font-bold">
                    {mappedLabel(collaborationLabels, level, level)}
                  </span>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-[var(--border)] bg-white/76 p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-black">{copy.completeness}</h2>
                <strong className="text-2xl font-black text-emerald-700">{completeness}%</strong>
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-emerald-100">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${completeness}%` }} />
              </div>
              <p className="mt-4 text-xs leading-5 text-[var(--muted)]">{copy.completenessDescription}</p>
            </section>

            {links.length ? (
              <section className="rounded-[2rem] border border-[var(--border)] bg-white/76 p-6 sm:p-8">
                <h2 className="text-xl font-black">{copy.links}</h2>
                <div className="mt-5 flex flex-wrap gap-2">
                  {links.map(([label, href]) => <ExternalLink key={label} href={href}>{label}</ExternalLink>)}
                </div>
              </section>
            ) : null}
          </aside>
        </div>
      </div>
    </main>
  );
}
