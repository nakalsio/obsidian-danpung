import { MarkdownView, SuggestModal } from "obsidian";

import DanpungPlugin from "./main";
import { Link } from "./extlnklib";
import { search } from './fuzzy';

const defaultSort = (a: Link, b: Link) => {
	return a.Text.localeCompare(b.Text);
}

export class LinkSuggestionModal extends SuggestModal<Link> {

	getSuggestions(query: string): Link[] | Promise<Link[]> {
		if (query == '') {
			return this.plugin.linkIndexer.linkStore.sort(defaultSort);
		}
		return search(this.plugin.linkIndexer.linkStore, query);
	}
	renderSuggestion(value: Link, el: HTMLElement) {
		const titleEl = el.createEl("div");
		titleEl.createEl("span", { text: value.Text, cls: 'link_suggestion_title' });
		titleEl.createEl("span", { text: `  (${value.FilePath})`, cls: 'link_suggestion_filepath' });
		// el.createEl("div", { text: `${value.Text} (${value.FilePath})` });
		el.createEl("div").createEl("small", { text: value.Path, cls: 'link_suggestion_url' });
		const tagsDiv = el.createEl("div");
		value.Tags.forEach((tag) => {
			tagsDiv.createEl("span", { text: tag, cls: 'link_suggestion_tag' })
		})
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
