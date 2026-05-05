export class TAbstractFile {
  path = '';
  name = '';
}

export class TFile extends TAbstractFile {
  extension = 'md';
  basename = '';
  stat = { mtime: 0, ctime: 0, size: 0 };
}

export class TFolder extends TAbstractFile {
  children: TAbstractFile[] = [];
}

export class Plugin {}
export class PluginSettingTab {}
export class ItemView {
  contentEl: any = {
    empty: () => {},
    createEl: (tag: string, opts?: any) => {
      const el: any = { className: '', textContent: '', appendChild: () => {}, addEventListener: () => {}, classList: { add: () => {}, remove: () => {} } };
      if (opts?.cls) el.className = opts.cls;
      if (opts?.text) el.textContent = opts.text;
      el.createEl = ItemView.prototype.contentEl?.createEl ?? (() => el);
      return el;
    },
    appendChild: () => {},
  };
  app: any;
  leaf: any;
  constructor(leaf: any) { this.leaf = leaf; }
}
export class WorkspaceLeaf {}
export class Setting {
  constructor(_containerEl: any) {}
  setName(_name: string) { return this; }
  setDesc(_desc: string) { return this; }
  addText(cb: (text: any) => any) {
    cb({ setValue: () => ({ onChange: () => ({}) }) });
    return this;
  }
}
export class Notice {
  constructor(_msg: string) {}
}
