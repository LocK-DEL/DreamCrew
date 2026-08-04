export interface ProjectActionState {
  ok: boolean;
  projectId?: string;
  redirectTo?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
}

export const initialProjectActionState: ProjectActionState = { ok: false };
