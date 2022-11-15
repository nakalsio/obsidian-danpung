import { SuggestModal, Notice, MarkdownView } from "obsidian";
import { Link } from "./extlnklib";
import DanpungPlugin from "./main";

export class LinkSuggestionModal extends SuggestModal<Link> {
	getSuggestions(query: string): Link[] | Promise<Link[]> {
		return this.plugin.linkIndexer.linkStore.filter((link) =>
		link.Text.toLowerCase().includes(query.toLowerCase()) ||
		link.Path.toLowerCase().includes(query.toLowerCase()) ||
		link.FilePath.toLowerCase().includes(query.toLowerCase())
	  );
	}
	renderSuggestion(value: Link, el: HTMLElement) {
		el.createEl("div", { text: `${value.Text} (${value.FilePath})` });
		el.createEl("small", { text: value.Path });
	}
	onChooseSuggestion(item: Link, evt: MouseEvent | KeyboardEvent) {
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (view) {
			view.editor.replaceSelection(`[${item.Text}](${item.Path})`);
		}
	}
	constructor(public plugin: DanpungPlugin) {
		super(plugin.app);
	}
}
