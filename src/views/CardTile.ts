import { App, MarkdownView, TFile } from 'obsidian';
import { FaruCard } from '../types';

export function createCardTile(
  app: App,
  card: FaruCard,
  categories: string[],
  uniqueAssignees: string[] = []
): HTMLElement {
  const el = document.createElement('div');
  el.className = 'faru-card';
  el.setAttribute('draggable', 'true');

  const title = el.createEl('div', { cls: 'faru-card-title', text: card.title });
  title.setAttribute('title', card.description || card.title);

  const meta = el.createEl('div', { cls: 'faru-card-meta' });

  if (card.type) {
    const badge = meta.createEl('span', { cls: 'faru-badge-type', text: card.type });
    const idx = (categories.indexOf(card.type) + categories.length) % Math.max(categories.length, 1);
    badge.style.setProperty('--badge-color', `var(--faru-cat-${idx % 6})`);
  }

  if (card.assigned && uniqueAssignees.length > 1) {
    meta.createEl('span', { cls: 'faru-badge-assignee', text: `@${card.assigned}` });
  }

  if (card.milestones) {
    const { completed, total } = card.milestones;
    const badge = meta.createEl('span', {
      cls: 'faru-badge-milestone',
      text: `● ${completed}/${total}`,
    });
    badge.addEventListener('click', (e) => {
      e.stopPropagation();
      openMilestonesFile(app, card);
    });
  }

  el.addEventListener('click', async (e) => {
    await openCardFile(app, card.filePath, e.metaKey || e.ctrlKey);
  });

  return el;
}

async function openCardFile(app: App, filePath: string, newTab: boolean): Promise<void> {
  const file = app.vault.getAbstractFileByPath(filePath);
  if (!(file instanceof TFile)) return;

  if (newTab) {
    await app.workspace.getLeaf('tab').openFile(file);
    return;
  }

  const existing = app.workspace.getLeavesOfType('markdown').find(
    (leaf) => leaf.view instanceof MarkdownView && leaf.view.file?.path === filePath
  );
  if (existing) {
    app.workspace.setActiveLeaf(existing);
    return;
  }

  const target = app.workspace.getMostRecentLeaf() ?? app.workspace.getLeaf('tab');
  await target.openFile(file);
}

async function openMilestonesFile(app: App, card: FaruCard): Promise<void> {
  const dir = card.folderPath;
  const milestonesFile = app.vault
    .getFiles()
    .find((f: TFile) => f.path.startsWith(dir + '/') && f.name.endsWith('-milestones.md'));
  if (milestonesFile) {
    await openCardFile(app, milestonesFile.path, false);
  }
}
