"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { projectCopy, projectOptions } from "@/content/project-copy.mjs";
import { initialProjectActionState } from "@/lib/projects/action-state";
import { saveProjectDraft } from "@/app/[locale]/projects/actions";
import type { OwnedProjectRoleValue, ProjectDraftValue } from "@/types/projects";
import { ProjectRoleEditor, type ProjectSkillOption } from "./project-role-editor";

interface ProjectEditorProps {
  locale: "zh" | "en";
  projectId?: string;
  initialProject?: Partial<ProjectDraftValue>;
  initialRoles?: OwnedProjectRoleValue[];
  skills: ProjectSkillOption[];
}

const blankRole = (): OwnedProjectRoleValue => ({
  title: "",
  description: "",
  requiredSkillSlugs: [],
  preferredSkillSlugs: [],
  headcount: 1,
  weeklyHours: 5,
  locationMode: "remote",
  languageRequirements: ["zh"],
  status: "open",
});

function optionLabel(option: readonly string[], locale: "zh" | "en") {
  return String(locale === "zh" ? option[1] : option[2]);
}

export function ProjectEditor({
  locale,
  projectId,
  initialProject = {},
  initialRoles = [],
  skills,
}: ProjectEditorProps) {
  const copy = projectCopy[locale];
  const errorMessages = copy.errors as Record<string, string>;
  const router = useRouter();
  const [roles, setRoles] = useState<OwnedProjectRoleValue[]>(initialRoles.length ? initialRoles : [blankRole()]);
  const [state, formAction, pending] = useActionState(saveProjectDraft, initialProjectActionState);

  useEffect(() => {
    if (state.redirectTo) router.push(state.redirectTo);
  }, [router, state.redirectTo]);

  const updateRole = (index: number, role: OwnedProjectRoleValue) => {
    setRoles((current) => current.map((item, itemIndex) => itemIndex === index ? role : item));
  };

  const removeRole = (index: number) => {
    setRoles((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const field = (name: string) => state.fieldErrors?.[name];
  const labelIndex = locale === "zh" ? 1 : 2;

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="project_id" value={projectId ?? ""} />
      <input type="hidden" name="roles_json" value={JSON.stringify(roles)} />

      <section id="identity" className="rounded-[2rem] border border-[var(--border)] bg-white/90 p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-black tracking-tight">{copy.sections.identity}</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-bold sm:col-span-2">
            {copy.labels.title}
            <input name="title" defaultValue={initialProject.title ?? ""} required maxLength={80} className="mt-2 min-h-12 w-full rounded-2xl border border-[var(--border)] px-4 outline-none focus:border-indigo-400" />
            {field("title") ? <span className="mt-1 block text-xs text-rose-700">{field("title")}</span> : null}
          </label>
          <label className="text-sm font-bold sm:col-span-2">
            {copy.labels.summary}
            <textarea name="summary" defaultValue={initialProject.summary ?? ""} required minLength={20} maxLength={240} rows={3} className="mt-2 w-full rounded-2xl border border-[var(--border)] px-4 py-3 outline-none focus:border-indigo-400" />
            {field("summary") ? <span className="mt-1 block text-xs text-rose-700">{field("summary")}</span> : null}
          </label>
          <label className="text-sm font-bold">
            {copy.labels.category}
            <select name="category" defaultValue={initialProject.category ?? "health-tech"} className="mt-2 min-h-12 w-full rounded-2xl border border-[var(--border)] px-4">
              {projectOptions.categories.map((option) => <option key={option[0]} value={option[0]}>{option[labelIndex]}</option>)}
            </select>
          </label>
          <label className="text-sm font-bold">
            {copy.labels.stage}
            <select name="stage" defaultValue={initialProject.stage ?? "idea"} className="mt-2 min-h-12 w-full rounded-2xl border border-[var(--border)] px-4">
              {projectOptions.stages.map((option) => <option key={option[0]} value={option[0]}>{option[labelIndex]}</option>)}
            </select>
          </label>
          <label className="text-sm font-bold">
            {copy.labels.primaryLanguage}
            <select name="primary_language" defaultValue={initialProject.primaryLanguage ?? locale} className="mt-2 min-h-12 w-full rounded-2xl border border-[var(--border)] px-4">
              <option value="zh">中文</option><option value="en">English</option>
            </select>
          </label>
          <label className="text-sm font-bold">
            {copy.labels.secondaryLanguage}
            <select name="secondary_language" defaultValue={initialProject.secondaryLanguage ?? ""} className="mt-2 min-h-12 w-full rounded-2xl border border-[var(--border)] px-4">
              <option value="">—</option><option value="zh">中文</option><option value="en">English</option>
            </select>
          </label>
        </div>
      </section>

      <section id="outcome" className="rounded-[2rem] border border-[var(--border)] bg-white/90 p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-black tracking-tight">{copy.sections.outcome}</h2>
        <div className="mt-6 grid gap-5">
          {([
            ["problem", copy.labels.problem, initialProject.problem],
            ["target_audience", copy.labels.targetAudience, initialProject.targetAudience],
            ["expected_outcome", copy.labels.expectedOutcome, initialProject.expectedOutcome],
            ["founder_contribution", copy.labels.founderContribution, initialProject.founderContribution],
            ["resources", copy.labels.resources, initialProject.resources],
            ["risks", copy.labels.risks, initialProject.risks],
            ["first_milestone", copy.labels.firstMilestone, initialProject.firstMilestone],
          ] as const).map(([name, label, value]) => (
            <label key={name} className="text-sm font-bold">
              {label}
              <textarea name={name} defaultValue={value ?? ""} rows={4} className="mt-2 w-full rounded-2xl border border-[var(--border)] px-4 py-3 outline-none focus:border-indigo-400" />
              {field(name.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())) ? (
                <span className="mt-1 block text-xs text-rose-700">{field(name.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()))}</span>
              ) : null}
            </label>
          ))}
          <label className="text-sm font-bold">
            {copy.labels.evidenceLinks}
            <textarea name="evidence_links" defaultValue={(initialProject.evidenceLinks ?? []).join("\n")} rows={3} className="mt-2 w-full rounded-2xl border border-[var(--border)] px-4 py-3" />
          </label>
        </div>
      </section>

      <section id="roles" className="rounded-[2rem] border border-[var(--border)] bg-white/70 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-black tracking-tight">{copy.sections.roles}</h2>
          <button type="button" onClick={() => setRoles((current) => [...current, blankRole()])} className="rounded-full bg-indigo-50 px-5 py-3 text-sm font-black text-indigo-700 hover:bg-indigo-100">
            + {copy.role.add}
          </button>
        </div>
        <div className="mt-6 space-y-5">
          {roles.map((role, index) => (
            <ProjectRoleEditor key={index} index={index} role={role} skills={skills} copy={copy.role} onChange={updateRole} onRemove={removeRole} />
          ))}
        </div>
        {field("roles") ? <p className="mt-4 text-sm font-bold text-rose-700">{field("roles")}</p> : null}
      </section>

      <section id="disclosure" className="rounded-[2rem] border border-[var(--border)] bg-white/90 p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-black tracking-tight">{copy.sections.disclosure}</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-bold">
            {copy.labels.collaborationLevel}
            <select name="collaboration_level" defaultValue={initialProject.collaborationLevel ?? "short-term"} className="mt-2 min-h-12 w-full rounded-2xl border border-[var(--border)] px-4">
              {projectOptions.collaborationLevels.map((option) => <option key={option[0]} value={option[0]}>{optionLabel(option, locale)}</option>)}
            </select>
          </label>
          <label className="text-sm font-bold">
            {copy.labels.durationDays}
            <select name="duration_days" defaultValue={initialProject.durationDays ?? 30} className="mt-2 min-h-12 w-full rounded-2xl border border-[var(--border)] px-4">
              <option value="">Open / long term</option><option value="7">7 days</option><option value="30">30 days</option><option value="90">90 days</option>
            </select>
          </label>
          <label className="text-sm font-bold">
            {copy.labels.weeklyHours}
            <input name="weekly_hours" type="number" min={1} max={40} defaultValue={initialProject.weeklyHours ?? 5} className="mt-2 min-h-12 w-full rounded-2xl border border-[var(--border)] px-4" />
          </label>
          <label className="text-sm font-bold">
            {copy.labels.locationMode}
            <select name="location_mode" defaultValue={initialProject.locationMode ?? "remote"} className="mt-2 min-h-12 w-full rounded-2xl border border-[var(--border)] px-4">
              {projectOptions.locationModes.map((option) => <option key={option[0]} value={option[0]}>{optionLabel(option, locale)}</option>)}
            </select>
          </label>
          <label className="text-sm font-bold sm:col-span-2">
            {copy.labels.compensationType}
            <select name="compensation_type" defaultValue={initialProject.compensationType ?? "undecided"} className="mt-2 min-h-12 w-full rounded-2xl border border-[var(--border)] px-4">
              {projectOptions.compensationTypes.map((option) => <option key={option[0]} value={option[0]}>{optionLabel(option, locale)}</option>)}
            </select>
          </label>
          <label className="text-sm font-bold sm:col-span-2">
            {copy.labels.compensationDetails}
            <textarea name="compensation_details" defaultValue={initialProject.compensationDetails ?? ""} rows={4} className="mt-2 w-full rounded-2xl border border-[var(--border)] px-4 py-3" />
          </label>
        </div>
      </section>

      {state.message ? (
        <p role="status" className={`rounded-2xl px-5 py-4 text-sm font-bold ${state.ok ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}>
          {errorMessages[state.message] ?? (state.message === "published" ? copy.published : copy.saved)}
        </p>
      ) : null}

      <div className="sticky bottom-4 flex flex-wrap justify-end gap-3 rounded-3xl border border-[var(--border)] bg-white/95 p-4 shadow-xl backdrop-blur">
        <button name="intent" value="save" disabled={pending} className="rounded-full border border-indigo-200 px-6 py-3 text-sm font-black text-indigo-700 disabled:opacity-50">
          {pending ? copy.saving : copy.save}
        </button>
        <button name="intent" value="publish" disabled={pending} className="rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-black text-white shadow-lg disabled:opacity-50">
          {pending ? copy.saving : copy.publish}
        </button>
      </div>
    </form>
  );
}
