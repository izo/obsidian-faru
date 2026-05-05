import { App, TFile } from 'obsidian';
import { FaruCard } from '../types';

export function createCardTile(app: App, card: FaruCard, categories: string[]): HTMLElement {
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

  if (card.assigned) {
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

  el.addEventListener('click', () => {
    app.workspace.openLinkText(card.filePath, '', false);
  });

  return el;
}

function openMilestonesFile(app: App, card: FaruCard): void {
  const dir = card.folderPath;
  const allFiles = app.vault.getFiles().filter(
    (f: TFile) => f.path.startsWith(dir + '/') && f.name.endsWith('-milestones.md')
  );
  if (allFiles.length > 0) {
    app.workspace.openLinkText(allFiles[0].path, '', false);
  }
}
