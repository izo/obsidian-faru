import { Plugin, TAbstractFile, WorkspaceLeaf } from 'obsidian';
import { DiscoveredBacklog, FaruConfig, FaruSettings, FARU_DEFAULTS, FARU_VIEW_TYPE } from './types';
import { loadFaruConfig, FaruSettingTab } from './settings';
import { discoverBacklogs } from './discovery';
import { BoardView } from './views/BoardView';

export default class FaruPlugin extends Plugin {
  settings!: FaruSettings;
  faruConfig!: FaruConfig;
  discoveredBacklogs: DiscoveredBacklog[] = [];

  async onload(): Promise<void> {
    await this.loadSettings();
    this.discoveredBacklogs = await discoverBacklogs(this.app);
    this.faruConfig = await this.loadActiveConfig();

    this.registerView(FARU_VIEW_TYPE, (leaf: WorkspaceLeaf) => new BoardView(leaf, this));

    this.addRibbonIcon('kanban', 'Faru Board', () => this.activateView());
    this.addCommand({
      id: 'open-faru-board',
      name: 'Open Faru Board',
      callback: () => this.activateView(),
    });

    this.addSettingTab(new FaruSettingTab(this.app, this));

    this.registerEvent(this.app.vault.on('modify', (file) => this.onFileChange(file)));
    this.registerEvent(this.app.vault.on('create', (file) => this.onFileChange(file)));
    this.registerEvent(this.app.vault.on('delete', (file) => this.onFileChange(file)));
    this.registerEvent(this.app.vault.on('rename', (file) => this.onFileChange(file)));
  }

  async loadActiveConfig(): Promise<FaruConfig> {
    const active =
      this.discoveredBacklogs.find((b) => b.backlogDir === this.settings.activeBacklogId) ??
      this.discoveredBacklogs[0] ??
      null;

    if (active) {
      this.settings.activeBacklogId = active.backlogDir;
      const config = active.configPath
        ? await loadFaruConfig(this.app, active.configPath)
        : { ...FARU_DEFAULTS };
      config.backlogDir = active.backlogDir;
      return config;
    }

    return await loadFaruConfig(this.app, this.settings.configPath);
  }

  async switchBacklog(backlog: DiscoveredBacklog): Promise<void> {
    this.settings.activeBacklogId = backlog.backlogDir;
    await this.saveSettings();
    const config = backlog.configPath
      ? await loadFaruConfig(this.app, backlog.configPath)
      : { ...FARU_DEFAULTS };
    config.backlogDir = backlog.backlogDir;
    this.faruConfig = config;
  }

  async activateView(): Promise<void> {
    const { workspace } = this.app;
    const existing = workspace.getLeavesOfType(FARU_VIEW_TYPE);
    if (existing.length > 0) {
      workspace.revealLeaf(existing[0]);
      return;
    }
    const leaf = workspace.getRightLeaf(false) ?? workspace.getLeaf(true);
    await leaf.setViewState({ type: FARU_VIEW_TYPE, active: true });
    workspace.revealLeaf(leaf);
  }

  private onFileChange(file: TAbstractFile): void {
    const backlogDir = this.faruConfig.backlogDir.replace(/^\.\//, '');
    const isInBacklog = file.path.startsWith(backlogDir + '/');
    const isConfig =
      this.discoveredBacklogs.some((b) => b.configPath && file.path === b.configPath) ||
      file.path === this.settings.configPath;
    if (!isInBacklog && !isConfig) return;

    const leaf = this.app.workspace.getLeavesOfType(FARU_VIEW_TYPE)[0];
    const view = leaf?.view;
    if (view instanceof BoardView) {
      view.scheduleRefresh();
    }
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign(
      { configPath: 'faru.config.json', defaultAssignee: '', activeBacklogId: '' },
      await this.loadData()
    );
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }
}
