export type ProjectSource = "hosted" | "demo";
export type ProjectStatus = "draft" | "published" | "paused" | "closed" | "archived";
export type PublicProjectStatus = "published" | "closed";
export type CollaborationLevel = "meet-peers" | "short-term" | "long-term";
export type LocationMode = "remote" | "hybrid" | "local";
export type ProjectStage = "idea" | "research" | "prototype" | "testing" | "users";
export type ProjectLanguage = "zh" | "en";
export type RoleStatus = "open" | "paused" | "filled";

export interface PublicProjectOwner {
  displayName: string;
  handle: string;
}

export interface PublicProjectRole {
  title: string;
  description: string;
  requiredSkillSlugs: string[];
  preferredSkillSlugs: string[];
  headcount: number;
  weeklyHours: number;
  locationMode: LocationMode;
  languageRequirements: ProjectLanguage[];
  status: RoleStatus;
}

export interface PublicProject {
  source: ProjectSource;
  slug: string;
  title: string;
  summary: string;
  category: string;
  stage: ProjectStage | string;
  primaryLanguage: ProjectLanguage;
  secondaryLanguage: ProjectLanguage | null;
  problem: string;
  targetAudience: string;
  expectedOutcome: string;
  founderContribution: string;
  resources: string;
  risks: string;
  firstMilestone: string;
  evidenceLinks: string[];
  collaborationLevel: CollaborationLevel | null;
  durationDays: number | null;
  weeklyHours: number | null;
  locationMode: LocationMode | null;
  compensationType: string | null;
  compensationDetails: string;
  status: PublicProjectStatus;
  publishedAt: string;
  updatedAt: string;
  owner: PublicProjectOwner;
  roles: PublicProjectRole[];
}

export interface ProjectCardView {
  source: ProjectSource;
  slug: string;
  title: string;
  summary: string;
  category: string;
  stage: ProjectStage | string;
  collaborationLevel: CollaborationLevel | null;
  durationDays: number | null;
  weeklyHours: number | null;
  locationMode: LocationMode | null;
  primaryLanguage: ProjectLanguage;
  status: PublicProjectStatus;
  updatedAt: string;
  owner: PublicProjectOwner;
  openRoleCount: number;
  requiredSkillSlugs: string[];
}

export interface ProjectDraftValue {
  title: string;
  summary: string;
  category: string;
  stage: ProjectStage;
  primaryLanguage: ProjectLanguage;
  secondaryLanguage: ProjectLanguage | null;
  problem: string;
  targetAudience: string;
  expectedOutcome: string;
  founderContribution: string;
  resources: string;
  risks: string;
  firstMilestone: string;
  evidenceLinks: string[];
  collaborationLevel: CollaborationLevel | null;
  durationDays: number | null;
  weeklyHours: number | null;
  locationMode: LocationMode | null;
  compensationType: string | null;
  compensationDetails: string;
}

export interface OwnedProjectRoleValue {
  title: string;
  description: string;
  requiredSkillSlugs: string[];
  preferredSkillSlugs: string[];
  headcount: number;
  weeklyHours: number;
  locationMode: LocationMode;
  languageRequirements: ProjectLanguage[];
  status: RoleStatus;
}
