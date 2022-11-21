import { Plugin } from 'obsidian';
import { ExternalLinkViewer, VIEW_TYPE_EXTERNAL_LINK_VIEWER } from './view';
import { LinkIndexer, LinkType, scanHtmlLinks, scanMarkdownLinks, scanOrphanedLinks } from './extlnklib';
import { DanpungPluginSettingTab, DanpungPluginSettings, DEFAULT_SETTINGS } from './settings';

import { LinkSuggestionModal } from './suggestion';

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

		this.registerView(
			VIEW_TYPE_EXTERNAL_LINK_VIEWER,
			(leaf) => new ExternalLinkViewer(leaf, this)
		);

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('leaf', 'Search External Links', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			this.activateView();
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
		this.addCommand({
			id: 'open-ext-link-viewer',
			name: 'Open external link viewer',
			hotkeys: [{ modifiers: ["Shift", "Alt"], key: "'" }],
			callback: () => {
				this.activateView();
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
				const scanedLinks = scanMarkdownLinks(content, file.path, mode);
				scanedLinks.push(...scanHtmlLinks(content, file.path, mode));
				scanedLinks.push(...scanOrphanedLinks(content, file.path));

				this.linkIndexer.updateStore(file.path, scanedLinks);

				const tags = (this.app.metadataCache.getCache(file.path)?.tags ?? []).filter((tag) => tag.tag).map((tag) => tag.tag);
				const fmTags = this.app.metadataCache.getCache(file.path)?.frontmatter?.tags ?? [];
				tags.push(...fmTags);

				if (tags) {
					this.linkIndexer.updateTags(file.path, tags);
				}
			});
		});
	}

	async activateView() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_EXTERNAL_LINK_VIEWER);

		await this.app.workspace.getRightLeaf(false).setViewState({
			type: VIEW_TYPE_EXTERNAL_LINK_VIEWER,
			active: true,
		});

		this.app.workspace.revealLeaf(
			this.app.workspace.getLeavesOfType(VIEW_TYPE_EXTERNAL_LINK_VIEWER)[0]
		);
	}
}
