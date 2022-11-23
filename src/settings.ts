import { PluginSettingTab, App, Setting } from "obsidian";
import DanpungPlugin from "./main";
import { Link } from "./extlnklib";

export interface DanpungPluginSettings {
	onlyFullLink: boolean;
	useSelectedText: boolean;
	htmlAnchorLinks: boolean;
	urlLinks: boolean;
	fuzzySearchTitle: boolean;
	fuzzySearchFilePath: boolean;
	fuzzySearchPath: boolean;
	fuzzySearchTags: boolean;
	linkStore: Link[];
}

export const DEFAULT_SETTINGS: DanpungPluginSettings = {
	onlyFullLink: true,
	useSelectedText: true,
	htmlAnchorLinks: true,
	urlLinks: true,
	fuzzySearchTitle: true,
	fuzzySearchFilePath: false,
	fuzzySearchPath: false,
	fuzzySearchTags: false,
	linkStore: [],
}

export const getFuzzySearchKeys = (settings: DanpungPluginSettings, mustHaveKeys: string[] = []): string[] => {
	const keys: string[] = ['Text'];
	if (settings.fuzzySearchFilePath) {
		keys.push('FilePath');
	}
	if (settings.fuzzySearchPath) {
		keys.push('Path');
	}
	if (settings.fuzzySearchTags) {
		keys.push('Tags');
	}

	mustHaveKeys.forEach((key) => {
		if (!keys.includes(key)) {
			keys.push(key);
		}
	});

	return keys;
}

export class DanpungPluginSettingTab extends PluginSettingTab {
	plugin: DanpungPlugin;

	constructor(app: App, plugin: DanpungPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Setting for indexing markdown links.' });

		new Setting(containerEl)
			.setName('Only Full Links')
			.setDesc('Only show full links starting with http(s) will be collected.')
			.addToggle((toggle) => toggle
				.setValue(this.plugin.settings.onlyFullLink)
				.onChange(async (value) => {
					this.plugin.settings.onlyFullLink = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('HTML anchor links')
			.setDesc('HTML anchor links (e.g. <a href="...">...</a>) will be collected.')
			.addToggle((toggle) => toggle
				.setValue(this.plugin.settings.htmlAnchorLinks)
				.onChange(async (value) => {
					this.plugin.settings.htmlAnchorLinks = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('URL links')
			.setDesc('URL links (e.g. https://obsidian.md/) with fully qualified URL will be collected.')
			.addToggle((toggle) => toggle
				.setValue(this.plugin.settings.htmlAnchorLinks)
				.onChange(async (value) => {
					this.plugin.settings.htmlAnchorLinks = value;
					await this.plugin.saveSettings();
				}));

		containerEl.createEl('h2', { text: 'Setting for markdown link insertion' });

		new Setting(containerEl)
			.setName('Use selected text as link text')
			.setDesc('If selected text is not empty, it will be used as link text.')
			.addToggle((toggle) => toggle
				.setValue(this.plugin.settings.useSelectedText)
				.onChange(async (value) => {
					this.plugin.settings.useSelectedText = value;
					await this.plugin.saveSettings();
				}));

		containerEl.createEl('h2', { text: 'Additonal options for the fuzzy search.' });
		containerEl.createEl('p', { text: 'The fuzzy search always matches the title of the external link.' });

		// new Setting(containerEl)
		// 	.setName('Title Match')
		// 	.setDesc('Match the title of the link.')
		// 	.addToggle((toggle) => toggle
		// 		.setValue(this.plugin.settings.fuzzySearchTitle)
		// 		.onChange(async (value) => {
		// 			this.plugin.settings.fuzzySearchTitle = value;
		// 			await this.plugin.saveSettings();
		// 		}));

		new Setting(containerEl)
			.setName('URL Match')
			.setDesc('Match the URL of the link.')
			.addToggle((toggle) => toggle
				.setValue(this.plugin.settings.fuzzySearchPath)
				.onChange(async (value) => {
					this.plugin.settings.fuzzySearchPath = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('FilePath Match')
			.setDesc('Match the FilePath of the note.')
			.addToggle((toggle) => toggle
				.setValue(this.plugin.settings.fuzzySearchFilePath)
				.onChange(async (value) => {
					this.plugin.settings.fuzzySearchFilePath = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Tags Match')
			.setDesc('Match the Tags found in notes.')
			.addToggle((toggle) => toggle
				.setValue(this.plugin.settings.fuzzySearchTags)
				.onChange(async (value) => {
					this.plugin.settings.fuzzySearchTags = value;
					await this.plugin.saveSettings();
				}));

	}
}
