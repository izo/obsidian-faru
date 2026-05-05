import { ItemView, WorkspaceLeaf } from 'obsidian';
import { FaruCard, FaruColumn, FaruConfig, FARU_VIEW_TYPE } from '../types';
import { parseBacklog } from '../parser';
import { moveCard } from '../actions/moveCard';
import { createCard } from '../actions/createCard';
import { createCardTile } from './CardTile';
import { createFilterBar, FilterState } from './FilterBar';
import { loadFaruConfig } from '../settings';

interface FaruPlugin {
  settings: { configPath: string; defaultAssignee: string };
  faruConfig: FaruConfig;
}

const COLUMNS: { id: FaruColumn; label: string }[] = [
  { id: 'todo', label: 'Todo' },
  { id: 'wip', label: 'WIP' },
  { id: 'done', label: 'Done' },
];

export class BoardView extends ItemView {
  private plugin: FaruPlugin;
  private config: FaruConfig;
  private cards: FaruCard[] = [];
  private filters: FilterState = { types: [], assignees: [] };
  private debounceTimer: number | null = null;

  constructor(leaf: WorkspaceLeaf, plugin: FaruPlugin) {
    super(leaf);
    this.plugin = plugin;
    this.config = plugin.faruConfig;
  }

  getViewType(): string { return FARU_VIEW_TYPE; }
  getDisplayText(): string { return 'Faru Board'; }
  getIcon(): string { return 'kanban'; }

  async onOpen(): Promise<void> {
    await this.refresh();
  }

  async onClose(): Promise<void> {
    if (this.debounceTimer !== null) {
      window.clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }

  async refresh(): Promise<void> {
    this.config = await loadFaruConfig(this.app, this.plugin.settings.configPath);
    this.plugin.faruConfig = this.config;
    this.cards = await parseBacklog(this.app, this.config);
    this.render();
  }

  scheduleRefresh(): void {
    if (this.debounceTimer !== null) window.clearTimeout(this.debounceTimer);
    this.debounceTimer = window.setTimeout(() => {
      this.debounceTimer = null;
      this.refresh();
    }, 300);
  }

  private render(): void {
    const { contentEl } = this;
    contentEl.empty();

    const filtered = this.applyFilters(this.cards);
    const assignees = [...new Set(this.cards.map((c) => c.assigned).filter(Boolean))];

    const filterBar = createFilterBar(
      this.config.cardCategories,
      assignees,
      this.filters,
      (f) => { this.filters = f; this.render(); }
    );
    contentEl.appendChild(filterBar);

    const backlogMissing = this.cards.length === 0;
    if (backlogMissing) {
      this.renderEmptyState(contentEl);
    }

    const board = contentEl.createEl('div', { cls: 'faru-board' });

    for (const col of COLUMNS) {
      const colCards = filtered.filter((c) => c.status === col.id);
      board.appendChild(this.buildColumn(col.id, col.label, colCards));
    }
  }

  private renderEmptyState(container: HTMLElement): void {
    const msg = container.createEl('div', { cls: 'faru-empty-state' });
    msg.createEl('p', { text: 'Dossier backlog introuvable ou vide.' });
    const btn = msg.createEl('button', { text: 'Créer le dossier backlog' });
    btn.addEventListener('click', async () => {
      const dir = this.config.backlogDir.replace(/^\.\//, '');
      await this.app.vault.createFolder(dir);
      await this.refresh();
    });
  }

  private buildColumn(id: FaruColumn, label: string, cards: FaruCard[]): HTMLElement {
    const col = document.createElement('div');
    col.className = 'faru-column';
    col.dataset.column = id;

    const header = col.createEl('div', { cls: 'faru-column-header' });
    header.createEl('span', { cls: 'faru-column-title', text: label });
    header.createEl('span', { cls: 'faru-column-count', text: String(cards.length) });

    const addBtn = header.createEl('button', { cls: 'faru-column-add', text: '+' });
    addBtn.setAttribute('aria-label', `Créer une carte en ${label}`);
    addBtn.addEventListener('click', () => this.openCreateModal(id));

    for (const card of cards) {
      const tile = createCardTile(this.app, card, this.config.cardCategories);
      tile.addEventListener('dragstart', (e) => {
        e.dataTransfer?.setData('text/plain', card.folderPath);
      });
      col.appendChild(tile);
    }

    col.addEventListener('dragover', (e) => {
      e.preventDefault();
      col.classList.add('drag-over');
    });
    col.addEventListener('dragleave', (e) => {
      if (!col.contains(e.relatedTarget as Node)) col.classList.remove('drag-over');
    });
    col.addEventListener('drop', async (e) => {
      e.preventDefault();
      col.classList.remove('drag-over');
      const folderPath = e.dataTransfer?.getData('text/plain');
      if (!folderPath) return;
      const card = this.cards.find((c) => c.folderPath === folderPath);
      if (!card || card.status === id) return;
      await moveCard(this.app, card, id);
      await this.refresh();
    });

    return col;
  }

  private applyFilters(cards: FaruCard[]): FaruCard[] {
    return cards.filter((card) => {
      if (this.filters.types.length > 0 && !this.filters.types.includes(card.type)) return false;
      if (this.filters.assignees.length > 0 && !this.filters.assignees.includes(card.assigned)) return false;
      return true;
    });
  }

  private openCreateModal(defaultStatus: FaruColumn): void {
    const modal = document.createElement('div');
    modal.className = 'faru-modal-overlay';

    const dialog = modal.createEl('div', { cls: 'faru-modal' });
    dialog.createEl('h3', { text: 'Nouvelle carte' });

    const titleInput = dialog.createEl('input') as HTMLInputElement;
    titleInput.type = 'text';
    titleInput.placeholder = 'Titre';
    titleInput.className = 'faru-modal-input';

    const typeSelect = dialog.createEl('select') as HTMLSelectElement;
    typeSelect.className = 'faru-modal-select';
    for (const cat of this.config.cardCategories) {
      const opt = typeSelect.createEl('option') as HTMLOptionElement;
      opt.value = cat;
      opt.textContent = cat;
    }

    const assigneeInput = dialog.createEl('input') as HTMLInputElement;
    assigneeInput.type = 'text';
    assigneeInput.placeholder = 'Assignee';
    assigneeInput.value = this.plugin.settings.defaultAssignee;
    assigneeInput.className = 'faru-modal-input';

    const actions = dialog.createEl('div', { cls: 'faru-modal-actions' });

    const cancelBtn = actions.createEl('button', { text: 'Annuler' });
    cancelBtn.addEventListener('click', () => modal.remove());

    const createBtn = actions.createEl('button', { text: 'Créer', cls: 'faru-modal-primary' });
    createBtn.addEventListener('click', async () => {
      const title = titleInput.value.trim();
      if (!title) return;
      modal.remove();
      const card = await createCard(this.app, this.config, {
        title,
        type: typeSelect.value,
        assigned: assigneeInput.value.trim(),
      });
      if (defaultStatus !== 'todo') {
        await moveCard(this.app, card, defaultStatus);
      }
      await this.refresh();
    });

    document.body.appendChild(modal);
    titleInput.focus();
  }
}
