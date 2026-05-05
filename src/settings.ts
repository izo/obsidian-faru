import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { FaruConfig, FaruSettings, FARU_DEFAULTS } from './types';

function isValidVaultPath(path: string): boolean {
  return (
    path.length > 0 &&
    !path.startsWith('/') &&
    !path.includes('\\') &&
    !path.split('/').some((seg) => seg === '..')
  );
}

export async function loadFaruConfig(app: App, configPath: string): Promise<FaruConfig> {
  const safePath = isValidVaultPath(configPath) ? configPath : 'faru.config.json';
  try {
    const raw = await app.vault.adapter.read(safePath);
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const config: FaruConfig = { ...FARU_DEFAULTS };

    if (typeof parsed['backlogDir'] === 'string') {
      const dir = (parsed['backlogDir'] as string).replace(/^\.\//, '');
      if (isValidVaultPath(dir)) config.backlogDir = parsed['backlogDir'] as string;
    }
    if (
      Array.isArray(parsed['cardCategories']) &&
      (parsed['cardCategories'] as unknown[]).every((c) => typeof c === 'string')
    ) {
      config.cardCategories = parsed['cardCategories'] as string[];
    }
    if (
      typeof parsed['archiveDoneAfterDays'] === 'number' &&
      (parsed['archiveDoneAfterDays'] as number) > 0
    ) {
      config.archiveDoneAfterDays = parsed['archiveDoneAfterDays'] as number;
    }
    return config;
  } catch {
    console.warn('[Faru] Could not read config, using defaults.');
    return { ...FARU_DEFAULTS };
  }
}

export class FaruSettingTab extends PluginSettingTab {
  private plugin: Plugin & { settings: FaruSettings; faruConfig: FaruConfig; saveSettings(): Promise<void> };

  constructor(
    app: App,
    plugin: Plugin & { settings: FaruSettings; faruConfig: FaruConfig; saveSettings(): Promise<void> }
  ) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName('Config file path')
      .setDesc('Path to faru.config.json relative to the vault root.')
      .addText((text) =>
        text
          .setValue(this.plugin.settings.configPath)
          .onChange(async (value) => {
            const trimmed = value.trim() || 'faru.config.json';
            this.plugin.settings.configPath = isValidVaultPath(trimmed) ? trimmed : 'faru.config.json';
            await this.plugin.saveSettings();
            this.plugin.faruConfig = await loadFaruConfig(this.app, this.plugin.settings.configPath);
          })
      );

    new Setting(containerEl)
      .setName('Default assignee')
      .setDesc('Assignee pre-filled when creating a new card.')
      .addText((text) =>
        text
          .setValue(this.plugin.settings.defaultAssignee)
          .onChange(async (value) => {
            this.plugin.settings.defaultAssignee = value.trim();
            await this.plugin.saveSettings();
          })
      );
  }
}
