import { OnboardingForms, type OnboardingProfileData, type SelectedSkill, type SkillOption } from "@/components/onboarding-forms";
import { onboardingCopy } from "@/content/onboarding-copy.mjs";
import { requireAuthenticatedUser } from "@/lib/auth/require-user";
import { normalizeLocale } from "@/lib/i18n.mjs";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Locale } from "@/types/content";

export const dynamic = "force-dynamic";

interface OnboardingPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function requestedStep(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const number = Number(raw);
  return number === 1 || number === 2 || number === 3 ? number : null;
}

export default async function OnboardingPage({ params, searchParams }: OnboardingPageProps) {
  const [{ locale: rawLocale }, query] = await Promise.all([params, searchParams]);
  const locale = normalizeLocale(rawLocale) as Locale;
  const userId = await requireAuthenticatedUser(locale, `/${locale}/onboarding`);
  const supabase = await createServerSupabaseClient();

  const [profileResult, skillsResult, selectedSkillsResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
    supabase
      .from("skills")
      .select("id,name_zh,name_en,category")
      .eq("is_active", true)
      .order("category")
      .order("name_en"),
    supabase
      .from("profile_skills")
      .select("skill_id,skill_level,evidence_url")
      .eq("user_id", userId),
  ]);

  const profile = (profileResult.data ?? {}) as OnboardingProfileData & { onboarding_step?: number | null };
  const completedStep = Number(profile.onboarding_step ?? 0);
  const firstIncomplete = Math.min(3, Math.max(1, completedStep + 1)) as 1 | 2 | 3;
  const allowedStep = completedStep >= 3 ? 3 : firstIncomplete;
  const requested = requestedStep(query.step);
  const step = requested && (completedStep >= 3 || requested <= allowedStep) ? requested : firstIncomplete;
  const copy = onboardingCopy[locale];

  return (
    <main className="px-5 py-12 lg:px-8 lg:py-18">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-600">{copy.eyebrow}</p>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.045em] sm:text-5xl">{copy.title}</h1>
          <p className="mt-4 text-lg leading-8 text-[var(--muted)]">{copy.description}</p>
        </div>

        <ol className="mt-10 grid gap-3 sm:grid-cols-3" aria-label="Onboarding progress">
          {copy.progress.map((label, index) => {
            const itemStep = (index + 1) as 1 | 2 | 3;
            const active = itemStep === step;
            const complete = itemStep <= completedStep;
            return (
              <li
                key={label}
                className={`rounded-2xl border px-4 py-4 text-sm font-black ${
                  active
                    ? "border-indigo-300 bg-indigo-50 text-indigo-800"
                    : complete
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-[var(--border)] bg-white/60 text-[var(--muted)]"
                }`}
              >
                <span className="mr-2">{complete ? "✓" : itemStep}</span>{label}
              </li>
            );
          })}
        </ol>

        <section className="mt-8 rounded-[2.2rem] border border-[var(--border)] bg-white/68 p-5 shadow-[var(--shadow)] sm:p-8 lg:p-10">
          <div className="mb-7 flex items-center justify-between">
            <p className="text-sm font-black text-indigo-700">{copy.step} {step}/3</p>
            <div className="h-2 w-32 overflow-hidden rounded-full bg-indigo-100">
              <div className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-500" style={{ width: `${(step / 3) * 100}%` }} />
            </div>
          </div>
          <OnboardingForms
            locale={locale}
            step={step}
            profile={profile}
            skills={(skillsResult.data ?? []) as SkillOption[]}
            selectedSkills={(selectedSkillsResult.data ?? []) as SelectedSkill[]}
          />
        </section>
      </div>
    </main>
  );
}
