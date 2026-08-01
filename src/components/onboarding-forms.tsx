"use client";

import Link from "next/link";
import { useActionState } from "react";
import { onboardingCopy } from "@/content/onboarding-copy.mjs";
import { EMPTY_ONBOARDING_STATE } from "@/lib/profile/action-state";
import type { Locale } from "@/types/content";
import {
  saveCollaborationStep,
  saveIdentityStep,
  saveSkillsStep,
} from "@/app/[locale]/onboarding/actions";

export interface OnboardingProfileData {
  display_name?: string | null;
  age_range?: string | null;
  identity_type?: string | null;
  country_code?: string | null;
  city?: string | null;
  timezone?: string | null;
  languages?: string[] | null;
  portfolio_url?: string | null;
  github_url?: string | null;
  linkedin_url?: string | null;
  interests?: string[] | null;
  weekly_hours?: number | null;
  collaboration_levels?: string[] | null;
  bio?: string | null;
  is_public?: boolean | null;
}

export interface SkillOption {
  id: number;
  name_zh: string;
  name_en: string;
  category: string;
}

export interface SelectedSkill {
  skill_id: number;
  skill_level: string;
  evidence_url: string | null;
}

interface OnboardingFormsProps {
  locale: Locale;
  step: 1 | 2 | 3;
  profile: OnboardingProfileData;
  skills: SkillOption[];
  selectedSkills: SelectedSkill[];
}

const inputClass =
  "mt-2 min-h-12 w-full rounded-2xl border border-[var(--border)] bg-white px-4 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100";
const groupClass = "rounded-3xl border border-[var(--border)] bg-white/76 p-5 sm:p-6";

function ErrorText({ code, locale }: { code?: string; locale: Locale }) {
  if (!code) return null;
  const messages = onboardingCopy[locale].errors as Record<string, string>;
  return <p className="mt-2 text-sm font-semibold text-rose-700">{messages[code] ?? messages.save_failed}</p>;
}

function SubmitButton({ pending, locale, finish = false }: { pending: boolean; locale: Locale; finish?: boolean }) {
  const copy = onboardingCopy[locale];
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-13 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-7 text-sm font-black text-white shadow-lg shadow-violet-500/20 disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? copy.saving : finish ? copy.finish : copy.continue}
    </button>
  );
}

function IdentityForm({ locale, profile }: Pick<OnboardingFormsProps, "locale" | "profile">) {
  const copy = onboardingCopy[locale];
  const [state, action, pending] = useActionState(saveIdentityStep, EMPTY_ONBOARDING_STATE);
  const languageSet = new Set(profile.languages ?? []);

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="locale" value={locale} />
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={groupClass}>
          <span className="text-sm font-black">{copy.fields.display_name}</span>
          <input className={inputClass} name="display_name" defaultValue={profile.display_name ?? ""} maxLength={80} required />
          <ErrorText code={state.errors.display_name} locale={locale} />
        </label>
        <label className={groupClass}>
          <span className="text-sm font-black">{copy.fields.age_range}</span>
          <select className={inputClass} name="age_range" defaultValue={profile.age_range ?? ""} required>
            <option value="" disabled>—</option>
            {['18-20', '21-24', '25-30'].map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          <ErrorText code={state.errors.age_range} locale={locale} />
        </label>
        <label className={groupClass}>
          <span className="text-sm font-black">{copy.fields.identity_type}</span>
          <select className={inputClass} name="identity_type" defaultValue={profile.identity_type ?? ""} required>
            <option value="" disabled>—</option>
            {Object.entries(copy.identityTypes).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <ErrorText code={state.errors.identity_type} locale={locale} />
        </label>
        <label className={groupClass}>
          <span className="text-sm font-black">{copy.fields.country_code}</span>
          <input className={inputClass} name="country_code" defaultValue={profile.country_code ?? ""} maxLength={2} placeholder="TW" required />
          <ErrorText code={state.errors.country_code} locale={locale} />
        </label>
        <label className={groupClass}>
          <span className="text-sm font-black">{copy.fields.city}</span>
          <input className={inputClass} name="city" defaultValue={profile.city ?? ""} maxLength={80} />
        </label>
        <label className={groupClass}>
          <span className="text-sm font-black">{copy.fields.timezone}</span>
          <select className={inputClass} name="timezone" defaultValue={profile.timezone ?? "Asia/Taipei"} required>
            {['Asia/Taipei', 'Asia/Shanghai', 'Asia/Hong_Kong', 'Asia/Tokyo', 'America/Los_Angeles', 'Europe/London'].map((value) => <option key={value}>{value}</option>)}
          </select>
          <ErrorText code={state.errors.timezone} locale={locale} />
        </label>
      </div>
      <fieldset className={groupClass}>
        <legend className="text-sm font-black">{copy.fields.languages}</legend>
        <div className="mt-4 flex flex-wrap gap-3">
          {[['zh', '中文'], ['en', 'English']].map(([value, label]) => (
            <label key={value} className="flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-sm font-bold">
              <input type="checkbox" name="languages" value={value} defaultChecked={languageSet.has(value)} /> {label}
            </label>
          ))}
        </div>
        <ErrorText code={state.errors.languages} locale={locale} />
      </fieldset>
      <ErrorText code={state.errors._form} locale={locale} />
      <div className="flex justify-end"><SubmitButton pending={pending} locale={locale} /></div>
    </form>
  );
}

function SkillsForm({ locale, profile, skills, selectedSkills }: Omit<OnboardingFormsProps, "step">) {
  const copy = onboardingCopy[locale];
  const [state, action, pending] = useActionState(saveSkillsStep, EMPTY_ONBOARDING_STATE);
  const selected = new Map(selectedSkills.map((skill) => [skill.skill_id, skill]));

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="locale" value={locale} />
      <fieldset className={groupClass}>
        <legend className="text-sm font-black">{copy.fields.skills}</legend>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {skills.map((skill) => {
            const current = selected.get(skill.id);
            return (
              <div key={skill.id} className="rounded-2xl border border-[var(--border)] p-4">
                <label className="flex items-center gap-3 font-black">
                  <input type="checkbox" name="skill_id" value={skill.id} defaultChecked={Boolean(current)} />
                  {locale === "zh" ? skill.name_zh : skill.name_en}
                </label>
                <select className={inputClass} name={`skill_level_${skill.id}`} defaultValue={current?.skill_level ?? "working"}>
                  {Object.entries(copy.skillLevels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
                <input className={inputClass} type="url" name={`evidence_url_${skill.id}`} defaultValue={current?.evidence_url ?? ""} placeholder={copy.fields.evidence_url} />
              </div>
            );
          })}
        </div>
        <ErrorText code={state.errors.skills} locale={locale} />
      </fieldset>
      <div className="grid gap-5 sm:grid-cols-3">
        {(['portfolio_url', 'github_url', 'linkedin_url'] as const).map((field) => (
          <label key={field} className={groupClass}>
            <span className="text-sm font-black">{copy.fields[field]}</span>
            <input className={inputClass} type="url" name={field} defaultValue={profile[field] ?? ""} placeholder="https://" />
            <ErrorText code={state.errors[field]} locale={locale} />
          </label>
        ))}
      </div>
      <ErrorText code={state.errors._form} locale={locale} />
      <div className="flex items-center justify-between">
        <Link href={`/${locale}/onboarding?step=1`} className="text-sm font-black text-[var(--muted)]">← {copy.back}</Link>
        <SubmitButton pending={pending} locale={locale} />
      </div>
    </form>
  );
}

function CollaborationForm({ locale, profile }: Pick<OnboardingFormsProps, "locale" | "profile">) {
  const copy = onboardingCopy[locale];
  const [state, action, pending] = useActionState(saveCollaborationStep, EMPTY_ONBOARDING_STATE);
  const interests = new Set(profile.interests ?? []);
  const collaboration = new Set(profile.collaboration_levels ?? []);

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="locale" value={locale} />
      <fieldset className={groupClass}>
        <legend className="text-sm font-black">{copy.fields.interests}</legend>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {Object.entries(copy.interestOptions).map(([value, label]) => (
            <label key={value} className="flex items-center gap-3 rounded-2xl border border-[var(--border)] px-4 py-3 font-bold">
              <input type="checkbox" name="interests" value={value} defaultChecked={interests.has(value)} /> {label}
            </label>
          ))}
        </div>
        <ErrorText code={state.errors.interests} locale={locale} />
      </fieldset>
      <label className={groupClass}>
        <span className="text-sm font-black">{copy.fields.weekly_hours}</span>
        <input className={inputClass} type="number" name="weekly_hours" min={1} max={40} defaultValue={profile.weekly_hours ?? 5} required />
        <ErrorText code={state.errors.weekly_hours} locale={locale} />
      </label>
      <fieldset className={groupClass}>
        <legend className="text-sm font-black">{copy.fields.collaboration_levels}</legend>
        <div className="mt-4 grid gap-3">
          {Object.entries(copy.collaborationLevels).map(([value, label]) => (
            <label key={value} className="flex items-center gap-3 rounded-2xl border border-[var(--border)] px-4 py-3 font-bold">
              <input type="checkbox" name="collaboration_levels" value={value} defaultChecked={collaboration.has(value)} /> {label}
            </label>
          ))}
        </div>
        <ErrorText code={state.errors.collaboration_levels} locale={locale} />
      </fieldset>
      <label className={groupClass}>
        <span className="text-sm font-black">{copy.fields.bio}</span>
        <textarea className={`${inputClass} min-h-32 py-3`} name="bio" maxLength={500} defaultValue={profile.bio ?? ""} />
        <ErrorText code={state.errors.bio} locale={locale} />
      </label>
      <label className={`${groupClass} flex items-start gap-3`}>
        <input className="mt-1" type="checkbox" name="is_public" defaultChecked={profile.is_public ?? true} />
        <span className="text-sm font-bold leading-6">{copy.fields.is_public}</span>
      </label>
      <ErrorText code={state.errors._form} locale={locale} />
      <div className="flex items-center justify-between">
        <Link href={`/${locale}/onboarding?step=2`} className="text-sm font-black text-[var(--muted)]">← {copy.back}</Link>
        <SubmitButton pending={pending} locale={locale} finish />
      </div>
    </form>
  );
}

export function OnboardingForms(props: OnboardingFormsProps) {
  if (props.step === 1) return <IdentityForm locale={props.locale} profile={props.profile} />;
  if (props.step === 2) return <SkillsForm {...props} />;
  return <CollaborationForm locale={props.locale} profile={props.profile} />;
}
