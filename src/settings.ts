import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { FaruConfig, FaruSettings, FARU_DEFAULTS } from './types';

export async function loadFaruConfig(app: App, configPath: string): Promise<FaruConfig> {
  try {
    const raw = await app.vault.adapter.read(configPath);
    const parsed = JSON.parse(raw) as Partial<FaruConfig>;
    return { ...FARU_DEFAULTS, ...parsed };
  } catch {
    console.warn(`[Faru] Could not read ${configPath}, using defaults.`);
    return { ...FARU_DEFAULTS };
  }
}

export class FaruSettingTab extends PluginSettingTab {
  private plugin: Plugin & { settings: FaruSettings; faruConfig: FaruConfig; saveSettings(): Promise<void> };

  constructor(app: App, plugin: Plugin & { settings: FaruSettings; faruConfig: FaruConfig; saveSettings(): Promise<void> }) {
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
            this.plugin.settings.configPath = value.trim() || 'faru.config.json';
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
