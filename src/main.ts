import { App, Notice, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';
import { LinkIndexer, Link, LinkType, getLinks } from './extlnklib';
import { LinkSuggestionModal } from './suggestion';

// Remember to rename these classes and interfaces!

interface DanpungPluginSettings {
	onlyFullLink: boolean;
	linkStore: Link[];
}

const DEFAULT_SETTINGS: DanpungPluginSettings = {
	onlyFullLink: true,
	linkStore: [],
}

export default class DanpungPlugin extends Plugin {

	settings: DanpungPluginSettings;
	linkIndexer: LinkIndexer;
	statusBarItemEl: HTMLElement;

	async onload() {

		console.log('loading plugin');

		await this.loadSettings();

		this.linkIndexer = new LinkIndexer(this, this.settings.linkStore);

		await this.collectExtLinks().then(() => {
			this.saveSettings();
		});

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('leaf', 'Open Danpung Dashboard', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('You clicked me!!!');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		this.statusBarItemEl = this.addStatusBarItem();
		this.statusBarItemEl.setText(`External Links: ${this.linkIndexer.linkStore.length}`);

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-ext-link-suggestion-modal',
			name: 'Open external link suggestions',
			hotkeys: [{ modifiers: ["Shift", "Alt"], key: ";" }],
			callback: () => {
				new LinkSuggestionModal(this).open();
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new DanpungPluginSettingTab(this.app, this));

	}

	onunload() {
		this.saveSettings();
		console.log("unloading plugin");
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async collectExtLinks() {
		this.app.vault.getMarkdownFiles().forEach((file) => {
			this.app.vault.cachedRead(file).then((content) => {
				let mode = LinkType.FQL;
				if (!this.settings.onlyFullLink) {
					mode = LinkType.FQLRelative;
				}
				this.linkIndexer.updateStore(file.path, getLinks(content, file.path, mode));

				const tags = this.app.metadataCache.getCache(file.path)?.tags;
				if (tags) {
					this.linkIndexer.updateTags(file.path, tags.map((tag) => tag.tag));
				}
			});
		});
	}
}

class DanpungPluginSettingTab extends PluginSettingTab {
	plugin: DanpungPlugin;

	constructor(app: App, plugin: DanpungPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Settings for indexing links.' });

		new Setting(containerEl)
			.setName('Only Full Links')
			.setDesc('Only show full links starting with http(s) will be collected.')
			.addToggle((toggle) => toggle
				.setValue(this.plugin.settings.onlyFullLink)
				.onChange(async (value) => {
					console.log('Only Full Links Toggled: ' + value);
					this.plugin.settings.onlyFullLink = value;
					await this.plugin.saveSettings();
				}));
	}
}
