export type Locale = "zh" | "en";

export interface ProjectContent {
  slug: string;
  category: Record<Locale, string>;
  title: Record<Locale, string>;
  summary: Record<Locale, string>;
  collaborationLevel: "interest" | "short-term" | "long-term";
  duration: Record<Locale, string>;
  memberCount: number;
  requiredSkills: Record<Locale, string[]>;
  languages: string[];
  matchScore: number;
  activity: Record<Locale, string>;
  accent: string;
}

export interface DreamCrewDictionary {
  brand: {
    name: string;
    chineseName: string;
    slogan: string;
  };
  navigation: {
    home: string;
    projects: string;
    publish: string;
    collaborate: string;
    profile: string;
    signIn: string;
    join: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    primaryAction: string;
    secondaryAction: string;
    proof: string;
  };
  participation: {
    title: string;
    description: string;
    founder: {
      label: string;
      title: string;
      description: string;
      action: string;
    };
    contributor: {
      label: string;
      title: string;
      description: string;
      action: string;
    };
  };
  featured: {
    eyebrow: string;
    title: string;
    description: string;
    viewAll: string;
    match: string;
    members: string;
    needs: string;
  };
  process: {
    eyebrow: string;
    title: string;
    steps: [string, string][];
  };
  cohort: {
    eyebrow: string;
    title: string;
    description: string;
    points: string[];
    action: string;
  };
  trust: {
    title: string;
    description: string;
    disclaimer: string;
  };
  projectsPage: {
    eyebrow: string;
    title: string;
    description: string;
    filters: string[];
    emptyNote: string;
  };
  common: {
    languageSwitch: string;
    remote: string;
    learnMore: string;
    shortTerm: string;
    longTerm: string;
    interest: string;
  };
}
