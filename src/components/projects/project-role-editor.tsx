"use client";

import type { OwnedProjectRoleValue } from "@/types/projects";

export interface ProjectSkillOption {
  slug: string;
  label: string;
}

interface ProjectRoleEditorProps {
  index: number;
  role: OwnedProjectRoleValue;
  skills: ProjectSkillOption[];
  copy: {
    title: string;
    description: string;
    requiredSkills: string;
    preferredSkills: string;
    headcount: string;
    weeklyHours: string;
    locationMode: string;
    languages: string;
    status: string;
    remove: string;
  };
  onChange: (index: number, role: OwnedProjectRoleValue) => void;
  onRemove: (index: number) => void;
}

function toggleValue(values: string[], value: string, checked: boolean) {
  return checked
    ? [...new Set([...values, value])]
    : values.filter((item) => item !== value);
}

export function ProjectRoleEditor({
  index,
  role,
  skills,
  copy,
  onChange,
  onRemove,
}: ProjectRoleEditorProps) {
  const update = <Key extends keyof OwnedProjectRoleValue>(
    key: Key,
    value: OwnedProjectRoleValue[Key],
  ) => onChange(index, { ...role, [key]: value });

  return (
    <article className="rounded-3xl border border-[var(--border)] bg-white/85 p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-black text-indigo-700">Role {index + 1}</p>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="rounded-full border border-rose-200 px-4 py-2 text-xs font-black text-rose-700 hover:bg-rose-50"
        >
          {copy.remove}
        </button>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-bold">
          {copy.title}
          <input
            value={role.title}
            onChange={(event) => update("title", event.target.value)}
            className="mt-2 min-h-12 w-full rounded-2xl border border-[var(--border)] px-4 outline-none focus:border-indigo-400"
          />
        </label>
        <label className="text-sm font-bold">
          {copy.headcount}
          <input
            type="number"
            min={1}
            max={10}
            value={role.headcount}
            onChange={(event) => update("headcount", Number(event.target.value))}
            className="mt-2 min-h-12 w-full rounded-2xl border border-[var(--border)] px-4 outline-none focus:border-indigo-400"
          />
        </label>
      </div>

      <label className="mt-5 block text-sm font-bold">
        {copy.description}
        <textarea
          rows={4}
          value={role.description}
          onChange={(event) => update("description", event.target.value)}
          className="mt-2 w-full rounded-2xl border border-[var(--border)] px-4 py-3 outline-none focus:border-indigo-400"
        />
      </label>

      <div className="mt-5 grid gap-5 sm:grid-cols-3">
        <label className="text-sm font-bold">
          {copy.weeklyHours}
          <input
            type="number"
            min={1}
            max={40}
            value={role.weeklyHours}
            onChange={(event) => update("weeklyHours", Number(event.target.value))}
            className="mt-2 min-h-12 w-full rounded-2xl border border-[var(--border)] px-4"
          />
        </label>
        <label className="text-sm font-bold">
          {copy.locationMode}
          <select
            value={role.locationMode}
            onChange={(event) => update("locationMode", event.target.value as OwnedProjectRoleValue["locationMode"])}
            className="mt-2 min-h-12 w-full rounded-2xl border border-[var(--border)] px-4"
          >
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="local">Local</option>
          </select>
        </label>
        <label className="text-sm font-bold">
          {copy.status}
          <select
            value={role.status}
            onChange={(event) => update("status", event.target.value as OwnedProjectRoleValue["status"])}
            className="mt-2 min-h-12 w-full rounded-2xl border border-[var(--border)] px-4"
          >
            <option value="open">Open</option>
            <option value="paused">Paused</option>
            <option value="filled">Filled</option>
          </select>
        </label>
      </div>

      <fieldset className="mt-5">
        <legend className="text-sm font-black">{copy.requiredSkills}</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {skills.map((skill) => (
            <label key={`required-${skill.slug}`} className="cursor-pointer rounded-full border border-[var(--border)] px-3 py-2 text-xs font-bold">
              <input
                type="checkbox"
                checked={role.requiredSkillSlugs.includes(skill.slug)}
                onChange={(event) => update(
                  "requiredSkillSlugs",
                  toggleValue(role.requiredSkillSlugs, skill.slug, event.target.checked),
                )}
                className="mr-2"
              />
              {skill.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-5">
        <legend className="text-sm font-black">{copy.preferredSkills}</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {skills.map((skill) => (
            <label key={`preferred-${skill.slug}`} className="cursor-pointer rounded-full border border-[var(--border)] px-3 py-2 text-xs font-bold">
              <input
                type="checkbox"
                checked={role.preferredSkillSlugs.includes(skill.slug)}
                onChange={(event) => update(
                  "preferredSkillSlugs",
                  toggleValue(role.preferredSkillSlugs, skill.slug, event.target.checked),
                )}
                className="mr-2"
              />
              {skill.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-5">
        <legend className="text-sm font-black">{copy.languages}</legend>
        <div className="mt-3 flex gap-3">
          {["zh", "en"].map((language) => (
            <label key={language} className="rounded-full border border-[var(--border)] px-4 py-2 text-xs font-bold uppercase">
              <input
                type="checkbox"
                checked={role.languageRequirements.includes(language as "zh" | "en")}
                onChange={(event) => update(
                  "languageRequirements",
                  toggleValue(role.languageRequirements, language, event.target.checked) as ("zh" | "en")[],
                )}
                className="mr-2"
              />
              {language}
            </label>
          ))}
        </div>
      </fieldset>
    </article>
  );
}
