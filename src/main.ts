import { App, Editor, MarkdownView, Menu, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';
import { LinkIndexer } from './extlnklib';

// Remember to rename these classes and interfaces!

interface DanpungPluginSettings {
	onlyFullLink: boolean;
}

const DEFAULT_SETTINGS: DanpungPluginSettings = {
	onlyFullLink: true
}

export default class DanpungPlugin extends Plugin {
	settings: DanpungPluginSettings;
	linkIndexer: LinkIndexer;

	async onload() {
		console.log("loading plugin...");

		await this.loadSettings();


		this.linkIndexer = new LinkIndexer(this);

		// this.registerEvent(
		// 	this.app.workspace.on("editor-menu", (menu, editor, view) => {
		// 		menu.addItem((item) => {
		// 			item
		// 				.setTitle("Print file path 👈")
		// 				.setIcon("document")
		// 				.onClick(async () => {
		// 					new Notice(view.file.path);
		// 				});
		// 		});
		// 	})
		// );

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('leaf', 'Open Danpung Dashboard', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('You clicked me!!!');

			// const menu = new Menu();

			// menu.addItem((item) =>
			// 	item
			// 		.setTitle("Copy")
			// 		.setIcon("documents")
			// 		.onClick(() => {
			// 			new Notice("Copied");
			// 		})
			// );

			// menu.addItem((item) =>
			// 	item
			// 		.setTitle("Paste")
			// 		.setIcon("paste")
			// 		.onClick(() => {
			// 			new Notice("Pasted");
			// 		})
			// );

			// menu.showAtMouseEvent(evt);

		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new DanpungPluginSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {
		console.log("unloading plugin");
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
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

			// .addText(text => text
			// 	.setPlaceholder('Only Full Link')
			// 	.setValue(this.plugin.settings.onlyFullLink)
			// 	.onChange(async (value) => {
			// 		console.log('Secret: ' + value);
			// 		this.plugin.settings.mySetting = value;
			// 		await this.plugin.saveSettings();
			// 	}));
	}
}
