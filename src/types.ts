export interface FaruConfig {
  backlogDir: string;
  cardCategories: string[];
  archiveDoneAfterDays?: number;
}

export interface FaruCard {
  folderPath: string;
  filePath: string;
  title: string;
  type: string;
  status: FaruColumn;
  assigned: string;
  created: string;
  edited?: string;
  description: string;
  links?: string[];
  milestones?: { total: number; completed: number };
}

export type FaruColumn = 'todo' | 'wip' | 'done';

export interface FaruSettings {
  configPath: string;
  defaultAssignee: string;
  activeBacklogId: string;
}

export interface DiscoveredBacklog {
  configPath: string;   // '' si détecté par heuristique
  backlogDir: string;   // chemin résolu relatif à la racine du vault
  displayName: string;
}

export const FARU_VIEW_TYPE = 'faru-board';

export const FARU_DEFAULTS: FaruConfig = {
  backlogDir: './backlog',
  cardCategories: ['product', 'ops', 'bug'],
  archiveDoneAfterDays: 14,
};
